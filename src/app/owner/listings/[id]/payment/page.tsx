import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { propertyId, ownerClerkId, ownerEmail, ownerName, type, discountCode } = await req.json();
    const isRenewal = type === 'renewal';
    const amount = isRenewal ? 300 : 500;

    const { data: property, error: propErr } = await supabase
      .from('properties').select('*').eq('id', propertyId).single();
    if (propErr) throw new Error(`Property error: ${propErr.message}`);
    if (!property) throw new Error('Property not found');

    // Compute the new expiry: 3 months from now (or from current expiry if renewing an active listing)
    const baseDate = isRenewal && property.expires_at && new Date(property.expires_at) > new Date()
      ? new Date(property.expires_at) : new Date();
    const extendsUntil = new Date(baseDate);
    extendsUntil.setMonth(extendsUntil.getMonth() + 3);

    // ─────────────────────────────────────────────
    // DISCOUNT CODE PATH — if a code is provided, validate and (for 100% off) skip Chapa
    // ─────────────────────────────────────────────
    if (discountCode && discountCode.trim()) {
      const codeInput = discountCode.trim().toUpperCase();

      const { data: codeRow, error: codeErr } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', codeInput)
        .single();

      if (codeErr || !codeRow) {
        return NextResponse.json({ error: 'Invalid promo code. Please check and try again.' }, { status: 400 });
      }
      if (codeRow.used) {
        return NextResponse.json({ error: 'This promo code has already been used.' }, { status: 400 });
      }
      if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
        return NextResponse.json({ error: 'This promo code has expired.' }, { status: 400 });
      }

      const percent = Number(codeRow.discount_percent) || 0;

      // 100% off → no payment needed. Activate the listing directly.
      if (percent >= 100) {
        // Mark the code used FIRST, guarding against double-use (only update if still unused).
        const { data: claimed, error: claimErr } = await supabase
          .from('discount_codes')
          .update({
            used: true,
            used_by_email: ownerEmail || null,
            used_at: new Date().toISOString(),
          })
          .eq('code', codeInput)
          .eq('used', false)        // <-- critical: only succeeds if it was still unused
          .select()
          .single();

        if (claimErr || !claimed) {
          // Someone used it in the meantime, or it was already used
          return NextResponse.json({ error: 'This promo code has already been used.' }, { status: 400 });
        }

        // Activate the listing for 3 months
        const { error: actErr } = await supabase
          .from('properties')
          .update({
            status: 'active',
            expires_at: extendsUntil.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', propertyId);

        if (actErr) {
          // Roll back the code claim so it isn't wasted on a failed activation
          await supabase.from('discount_codes')
            .update({ used: false, used_by_email: null, used_at: null })
            .eq('code', codeInput);
          throw new Error(`Activation error: ${actErr.message}`);
        }

        // Record a zero-amount payment for tracking
        await supabase.from('listing_payments').insert({
          property_id: propertyId,
          owner_clerk_id: ownerClerkId,
          amount: 0,
          type: isRenewal ? 'renewal' : 'new',
          chapa_tx_ref: `Betachen-PROMO-${codeInput}-${Date.now()}`,
          status: 'paid',
          extends_until: extendsUntil.toISOString(),
        });

        // Tell the page to go straight to the success screen (no Chapa)
        return NextResponse.json({
          success: true,
          freeListing: true,
          redirectUrl: `/owner/listings/${propertyId}/payment/success`,
          amount: 0,
          extendsUntil: extendsUntil.toISOString(),
        });
      }

      // Partial discount (less than 100%) → reduce the Chapa amount but still pay.
      // NOTE: your current codes are all 100%, so this branch is a safety net.
      const discountedAmount = Math.max(1, Math.round(amount * (1 - percent / 100)));
      return await startChapa(discountedAmount, isRenewal, property, propertyId, ownerClerkId, ownerEmail, ownerName, extendsUntil, codeInput);
    }

    // ─────────────────────────────────────────────
    // NORMAL PAID PATH (no code) — unchanged behaviour
    // ─────────────────────────────────────────────
    return await startChapa(amount, isRenewal, property, propertyId, ownerClerkId, ownerEmail, ownerName, extendsUntil, null);

  } catch (err: any) {
    console.log('Payment error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Helper: create the listing_payments record + start a Chapa checkout
async function startChapa(
  amount: number,
  isRenewal: boolean,
  property: any,
  propertyId: string,
  ownerClerkId: string,
  ownerEmail: string,
  ownerName: string,
  extendsUntil: Date,
  appliedCode: string | null,
) {
  const txRef = `Betachen-LIST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const { data: payment, error: payErr } = await supabase
    .from('listing_payments').insert({
      property_id: propertyId,
      owner_clerk_id: ownerClerkId,
      amount,
      type: isRenewal ? 'renewal' : 'new',
      chapa_tx_ref: txRef,
      status: 'pending',
      extends_until: extendsUntil.toISOString(),
    }).select().single();
  if (payErr) throw new Error(`Payment record error: ${payErr.message}`);

  const cleanTitle = property.title.replace(/[^a-zA-Z0-9\s\-.]/g, '');
  const chapaPayload = {
    amount: amount.toFixed(2),
    currency: 'ETB',
    email: ownerEmail || 'noreply@Betachen-homes.com',
    first_name: ownerName?.split(' ')[0] || 'Owner',
    last_name: ownerName?.split(' ')[1] || 'User',
    tx_ref: txRef,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/listings/payment/verify`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${propertyId}/payment/success`,
    customization: {
      title: isRenewal ? 'Betachen Listing Renewal' : 'Betachen Listing Fee',
      description: isRenewal
        ? `Renewal 3 months - ${cleanTitle}`
        : `New listing - ${cleanTitle}`,
    }
  };

  const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chapaPayload),
  });
  const chapaData = await chapaRes.json();
  if (chapaData.status !== 'success') {
    throw new Error(`Chapa error: ${JSON.stringify(chapaData)}`);
  }

  await supabase.from('listing_payments').update({
    chapa_checkout_url: chapaData.data.checkout_url
  }).eq('id', payment.id);

  return NextResponse.json({
    success: true,
    checkoutUrl: chapaData.data.checkout_url,
    amount,
    extendsUntil: extendsUntil.toISOString(),
  });
}

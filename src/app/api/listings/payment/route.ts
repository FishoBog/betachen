import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { propertyId, ownerClerkId, ownerEmail, ownerName, type } = await req.json();

    const isRenewal = type === 'renewal';
    const amount = isRenewal ? 300 : 500; // 60% of 500 = 300
    const txRef = `GOJO-LIST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Get property info
    const { data: property } = await supabase.from('properties').select('*').eq('id', propertyId).single();
    if (!property) throw new Error('Property not found');

    // Calculate new expiry
    const baseDate = isRenewal && property.expires_at && new Date(property.expires_at) > new Date()
      ? new Date(property.expires_at)
      : new Date();
    const extendsUntil = new Date(baseDate);
    extendsUntil.setMonth(extendsUntil.getMonth() + 3);

    // Create payment record
    const { data: payment, error: payErr } = await supabase.from('listing_payments').insert({
      property_id: propertyId,
      owner_clerk_id: ownerClerkId,
      amount,
      type: isRenewal ? 'renewal' : 'new',
      chapa_tx_ref: txRef,
      status: 'pending',
      extends_until: extendsUntil.toISOString(),
    }).select().single();

    if (payErr) throw payErr;

    // Initialize Chapa payment
    const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount.toFixed(2),
        currency: 'ETB',
        email: ownerEmail,
        first_name: ownerName.split(' ')[0] || ownerName,
        last_name: ownerName.split(' ')[1] || '',
        tx_ref: txRef,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/listings/payment/verify`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${propertyId}/payment/success`,
        customization: {
          title: isRenewal ? 'ጎጆ Listing Renewal' : 'ጎጆ Listing Fee',
          description: isRenewal
            ? `Renewal for 3 months — ${property.title}`
            : `New listing fee — ${property.title}`,
        }
      })
    });

    const chapaData = await chapaRes.json();
    if (chapaData.status !== 'success') throw new Error(chapaData.message || 'Payment init failed');

    // Save checkout URL
    await supabase.from('listing_payments').update({
      chapa_checkout_url: chapaData.data.checkout_url
    }).eq('id', payment.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: chapaData.data.checkout_url,
      amount,
      extendsUntil: extendsUntil.toISOString()
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

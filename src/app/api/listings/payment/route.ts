import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { propertyId, ownerClerkId, ownerEmail, ownerName, type } = await req.json();

    console.log('Payment init:', { propertyId, ownerClerkId, ownerEmail, ownerName, type });

    const isRenewal = type === 'renewal';
    const amount = isRenewal ? 300 : 500;
    const txRef = `GOJO-LIST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Get property info
    const { data: property, error: propErr } = await supabase
      .from('properties').select('*').eq('id', propertyId).single();

    if (propErr) {
      console.log('Property fetch error:', propErr);
      throw new Error(`Property error: ${propErr.message}`);
    }
    if (!property) throw new Error('Property not found');

    console.log('Property found:', property.title);

    // Calculate new expiry
    const baseDate = isRenewal && property.expires_at && new Date(property.expires_at) > new Date()
      ? new Date(property.expires_at) : new Date();
    const extendsUntil = new Date(baseDate);
    extendsUntil.setMonth(extendsUntil.getMonth() + 3);

    // Create payment record
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

    if (payErr) {
      console.log('Payment record error:', payErr);
      throw new Error(`Payment record error: ${payErr.message}`);
    }

    console.log('Payment record created:', payment.id);

    // Build Chapa payload
    const chapaPayload = {
      amount: amount.toFixed(2),
      currency: 'ETB',
      email: ownerEmail || 'noreply@gojo-homes.com',
      first_name: ownerName?.split(' ')[0] || 'Owner',
      last_name: ownerName?.split(' ')[1] || 'User',
      tx_ref: txRef,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/listings/payment/verify`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${propertyId}/payment/success`,
      customization: {
        title: isRenewal ? 'Gojo Listing Renewal' : 'Gojo Listing Fee',
        description: isRenewal
          ? `Renewal for 3 months — ${property.title}`
          : `New listing fee — ${property.title}`,
      }
    };

    console.log('Chapa payload:', JSON.stringify(chapaPayload));
    console.log('Chapa key exists:', !!process.env.CHAPA_SECRET_KEY);

    // Initialize Chapa payment
    const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chapaPayload),
    });

    const chapaData = await chapaRes.json();
    console.log('Chapa response status:', chapaRes.status);
    console.log('Chapa response:', JSON.stringify(chapaData));

    if (chapaData.status !== 'success') {
      throw new Error(`Chapa error: ${JSON.stringify(chapaData)}`);
    }

    // Save checkout URL
    await supabase.from('listing_payments').update({
      chapa_checkout_url: chapaData.data.checkout_url
    }).eq('id', payment.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: chapaData.data.checkout_url,
      amount,
      extendsUntil: extendsUntil.toISOString(),
    });

  } catch (err: any) {
    console.log('Payment error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

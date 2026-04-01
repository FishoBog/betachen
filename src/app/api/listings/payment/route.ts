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
    const amount = isRenewal ? 300 : 500;
    const txRef = `Betachen-LIST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data: property, error: propErr } = await supabase
      .from('properties').select('*').eq('id', propertyId).single();

    if (propErr) throw new Error(`Property error: ${propErr.message}`);
    if (!property) throw new Error('Property not found');

    const baseDate = isRenewal && property.expires_at && new Date(property.expires_at) > new Date()
      ? new Date(property.expires_at) : new Date();
    const extendsUntil = new Date(baseDate);
    extendsUntil.setMonth(extendsUntil.getMonth() + 3);

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

  } catch (err: any) {
    console.log('Payment error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

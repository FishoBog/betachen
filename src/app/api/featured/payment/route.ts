import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FEATURED_PLANS = {
  '7':  { days: 7,  amount: 100, label: '1 Week' },
  '30': { days: 30, amount: 300, label: '1 Month' },
  '90': { days: 90, amount: 700, label: '3 Months' },
};

export async function POST(req: NextRequest) {
  try {
    const { propertyId, ownerClerkId, ownerEmail, ownerName, planDays } = await req.json();
    const plan = FEATURED_PLANS[planDays as keyof typeof FEATURED_PLANS];
    if (!plan) throw new Error('Invalid plan');

    const { data: property } = await supabase
      .from('properties').select('title').eq('id', propertyId).single();
    if (!property) throw new Error('Property not found');

    const txRef = `GOJO-FEAT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + plan.days);

    const { data: payment } = await supabase.from('featured_payments').insert({
      property_id: propertyId,
      owner_clerk_id: ownerClerkId,
      amount: plan.amount,
      duration_days: plan.days,
      chapa_tx_ref: txRef,
      status: 'pending',
      featured_until: featuredUntil.toISOString(),
    }).select().single();

    const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: plan.amount.toFixed(2),
        currency: 'ETB',
        email: ownerEmail,
        first_name: ownerName.split(' ')[0] || ownerName,
        last_name: ownerName.split(' ')[1] || '',
        tx_ref: txRef,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/featured/payment/verify`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${propertyId}?featured=success`,
        customization: {
          title: 'ቤታችን Featured Listing',
          description: `Feature "${property.title}" for ${plan.label}`,
        }
      })
    });

    const chapaData = await chapaRes.json();
    if (chapaData.status !== 'success') throw new Error(chapaData.message);

    return NextResponse.json({
      success: true,
      checkoutUrl: chapaData.data.checkout_url,
      amount: plan.amount,
      featuredUntil: featuredUntil.toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get('trx_ref') || searchParams.get('tx_ref');

  if (!txRef) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?payment=failed`);
  }

  try {
    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      headers: { 'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}` }
    });
    const verifyData = await verifyRes.json();

    if (verifyData.status !== 'success' || verifyData.data?.status !== 'success') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?payment=failed`);
    }

    const { data: payment } = await supabase
      .from('listing_payments')
      .select('*')
      .eq('chapa_tx_ref', txRef)
      .single();

    if (!payment) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?payment=failed`);
    }

    await supabase.from('listing_payments').update({ status: 'paid' }).eq('id', payment.id);

    await supabase.from('properties').update({
      status: 'pending_review',
      expires_at: payment.extends_until,
    }).eq('id', payment.property_id);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${payment.property_id}?payment=success`
    );
  } catch (err: any) {
    console.error('Payment verify error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?payment=failed`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const txRef = body.trx_ref || body.tx_ref;

    if (!txRef) return NextResponse.json({ error: 'No tx_ref' }, { status: 400 });

    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      headers: { 'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}` }
    });
    const verifyData = await verifyRes.json();

    if (verifyData.status !== 'success' || verifyData.data?.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    const { data: payment } = await supabase
      .from('listing_payments')
      .select('*')
      .eq('chapa_tx_ref', txRef)
      .single();

    if (!payment) return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });

    await supabase.from('listing_payments').update({ status: 'paid' }).eq('id', payment.id);

    await supabase.from('properties').update({
      status: 'pending_review',
      expires_at: payment.extends_until,
    }).eq('id', payment.property_id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get('trx_ref') || searchParams.get('tx_ref');
  if (!txRef) return NextResponse.json({ error: 'No tx_ref' }, { status: 400 });

  try {
    const verifyRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      { headers: { 'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json();

    if (verifyData.status === 'success' && verifyData.data.status === 'success') {
      const { data: payment } = await supabase
        .from('featured_payments')
        .update({ status: 'paid' })
        .eq('chapa_tx_ref', txRef)
        .select().single();

      if (payment) {
        await supabase.from('properties').update({
          is_featured: true,
          featured_until: payment.featured_until,
          featured_paid: true,
        }).eq('id', payment.property_id);

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/owner/listings/${payment.property_id}?featured=success`
        );
      }
    }
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/owner/dashboard?featured=failed`
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

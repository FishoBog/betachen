import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get('trx_ref') || searchParams.get('tx_ref');

  if (!txRef) return NextResponse.json({ error: 'No transaction reference' }, { status: 400 });

  try {
    // Verify with Chapa
    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      headers: { 'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}` }
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status === 'success' && verifyData.data.status === 'success') {
      await supabase.from('reservations')
        .update({
          status: 'deposit_paid',
          payment_method: verifyData.data.payment_method || 'chapa',
          updated_at: new Date().toISOString()
        })
        .eq('chapa_tx_ref', txRef);

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/reservations?payment=success`);
    } else {
      await supabase.from('reservations')
        .update({ status: 'pending' })
        .eq('chapa_tx_ref', txRef);

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/reservations?payment=failed`);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

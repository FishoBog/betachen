import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { reservationId, guestClerkId, reason } = await req.json();

    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .eq('guest_clerk_id', guestClerkId)
      .single();

    if (error || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.status === 'cancelled') {
      return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });
    }

    // Calculate refund based on policy
    const today = new Date();
    const checkIn = new Date(reservation.check_in);
    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundAmount = 0;
    let refundPolicy = '';

    if (daysUntilCheckIn >= 7) {
      refundAmount = reservation.deposit_amount; // 100% refund
      refundPolicy = 'Full refund — cancelled 7+ days before check-in';
    } else if (daysUntilCheckIn >= 3) {
      refundAmount = reservation.deposit_amount * 0.5; // 50% refund
      refundPolicy = '50% refund — cancelled 3–7 days before check-in';
    } else {
      refundAmount = 0; // No refund
      refundPolicy = 'No refund — cancelled less than 3 days before check-in';
    }

    await supabase.from('reservations').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      refund_amount: refundAmount,
      refund_reason: reason || refundPolicy,
      updated_at: new Date().toISOString()
    }).eq('id', reservationId);

    return NextResponse.json({
      success: true,
      refundAmount,
      refundPolicy,
      daysUntilCheckIn,
      message: refundAmount > 0
        ? `You will receive a refund of ETB ${refundAmount.toFixed(2)}`
        : 'No refund applies based on cancellation policy'
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

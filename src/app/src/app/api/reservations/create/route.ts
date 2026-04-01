import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { propertyId, guestClerkId, guestEmail, guestName, checkIn, checkOut, pricePerNight } = await req.json();

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * pricePerNight;
    const depositAmount = totalAmount * 0.25;
    const remainingAmount = totalAmount * 0.75;
    const txRef = `Betachen-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create reservation record
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        property_id: propertyId,
        guest_clerk_id: guestClerkId,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        price_per_night: pricePerNight,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        remaining_amount: remainingAmount,
        chapa_tx_ref: txRef,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Initialize Chapa payment
    const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: depositAmount.toFixed(2),
        currency: 'ETB',
        email: guestEmail,
        first_name: guestName.split(' ')[0] || guestName,
        last_name: guestName.split(' ')[1] || '',
        tx_ref: txRef,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/reservations/verify`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservations/${reservation.id}?status=success`,
        customization: {
          title: 'ቤታችን Reservation Deposit',
          description: `25% deposit for ${nights} night(s) — Check-in: ${checkIn}`,
        }
      })
    });

    const chapaData = await chapaRes.json();

    if (chapaData.status !== 'success') {
      throw new Error(chapaData.message || 'Chapa initialization failed');
    }

    // Save checkout URL
    await supabase.from('reservations').update({
      chapa_checkout_url: chapaData.data.checkout_url
    }).eq('id', reservation.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: chapaData.data.checkout_url,
      reservationId: reservation.id,
      depositAmount,
      totalAmount,
      nights
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

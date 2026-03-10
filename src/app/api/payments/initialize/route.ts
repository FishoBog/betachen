import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { amount, email, first_name, last_name, tx_ref } = await req.json();
  const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'ETB', email, first_name, last_name, tx_ref, return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success` }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

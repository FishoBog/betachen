import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
  const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET!;

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: WEBHOOK_URL,
      secret_token: SECRET,
      allowed_updates: ['message', 'callback_query'],
    })
  });

  const data = await res.json();
  return NextResponse.json(data);
}

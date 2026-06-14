import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Generates a one-time token for Telegram verification and stores it in the same
// `verification_codes` table used by email verification. The row is keyed by a
// synthetic email value ("tg:<token>") so it never collides with real email rows
// (the table upserts on `email`). The `token` column holds the lookup key the
// Telegram bot deep-link will carry: t.me/BetachenBot?start=<token>.
export async function POST(req: NextRequest) {
  try {
    // A short, URL-safe, hard-to-guess token. Telegram deep-link payloads allow
    // [A-Za-z0-9_-] up to 64 chars, so we keep it alphanumeric.
    const token = Array.from({ length: 24 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
        Math.floor(Math.random() * 62)
      ]
    ).join('');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('verification_codes').upsert(
      {
        email: `tg:${token}`,
        token,
        code: '',
        expires_at: expiresAt,
        verified: false,
      },
      { onConflict: 'email' }
    );

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Telegram start error:', error);
    return NextResponse.json({ error: 'Failed to start verification' }, { status: 500 });
  }
}

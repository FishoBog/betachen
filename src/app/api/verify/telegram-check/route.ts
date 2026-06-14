import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Polled by the listing form to check whether the user has completed Telegram
// verification (i.e. pressed Start on the bot, which the webhook then marks
// verified). Looks the row up by its `token`, separate from the email check
// route so the existing email flow is untouched.
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('verification_codes')
      .select('verified, expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      // Not found yet is not an error for polling — just "not verified".
      return NextResponse.json({ verified: false });
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ verified: false, expired: true });
    }

    return NextResponse.json({ verified: !!data.verified });
  } catch (error) {
    console.error('Telegram check error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}

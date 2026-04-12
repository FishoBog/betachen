import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('verification_codes').upsert({
      email,
      code,
      expires_at: expiresAt,
      verified: false,
    }, { onConflict: 'email' });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Betachen <info@betachen.com>',
        to: email,
        subject: 'Your Betachen verification code',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
            <h2 style="color:#111827;">Hello ${name}!</h2>
            <p style="color:#374151;">Your verification code for posting on Betachen is:</p>
            <div style="background:#f0f6ff;border:2px solid #dbeafe;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <div style="font-size:40px;font-weight:900;color:#006AFF;letter-spacing:8px;">${code}</div>
              <div style="font-size:13px;color:#6b7280;margin-top:8px;">Valid for 10 minutes</div>
            </div>
            <p style="color:#6b7280;font-size:13px;">If you did not request this, ignore this email.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="color:#9ca3af;font-size:12px;">Betachen — Ethiopia's #1 Real Estate Platform<br/>betachen.com</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}

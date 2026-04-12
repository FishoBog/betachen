import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// POST /api/discount — validate a code
// POST /api/discount/create — create a new code (admin)
// POST /api/discount/use — mark code as used
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  if (action === 'create') {
    const { code, discount_percent, customer_name, customer_email, note, expires_days } = await req.json();
    const expiresAt = expires_days
      ? new Date(Date.now() + expires_days * 86400000).toISOString()
      : null;
    const { data, error } = await supabase.from('discount_codes').insert({
      code: code.toUpperCase().trim(),
      discount_percent,
      customer_name,
      customer_email,
      note,
      expires_at: expiresAt,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  }
  if (action === 'use') {
    const { code, email } = await req.json();
    const { error } = await supabase.from('discount_codes')
      .update({ used: true, used_by_email: email, used_at: new Date().toISOString() })
      .eq('code', code.toUpperCase().trim())
      .eq('used', false);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }
  // Default: validate a code
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('used', false)
    .single();
  if (error || !data) return NextResponse.json({ valid: false, error: 'Invalid or already used code' });
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Code has expired' });
  }
  return NextResponse.json({
    valid: true,
    discount_percent: data.discount_percent,
    customer_name: data.customer_name,
  });
}
export async function GET() {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}


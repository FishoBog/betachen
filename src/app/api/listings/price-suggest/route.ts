import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side fetch of a single property by id, using the SERVICE ROLE key so
// it bypasses Row-Level Security. The payment page needs this because a guest's
// freshly created listing has status 'pending_review' (not 'active') and the
// guest has no auth identity, so the browser's anon client gets a 406 (no rows
// pass the SELECT policy). Reading server-side returns the row regardless.

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ property: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}

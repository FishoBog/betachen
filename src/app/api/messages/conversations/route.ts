import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_CLERK_ID = 'user_3BeYdNiwHjIpWA8iw63QXV5Yb6Y';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const isAdmin = userId === ADMIN_CLERK_ID;

    let query = supabase
      .from('messages')
      .select('*, properties(id, title, location, type)');

    if (!isAdmin) {
      query = query.or(`sender_clerk_id.eq.${userId},receiver_clerk_id.eq.${userId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const seen = new Set();
    const grouped = (data ?? []).filter((m: any) => {
      if (seen.has(m.property_id)) return false;
      seen.add(m.property_id);
      return true;
    });

    return NextResponse.json({ threads: grouped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_CLERK_ID = 'user_3AmnQEFKPsp6EX1W9xl88nOW4AV';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const propertyId = req.nextUrl.searchParams.get('propertyId');
    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    const isAdmin = userId === ADMIN_CLERK_ID;

    const { data: allMsgs, error } = await supabase
      .from('messages')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const msgs = allMsgs ?? [];

    if (!isAdmin) {
      const isParticipant = msgs.some(
        (m: any) => m.sender_clerk_id === userId || m.receiver_clerk_id === userId
      );
      if (msgs.length > 0 && !isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const visible = isAdmin
      ? msgs
      : msgs.filter(
          (m: any) => m.sender_clerk_id === userId || m.receiver_clerk_id === userId
        );

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('property_id', propertyId)
      .eq('receiver_clerk_id', userId)
      .eq('is_read', false);

    return NextResponse.json({ messages: visible });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

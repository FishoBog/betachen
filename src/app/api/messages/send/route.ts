import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const { propertyId, content } = await req.json();
    if (!propertyId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Missing property or message' }, { status: 400 });
    }

    const { data: prop } = await supabase
      .from('properties')
      .select('id, owner_id')
      .eq('id', propertyId)
      .single();

    if (!prop) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    let receiverId: string | null = null;

    if (prop.owner_id === userId) {
      const { data: existing } = await supabase
        .from('messages')
        .select('sender_clerk_id, receiver_clerk_id')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      const other = (existing ?? []).find(
        (m: any) => m.sender_clerk_id !== userId
      );
      receiverId = other?.sender_clerk_id ?? null;
    } else {
      receiverId = prop.owner_id;
    }

    if (!receiverId) {
      return NextResponse.json({ error: 'Could not determine recipient' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        property_id: propertyId,
        sender_clerk_id: userId,
        receiver_clerk_id: receiverId,
        content: content.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

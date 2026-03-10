import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data } = await createAdminClient().from('saved_searches').select('*').eq('user_id', userId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { data, error } = await createAdminClient().from('saved_searches').insert({ ...body, user_id: userId }).select().single();
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json(data);
}

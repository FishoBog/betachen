import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from('properties').update({ status: 'expired' }).eq('status', 'published').lt('expires_at', new Date().toISOString());
  return NextResponse.json({ success: !error });
}

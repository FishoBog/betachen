import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { propertyId, ownerClerkId, newStatus } = await req.json();

    const validStatuses = ['sold', 'rented', 'under_contract', 'active'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('owner_id, title')
      .eq('id', propertyId)
      .single();

    if (!property || property.owner_id !== ownerClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const timestampField: Record<string, string> = {
      sold: 'sold_at',
      rented: 'rented_at',
      under_contract: 'under_contract_at',
    };

    await supabase.from('properties').update({
      status: newStatus,
      ...(timestampField[newStatus] && { [timestampField[newStatus]]: new Date().toISOString() }),
    }).eq('id', propertyId);

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

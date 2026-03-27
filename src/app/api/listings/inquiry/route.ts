import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { propertyId, propertyTitle, guestName, guestPhone, message } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get property owner_id
    const { data: property } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    // Save inquiry to a notifications or messages table
    await supabase.from('notifications').insert({
      user_id: property.owner_id,
      type: 'guest_inquiry',
      title: `New inquiry for: ${propertyTitle}`,
      message: `From: ${guestName}${guestPhone ? ` (${guestPhone})` : ''}\n\n${message}`,
      property_id: propertyId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inquiry error:', error);
    return NextResponse.json({ error: 'Failed to send inquiry' }, { status: 500 });
  }
}
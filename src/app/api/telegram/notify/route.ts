import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();

    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    // Get saved searches that match this property
    const { data: alerts } = await supabase
      .from('saved_searches')
      .select('*')
      .not('telegram_chat_id', 'is', null);

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ success: true, notified: 0 });
    }

    let notified = 0;

    for (const alert of alerts) {
      const filters = alert.filters || {};
      // Check if property matches alert filters
      const typeMatch = !filters.type || filters.type === property.type;
      const locationMatch = !filters.location ||
        property.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.subcity?.toLowerCase().includes(filters.location.toLowerCase());
      const priceMatch = !filters.max_price || property.price <= filters.max_price;

      if (typeMatch && locationMatch && priceMatch) {
        const typeLabel = property.type === 'sale' ? '🏠 For Sale' :
          property.type === 'long_rent' ? '🔑 For Rent' : '🛏️ Short Stay';

        const message = `
🔔 <b>New Matching Property!</b>

${typeLabel}
<b>${property.title}</b>

💰 ETB ${property.price?.toLocaleString()}
📍 ${property.location || property.subcity || 'Ethiopia'}
${property.bedrooms ? `🛏 ${property.bedrooms} bed` : ''} ${property.bathrooms ? `🚿 ${property.bathrooms} bath` : ''}

<a href="${process.env.NEXT_PUBLIC_APP_URL}/property/${property.id}">View Property →</a>
        `.trim();

        await fetch(`${API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: alert.telegram_chat_id,
            text: message,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: '👁️ View Details', url: `${process.env.NEXT_PUBLIC_APP_URL}/property/${property.id}` }
              ]]
            }
          })
        });
        notified++;
      }
    }

    return NextResponse.json({ success: true, notified });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

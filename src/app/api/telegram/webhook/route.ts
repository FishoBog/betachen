import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId: number | string, text: string, options: any = {}) {
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...options })
  });
}

async function sendPhoto(chatId: number | string, photoUrl: string, caption: string, options: any = {}) {
  await fetch(`${API}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML', ...options })
  });
}

function formatPrice(price: number) {
  if (price >= 1000000) return `ETB ${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `ETB ${(price / 1000).toFixed(0)}K`;
  return `ETB ${price.toLocaleString()}`;
}

function propertyCard(p: any): string {
  const typeLabel = p.type === 'sale' ? '🏠 For Sale' : p.type === 'long_rent' ? '🔑 For Rent' : '🛏️ Short Stay';
  const price = formatPrice(p.price);
  const suffix = p.type === 'long_rent' ? '/month' : p.type === 'short_rent' ? '/night' : '';
  return `
${typeLabel}
<b>${p.title}</b>

💰 <b>${price}${suffix}</b>
📍 ${p.location || p.subcity || 'Ethiopia'}
${p.bedrooms ? `🛏 ${p.bedrooms} bed` : ''} ${p.bathrooms ? `🚿 ${p.bathrooms} bath` : ''} ${p.area ? `📐 ${p.area}m²` : ''}

🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL}/property/${p.id}">View on ጎጆ</a>
  `.trim();
}

async function handleStart(chatId: number, firstName: string) {
  const welcome = `
🏠 <b>Welcome to ጎጆ Bot${firstName ? `, ${firstName}` : ''}!</b>

Ethiopia's #1 Real Estate Platform — now on Telegram!

<b>What I can do:</b>
/listings — Browse latest properties
/sale — Properties for sale
/rent — Properties for rent
/shortstay — Short stay properties
/search [keyword] — Search properties
/stats — Market statistics
/alert [location] — Set price alerts
/help — Show all commands

ጎጆ — ቤት ፈልግ፣ ያከራዩ፣ ይሸጡ 🇪🇹
  `.trim();

  await sendMessage(chatId, welcome, {
    reply_markup: {
      keyboard: [
        [{ text: '🏠 Latest Listings' }, { text: '💰 For Sale' }],
        [{ text: '🔑 For Rent' }, { text: '🛏️ Short Stay' }],
        [{ text: '📊 Market Stats' }, { text: '🔔 Set Alert' }],
        [{ text: '🌍 Diaspora Hub' }, { text: '❓ Help' }],
      ],
      resize_keyboard: true
    }
  });
}

async function handleListings(chatId: number, type?: string) {
  const query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5);

  if (type) query.eq('type', type);

  const { data: props } = await query;

  if (!props || props.length === 0) {
    await sendMessage(chatId, '😔 No properties found right now. Check back soon!');
    return;
  }

  await sendMessage(chatId, `🔍 Found <b>${props.length}</b> properties:`);

  for (const p of props.slice(0, 3)) {
    const caption = propertyCard(p);
    if (p.images?.[0]) {
      await sendPhoto(chatId, p.images[0], caption, {
        reply_markup: {
          inline_keyboard: [[
            { text: '👁️ View Details', url: `${process.env.NEXT_PUBLIC_APP_URL}/property/${p.id}` },
            { text: '📱 WhatsApp Owner', url: p.owner_whatsapp ? `https://wa.me/${p.owner_whatsapp.replace(/\D/g, '')}` : `${process.env.NEXT_PUBLIC_APP_URL}/property/${p.id}` }
          ]]
        }
      });
    } else {
      await sendMessage(chatId, caption, {
        reply_markup: {
          inline_keyboard: [[
            { text: '👁️ View Details', url: `${process.env.NEXT_PUBLIC_APP_URL}/property/${p.id}` }
          ]]
        }
      });
    }
  }

  if (props.length > 3) {
    await sendMessage(chatId, `📱 <a href="${process.env.NEXT_PUBLIC_APP_URL}">See all ${props.length}+ properties on ጎጆ →</a>`);
  }
}

async function handleSearch(chatId: number, query: string) {
  const { data: props } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,location.ilike.%${query}%,subcity.ilike.%${query}%`)
    .limit(5);

  if (!props || props.length === 0) {
    await sendMessage(chatId, `😔 No properties found for "<b>${query}</b>"\n\nTry searching for: Bole, Kirkos, Yeka, apartment, villa...`);
    return;
  }

  await sendMessage(chatId, `🔍 Found <b>${props.length}</b> results for "<b>${query}</b>":`);

  for (const p of props.slice(0, 3)) {
    await sendMessage(chatId, propertyCard(p), {
      reply_markup: {
        inline_keyboard: [[
          { text: '👁️ View Details', url: `${process.env.NEXT_PUBLIC_APP_URL}/property/${p.id}` }
        ]]
      }
    });
  }
}

async function handleStats(chatId: number) {
  const { data: props } = await supabase
    .from('properties')
    .select('type, price, status')
    .gt('price', 0);

  if (!props || props.length === 0) {
    await sendMessage(chatId, '📊 No market data available yet.');
    return;
  }

  const total = props.length;
  const active = props.filter(p => p.status === 'active').length;
  const sold = props.filter(p => p.status === 'sold').length;
  const rented = props.filter(p => p.status === 'rented').length;
  const saleProps = props.filter(p => p.type === 'sale');
  const rentProps = props.filter(p => p.type === 'long_rent');
  const avgSale = saleProps.length > 0 ? saleProps.reduce((s, p) => s + p.price, 0) / saleProps.length : 0;
  const avgRent = rentProps.length > 0 ? rentProps.reduce((s, p) => s + p.price, 0) / rentProps.length : 0;

  const stats = `
📊 <b>ጎጆ Market Statistics</b>

🏠 Total Listings: <b>${total}</b>
✅ Active Now: <b>${active}</b>
🤝 Sold: <b>${sold}</b>
🔑 Rented: <b>${rented}</b>

💰 Avg Sale Price: <b>${formatPrice(avgSale)}</b>
📅 Avg Rent/Month: <b>${formatPrice(avgRent)}</b>

📱 <a href="${process.env.NEXT_PUBLIC_APP_URL}/market">Full Market Dashboard →</a>
  `.trim();

  await sendMessage(chatId, stats);
}

async function handleSetAlert(chatId: number, location: string, userId?: string) {
  await sendMessage(chatId, `
🔔 <b>Alert Set!</b>

You'll be notified when new properties are listed in:
📍 <b>${location}</b>

To manage your alerts, visit:
<a href="${process.env.NEXT_PUBLIC_APP_URL}/alerts">ጎጆ Alerts Page →</a>

<i>Note: Sign in on ጎጆ to save alerts to your account.</i>
  `.trim());
}

async function handleHelp(chatId: number) {
  await sendMessage(chatId, `
🏠 <b>ጎጆ Bot Commands</b>

/start — Welcome message
/listings — Latest 5 properties
/sale — Properties for sale
/rent — Long-term rentals
/shortstay — Short stay properties
/search [word] — Search by keyword
/stats — Market statistics
/alert [location] — Get notified for new listings
/help — This message

<b>Quick buttons:</b>
Use the keyboard below for quick access!

🌐 Website: <a href="${process.env.NEXT_PUBLIC_APP_URL}">${process.env.NEXT_PUBLIC_APP_URL}</a>
  `.trim());
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-telegram-bot-api-secret-token');
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const message = body.message || body.edited_message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text || '';
    const firstName = message.from?.first_name || '';

    // Handle commands and keyboard buttons
    if (text === '/start' || text === '❓ Help') {
      await handleStart(chatId, firstName);
    } else if (text === '/listings' || text === '🏠 Latest Listings') {
      await handleListings(chatId);
    } else if (text === '/sale' || text === '💰 For Sale') {
      await handleListings(chatId, 'sale');
    } else if (text === '/rent' || text === '🔑 For Rent') {
      await handleListings(chatId, 'long_rent');
    } else if (text === '/shortstay' || text === '🛏️ Short Stay') {
      await handleListings(chatId, 'short_rent');
    } else if (text === '/stats' || text === '📊 Market Stats') {
      await handleStats(chatId);
    } else if (text === '🌍 Diaspora Hub') {
      await sendMessage(chatId, `🌍 <b>Diaspora Investment Hub</b>\n\nBrowse properties with USD pricing, video tours, and managed rental options.\n\n<a href="${process.env.NEXT_PUBLIC_APP_URL}/diaspora">Visit Diaspora Hub →</a>`);
    } else if (text === '🔔 Set Alert') {
      await sendMessage(chatId, '📍 Send me a location to set an alert.\n\nExample: <code>/alert Bole</code> or <code>/alert Kirkos</code>');
    } else if (text.startsWith('/search ')) {
      const query = text.replace('/search ', '').trim();
      await handleSearch(chatId, query);
    } else if (text.startsWith('/alert ')) {
      const location = text.replace('/alert ', '').trim();
      await handleSetAlert(chatId, location);
    } else if (text === '/help') {
      await handleHelp(chatId);
    } else {
      // Treat any other text as a search
      await handleSearch(chatId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

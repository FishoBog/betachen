import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

const SYSTEM_PROMPT = `You are ቤታችን Bot (BetachenBot), the official Telegram assistant for ቤታችን — Ethiopia's #1 real estate platform at betachen.com.

You help users with:
- Finding properties for sale, rent, or short stay across Ethiopia
- Understanding how to post a listing on betachen.com
- Ethiopian property market insights, pricing, and neighborhoods
- Ethiopian property terms (leasehold/ሊዝ, freehold/ወረቀት, condominium, etc.)
- The buying/renting process in Ethiopia
- Diaspora investment guidance
- Platform features (how to message owners, post listings, market data)

KEY FACTS ABOUT ቤታችን:
- Website: betachen.com
- Listing fee: ETB 500 for 3 months
- Payment via Chapa (Ethiopian payment gateway)
- Properties reviewed within 24 hours before going live
- Supports For Sale, Long-term Rent, and Short Stay listings
- Available in English and Amharic
- Covers all major Ethiopian cities

ETHIOPIAN PROPERTY KNOWLEDGE:
- Leasehold (ሊዝ): Government owns land, you own the building. Most common in Addis Ababa.
- Freehold (ወረቀት): Full ownership documents. Older properties.
- Condominium: Government-built affordable housing.
- Construction stages: Land only → Foundation → Columns → Shell (Guwada) → Plastering → Finishing → Completed
- Always advise title deed verification with a lawyer before purchase.

ADDIS ABABA NEIGHBORHOODS:
- Premium: Bole, Kazanchis, Old Airport, CMC Summit
- Mid-range: Gerji, Ayat, Yeka, Sarbet, Megenagna
- Affordable: Akaki-Kality, Kolfe, Lideta, Kera

PRICING GUIDE (2024-2025 Addis Ababa):
- Apartment rent: ETB 15,000 - 80,000/month
- Villa for sale: ETB 5M - 50M+
- Condominium: ETB 800K - 3M
- Short stay: USD 30 - 150/night

RULES:
- Respond in the same language the user writes in (Amharic or English)
- Keep responses concise — Telegram messages should be short and clear
- Use simple formatting: bold with *text*, line breaks for lists
- Always include a link to betachen.com when relevant
- For legal/financial specifics recommend consulting a professional
- Never make up property listings or prices — direct to website for live listings
- If user wants to see properties: betachen.com
- If user wants to post: betachen.com/owner/listings/new
- For support issues: support@betachen.com

TELEGRAM FORMATTING:
- Use *bold* for important terms
- Use plain text mostly — keep it readable in Telegram
- Keep responses under 300 words
- End with a relevant call to action`;

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    }),
  });
}

async function sendTyping(chatId: number) {
  await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
}

async function getAIReply(userMessage: string, history: any[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [...history.slice(-6), { role: 'user', content: userMessage }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text ?? 'Sorry, I could not process that. Please try again or visit betachen.com';
}

// Simple in-memory conversation history (resets on server restart)
// For production, move this to Supabase
const conversations: Record<number, { role: string; content: string }[]> = {};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const text: string = message.text ?? '';
    const firstName: string = message.from?.first_name ?? 'there';

    // Initialize conversation history
    if (!conversations[chatId]) conversations[chatId] = [];

    // ── Handle commands ──
    if (text === '/start') {
      await sendMessage(chatId,
        `*ሰላም ${firstName}! Welcome to ቤታችን Bot* 🏠\n\nI'm your Ethiopian real estate assistant. I can help you:\n\n• 🔍 Find properties across Ethiopia\n• 📝 Learn how to post a listing\n• 💡 Understand market prices & neighborhoods\n• 🏗️ Learn about property types & terms\n• 🇪🇹 Guide diaspora investors\n\nJust ask me anything in *English or Amharic*!\n\nVisit us: betachen.com`,
        {
          inline_keyboard: [
            [
              { text: '🏠 Browse Properties', url: 'https://betachen.com' },
              { text: '📝 Post a Listing', url: 'https://betachen.com/owner/listings/new' },
            ],
            [
              { text: '📈 Market Data', url: 'https://betachen.com/market' },
              { text: '🌍 Diaspora Guide', url: 'https://betachen.com/diaspora' },
            ],
          ],
        }
      );
      conversations[chatId] = [];
      return NextResponse.json({ ok: true });
    }

    if (text === '/help') {
      await sendMessage(chatId,
        `*ቤታችን Bot Commands* 🤖\n\n/start — Welcome & main menu\n/search — Find properties\n/post — Post a listing\n/market — Market insights\n/diaspora — Diaspora investor guide\n/contact — Contact support\n\nOr just *type any question* and I'll answer it!\n\nLanguage: I respond in English or Amharic based on what you write.`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/search') {
      await sendMessage(chatId,
        `*Search Properties on ቤታችን* 🔍\n\nWe have properties for:\n• 🏠 Sale\n• 🔑 Long-term Rent\n• 🛏️ Short Stay\n\nAcross all major Ethiopian cities including Addis Ababa, Dire Dawa, Bahir Dar, Hawassa, Mekelle and more.\n\n👇 Browse all listings:`,
        { inline_keyboard: [[{ text: '🔍 Search Properties Now', url: 'https://betachen.com' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/post') {
      await sendMessage(chatId,
        `*Post Your Property on ቤታችን* 📝\n\n✅ Reach thousands of buyers & renters\n✅ List in under 5 minutes\n✅ ETB 500 for 3 months\n✅ Available in English & Amharic\n✅ Live within 24 hours\n\n👇 Post your listing now:`,
        { inline_keyboard: [[{ text: '📝 Post a Listing', url: 'https://betachen.com/owner/listings/new' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/market') {
      await sendMessage(chatId,
        `*Ethiopian Real Estate Market* 📈\n\nGet live market data, price trends, and AI-powered insights for the Ethiopian property market.\n\n👇 View market intelligence:`,
        { inline_keyboard: [[{ text: '📈 View Market Data', url: 'https://betachen.com/market' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/diaspora') {
      await sendMessage(chatId,
        `*Diaspora Investor Guide* 🌍\n\nInvesting in Ethiopian real estate from abroad? We can help with:\n\n• Understanding leasehold vs freehold\n• Safe buying process from abroad\n• Diaspora-friendly listings\n• Market pricing guidance\n\n👇 Visit our Diaspora page:`,
        { inline_keyboard: [[{ text: '🌍 Diaspora Guide', url: 'https://betachen.com/diaspora' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/contact') {
      await sendMessage(chatId,
        `*Contact ቤታችን Support* 📞\n\n📧 Email: support@betachen.com\n🌐 Website: betachen.com\n💬 This bot: Just ask your question!\n\nWe typically respond within 24 hours.`
      );
      return NextResponse.json({ ok: true });
    }

    // ── AI-powered free text response ──
    await sendTyping(chatId);

    const history = conversations[chatId] ?? [];
    const reply = await getAIReply(text, history);

    // Store in history
    conversations[chatId] = [
      ...history,
      { role: 'user', content: text },
      { role: 'assistant', content: reply },
    ].slice(-12); // Keep last 12 messages

    await sendMessage(chatId, reply, {
      inline_keyboard: [[
        { text: '🏠 betachen.com', url: 'https://betachen.com' },
      ]],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Betachen Telegram Bot webhook active' });
}

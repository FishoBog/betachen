import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

const SYSTEM_PROMPT = `You are Betachen Bot, the official Telegram assistant for Betachen — Ethiopia's #1 real estate platform at betachen.com.

You help users with:
- Finding properties for sale, rent, or short stay across Ethiopia
- Understanding how to post a listing on betachen.com
- Ethiopian property market insights, pricing, and neighborhoods
- Ethiopian property terms (leasehold, freehold, condominium)
- The buying/renting process in Ethiopia
- Diaspora investment guidance

KEY FACTS:
- Website: betachen.com
- Listing fee: ETB 500 for 3 months
- Payment via Chapa
- Properties reviewed within 24 hours
- Covers all major Ethiopian cities

PRICING GUIDE (Addis Ababa):
- Apartment rent: ETB 15,000 - 80,000/month
- Villa for sale: ETB 5M - 50M+
- Condominium: ETB 800K - 3M
- Short stay: USD 30 - 150/night

RULES:
- Default to Amharic for all responses unless user writes in English
- When responding in Amharic, use ONLY pure natural Amharic that any Ethiopian understands
- NEVER mix English words into Amharic sentences
- NEVER transliterate English into Amharic script
- NEVER write things like "ተ pay ይከፍላሉ" or "ተ rent ማድረግ" — this is wrong
- For property terms use these correct Amharic explanations:
  * ሊዝ (Leasehold): መንግስት መሬቱን ባለቤት ሲሆን፣ ግለሰቡ ለተወሰነ ዓመት ብቻ ቤቱን ይጠቀማል። በአዲስ አበባ በብዛት የሚገኝ ዓይነት ነው።
  * ወረቀት (Freehold): ሙሉ የባለቤትነት ሰነድ ያለው ቤት። ብዙ ጊዜ ያረጁ ቤቶች ላይ ይገኛል።
  * ኮንዶሚኒየም: በመንግስት የተሰራ ተመጣጣኝ ዋጋ ያለው ቤት።
  * ጉዋዳ: ሙሉ ግንባታ ያልተጠናቀቀ — ፍሬሙ ተጠናቋል ግን ፊኒሺንግ አልተደረገም።
- Keep responses short and clear for Telegram
- Never make up listings or prices
- Always direct to betachen.com for live listings

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

const conversations: Record<number, { role: string; content: string }[]> = {};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const text: string = message.text ?? '';
    const firstName: string = message.from?.first_name ?? 'there';

    if (!conversations[chatId]) conversations[chatId] = [];

    if (text === '/start') {
      await sendMessage(chatId,
        `*ሰላም ${firstName}! እንኳን ደህና መጡ — Betachen Bot* 🏠\n\n*Welcome to Betachen Bot!*\n\nየኢትዮጵያ ሪል እስቴት ረዳትዎ ነኝ። ልረዳዎ የምችለው:\n\n• 🔍 በኢትዮጵያ ንብረቶችን ይፈልጉ\n• 📝 ማስታወቂያ ይለጥፉ\n• 💡 የገበያ ዋጋዎችን ይረዱ\n• 🇪🇹 ለዲያስፖራ ኢንቨስተሮች መመሪያ\n\nበ*አማርኛ ወይም እንግሊዝኛ* ይጠይቁኝ!\n\nVisit: betachen.com`,
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
        `*Betachen Bot Commands* 🤖\n\n/start — Welcome & main menu\n/search — Find properties\n/post — Post a listing\n/market — Market insights\n/diaspora — Diaspora investor guide\n/contact — Contact support\n\nOr just *type any question* and I will answer it!`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/search') {
      await sendMessage(chatId,
        `*Search Properties on Betachen* 🔍\n\nProperties for:\n• 🏠 Sale\n• 🔑 Long-term Rent\n• 🛏️ Short Stay\n\nAll major Ethiopian cities covered.\n\n👇 Browse now:`,
        { inline_keyboard: [[{ text: '🔍 Search Properties', url: 'https://betachen.com' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/post') {
      await sendMessage(chatId,
        `*Post Your Property* 📝\n\n✅ Reach thousands of buyers\n✅ List in under 5 minutes\n✅ ETB 500 for 3 months\n✅ Live within 24 hours\n\n👇 Post now:`,
        { inline_keyboard: [[{ text: '📝 Post a Listing', url: 'https://betachen.com/owner/listings/new' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/market') {
      await sendMessage(chatId,
        `*Ethiopian Real Estate Market* 📈\n\nLive market data, price trends, and AI insights.\n\n👇 View now:`,
        { inline_keyboard: [[{ text: '📈 Market Data', url: 'https://betachen.com/market' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/diaspora') {
      await sendMessage(chatId,
        `*Diaspora Investor Guide* 🌍\n\nInvesting from abroad? We help with:\n\n• Leasehold vs freehold\n• Safe buying process\n• Diaspora-friendly listings\n• Market pricing\n\n👇 Learn more:`,
        { inline_keyboard: [[{ text: '🌍 Diaspora Guide', url: 'https://betachen.com/diaspora' }]] }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/contact') {
      await sendMessage(chatId,
        `*Contact Betachen Support* 📞\n\n📧 Email: support@betachen.com\n🌐 Website: betachen.com\n\nWe respond within 24 hours.`
      );
      return NextResponse.json({ ok: true });
    }

    await sendTyping(chatId);
    const history = conversations[chatId] ?? [];
    const reply = await getAIReply(text, history);

    conversations[chatId] = [
      ...history,
      { role: 'user', content: text },
      { role: 'assistant', content: reply },
    ].slice(-12);

    await sendMessage(chatId, reply, {
      inline_keyboard: [[{ text: '🏠 betachen.com', url: 'https://betachen.com' }]],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Betachen Telegram Bot webhook active' });
}

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600;

const FEEDS = {
  housing: [
    'https://capitalethiopia.com/feed/',
    'https://www.thereporterethiopia.com/feed/',
    'https://addisfortune.news/feed/',
  ],
  economy: [
    'https://addisfortune.news/feed/',
    'https://capitalethiopia.com/feed/',
    'https://www.thereporterethiopia.com/feed/',
  ],
  ethiopia: [
    'https://addisstandard.com/feed/',
    'https://www.fanabc.com/english/feed/',
    'https://www.thereporterethiopia.com/feed/',
  ],
};

const KEYWORDS = {
  housing: ['real estate', 'housing', 'property', 'construction', 'condominium', 'rent', 'apartment', 'building', 'land', 'home', 'mortgage'],
  economy: ['economy', 'inflation', 'investment', 'finance', 'gdp', 'bank', 'birr', 'market', 'trade', 'budget', 'tax', 'export', 'business'],
  ethiopia: ['development', 'infrastructure', 'urban', 'city', 'road', 'project', 'addis', 'growth', 'transport', 'energy', 'water'],
};

async function fetchFeedXml(feedUrl: string): Promise<string | null> {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`,
  ];
  for (const p of proxies) {
    try {
      const res = await fetch(p, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Betachen/1.0)' },
        next: { revalidate: 3600 },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      if (xml && xml.includes('<item')) return xml;
    } catch {
      continue;
    }
  }
  return null;
}

function parseRss(xml: string, sourceName: string): any[] {
  const items: any[] = [];
  const matches = Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/g));
  for (const m of matches) {
    const block = m[0];
    const pick = (re: RegExp) => block.match(re)?.[1]?.trim() ?? '';
    const title = pick(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || pick(/<title>([\s\S]*?)<\/title>/);
    const rawDesc = pick(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || pick(/<description>([\s\S]*?)<\/description>/);
    const link = pick(/<link>([\s\S]*?)<\/link>/) || block.match(/<link[^>]*href="([^"]+)"/)?.[1] || '#';
    const pubDate = pick(/<pubDate>([\s\S]*?)<\/pubDate>/) || new Date().toISOString();
    const image = block.match(/<media:content[^>]+url="([^"]+)"/)?.[1] || block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] || block.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] || block.match(/<img[^>]+src="([^"]+)"/)?.[1] || null;
    const description = rawDesc.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#160;|&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#8217;/g, "'").replace(/&#8220;|&#8221;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim().slice(0, 300);
    const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
    if (cleanTitle && link !== '#') {
      items.push({
        title: cleanTitle,
        description,
        url: link,
        urlToImage: image,
        publishedAt: new Date(pubDate).toISOString(),
        source: { name: sourceName },
        author: null,
      });
    }
  }
  return items;
}

function hostName(feedUrl: string): string {
  try {
    const h = new URL(feedUrl).hostname.replace('www.', '');
    if (h.includes('capital')) return 'Capital Ethiopia';
    if (h.includes('reporter')) return 'The Reporter';
    if (h.includes('fortune')) return 'Addis Fortune';
    if (h.includes('addisstandard')) return 'Addis Standard';
    if (h.includes('fana')) return 'Fana Broadcasting';
    return h;
  } catch {
    return 'News';
  }
}

async function translateToAmharic(articles: any[]): Promise<any[]> {
  if (!process.env.ANTHROPIC_API_KEY || articles.length === 0) return articles;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: `Translate these news articles to Amharic (Ethiopian Fidel script). Return ONLY a valid JSON array with no markdown. Each object must have "title" and "description" string fields.\n\nInput: ${JSON.stringify(articles.map(a => ({ title: a.title, description: a.description })))}` }],
      }),
    });
    if (!response.ok) return articles;
    const data = await response.json();
    const translated = JSON.parse((data.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim());
    if (!Array.isArray(translated)) return articles;
    return articles.map((a, i) => ({ ...a, title: translated[i]?.title ?? a.title, description: translated[i]?.description ?? a.description }));
  } catch {
    return articles;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tab = (searchParams.get('tab') ?? 'housing') as keyof typeof FEEDS;
  const lang = searchParams.get('lang') ?? 'EN';

  const feeds = FEEDS[tab] ?? FEEDS.housing;
  const keywords = KEYWORDS[tab] ?? KEYWORDS.housing;

  const all: any[] = [];
  for (const feed of feeds) {
    const xml = await fetchFeedXml(feed);
    if (xml) all.push(...parseRss(xml, hostName(feed)));
  }

  let articles = all;
  const filtered = all.filter(a => keywords.some(kw => a.title.toLowerCase().includes(kw) || a.description.toLowerCase().includes(kw)));
  if (filtered.length >= 3) articles = filtered;

  const seen = new Set<string>();
  articles = articles.filter(a => { if (seen.has(a.title)) return false; seen.add(a.title); return true; });
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  articles = articles.slice(0, 9);

  if (articles.length === 0) {
    return NextResponse.json({ articles: [], source: 'empty' });
  }

  const final = lang === 'AM' ? await translateToAmharic(articles) : articles;
  return NextResponse.json({ articles: final, source: 'live' });
}

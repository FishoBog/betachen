import { NextRequest, NextResponse } from 'next/server';

const RSS_FEEDS = {
  housing: [
    'https://www.thereporterethiopia.com/feed',
    'https://capitalethiopia.com/feed',
    'https://addisstandard.com/feed',
  ],
  economy: [
    'https://capitalethiopia.com/feed',
    'https://www.thereporterethiopia.com/feed',
    'https://www.2merkato.com/feed',
  ],
  ethiopia: [
    'https://addisstandard.com/feed',
    'https://www.thereporterethiopia.com/feed',
    'https://capitalethiopia.com/feed',
  ],
};

const KEYWORDS = {
  housing: ['real estate', 'housing', 'property', 'construction', 'condominium', 'rent', 'apartment', 'villa', 'land'],
  economy: ['economy', 'inflation', 'investment', 'finance', 'GDP', 'bank', 'birr', 'market', 'trade'],
  ethiopia: ['Ethiopia', 'Addis Ababa', 'development', 'infrastructure', 'urban', 'city', 'growth'],
};

async function fetchRSS(url: string): Promise<any[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Betachen/1.0 (+https://betachen.com)' },
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: any[] = [];
    const itemMatches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));

    for (const match of itemMatches) {
      const item = match[1];
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? item.match(/<description>(.*?)<\/description>/)?.[1] ?? '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
        ?? item.match(/<link\s+href="(.*?)"/)?.[1] ?? '#';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? new Date().toISOString();
      const imageMatch = item.match(/<media:content[^>]+url="([^"]+)"/)?.[1]
        ?? item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1]
        ?? item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1]
        ?? null;
      const sourceName = new URL(url).hostname.replace('www.', '');
      const cleanDesc = description.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#160;/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').trim().slice(0, 300);
      const cleanTitle = title.replace(/<[^>]*>/g, '').trim();

      if (cleanTitle) {
        items.push({
          title: cleanTitle,
          description: cleanDesc,
          url: link.trim(),
          urlToImage: imageMatch,
          publishedAt: new Date(pubDate).toISOString(),
          source: { name: sourceName },
          author: null,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

async function translateToAmharic(articles: any[]): Promise<any[]> {
  if (!process.env.ANTHROPIC_API_KEY) return articles;
  try {
    const textsToTranslate = articles.map(a => ({ title: a.title, description: a.description }));
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Translate the following news article titles and descriptions from English to Amharic (Ethiopian script). Keep proper nouns like city names in their common Amharic form. Return ONLY a valid JSON array with the same structure, no explanation, no markdown.\n\n${JSON.stringify(textsToTranslate)}`,
        }],
      }),
    });
    const data = await response.json();
    const translated = JSON.parse(data.content[0].text);
    return articles.map((a, i) => ({
      ...a,
      title: translated[i]?.title ?? a.title,
      description: translated[i]?.description ?? a.description,
    }));
  } catch {
    return articles;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tab = (searchParams.get('tab') ?? 'housing') as keyof typeof RSS_FEEDS;
  const lang = searchParams.get('lang') ?? 'EN';

  const feeds = RSS_FEEDS[tab] ?? RSS_FEEDS.housing;
  const keywords = KEYWORDS[tab] ?? KEYWORDS.housing;

  const allArticles = (await Promise.all(feeds.map(fetchRSS))).flat();

  const filtered = allArticles.filter(a =>
    keywords.some(kw =>
      a.title.toLowerCase().includes(kw.toLowerCase()) ||
      a.description.toLowerCase().includes(kw.toLowerCase())
    )
  );

  const articles = filtered.length > 0 ? filtered : allArticles;

  const seen = new Set();
  const unique = articles.filter(a => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });

  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const top9 = unique.slice(0, 9);
  const final = lang === 'AM' ? await translateToAmharic(top9) : top9;

  return NextResponse.json({ articles: final });
}

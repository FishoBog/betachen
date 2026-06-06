import { NextRequest, NextResponse } from 'next/server';

const GNEWS_API = 'https://gnews.io/api/v4/search';

const QUERIES = {
  housing: 'Ethiopia real estate OR Ethiopia housing OR Ethiopia property OR Addis Ababa construction',
  economy: 'Ethiopia economy OR Ethiopia investment OR Ethiopia finance OR Ethiopia inflation OR Ethiopian birr',
  ethiopia: 'Addis Ababa development OR Ethiopia infrastructure OR Ethiopia urban OR Ethiopia growth',
};

async function fetchGNews(query: string, lang: string = 'en'): Promise<any[]> {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) return [];
    const url = `${GNEWS_API}?q=${encodeURIComponent(query)}&lang=${lang}&country=any&max=9&sortby=publishedAt&apikey=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.articles || !Array.isArray(data.articles)) return [];
    return data.articles.map((a: any) => ({
      title: a.title ?? '',
      description: (a.description ?? '').slice(0, 300),
      url: a.url ?? '#',
      urlToImage: a.image ?? null,
      publishedAt: a.publishedAt ?? new Date().toISOString(),
      source: { name: a.source?.name ?? 'News' },
      author: a.source?.name ?? null,
    })).filter((a: any) => a.title && a.url !== '#');
  } catch {
    return [];
  }
}

async function translateToAmharic(articles: any[]): Promise<any[]> {
  if (!process.env.ANTHROPIC_API_KEY) return articles;
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
  const tab = (searchParams.get('tab') ?? 'housing') as keyof typeof QUERIES;
  const lang = searchParams.get('lang') ?? 'EN';

  const query = QUERIES[tab] ?? QUERIES.housing;
  const articles = await fetchGNews(query);

  if (articles.length === 0) {
    return NextResponse.json({ articles: [], source: 'empty' });
  }

  const final = lang === 'AM' ? await translateToAmharic(articles) : articles;
  return NextResponse.json({ articles: final, source: 'live' });
}

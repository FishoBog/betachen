import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, description, source } = await req.json();
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `You are a real estate market analyst specializing in Ethiopia. Based on this news article, provide a 3-paragraph analysis of what this means for property buyers, sellers, and investors in Ethiopia.\n\nTitle: ${title}\nDescription: ${description}\nSource: ${source}`,
        }],
      }),
    });
    const data = await response.json();
    return NextResponse.json({ analysis: data.content?.[0]?.text || 'Unable to generate analysis.' });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

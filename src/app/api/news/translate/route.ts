import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, description } = await req.json();
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
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Translate to Amharic. Return ONLY valid JSON with "title" and "description" keys, no markdown:\n{"title":"${title.replace(/"/g,"'")}","description":"${description.replace(/"/g,"'")}"}`,
        }],
      }),
    });
    const data = await response.json();
    const translated = JSON.parse(data.content[0].text);
    return NextResponse.json(translated);
  } catch {
    return NextResponse.json({ title, description });
  }
}

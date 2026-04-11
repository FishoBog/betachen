async function translateToAmharic(articles: any[]): Promise<any[]> {
  if (!process.env.ANTHROPIC_API_KEY) return articles;
  try {
    const textsToTranslate = articles.map(a => ({
      title: a.title,
      description: a.description,
    }));

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
          content: `Translate these news articles to Amharic (Ethiopian Fidel script). Return ONLY a valid JSON array, no markdown, no explanation, no code blocks. Each object must have "title" and "description" string fields.\n\nInput: ${JSON.stringify(textsToTranslate)}`,
        }],
      }),
    });

    if (!response.ok) return articles;
    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? '';
    // Strip any markdown code blocks just in case
    const clean = rawText.replace(/```json|```/g, '').trim();
    const translated = JSON.parse(clean);
    if (!Array.isArray(translated)) return articles;

    return articles.map((a, i) => ({
      ...a,
      title: translated[i]?.title ?? a.title,
      description: translated[i]?.description ?? a.description,
    }));
  } catch (e) {
    console.error('Translation error:', e);
    return articles;
  }
}

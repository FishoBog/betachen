import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { summary, stats, date } = await req.json();

  const prompt = `You are a real estate market analyst specializing in Ethiopia. Generate a professional weekly market intelligence report based on the following live data from ቤታችን (Betachen), Ethiopia's #1 real estate platform.

DATE: ${date}

MARKET DATA:
- Total listings: ${summary.total}
- Active listings: ${summary.active}
- Sold properties: ${summary.sold}
- Rented properties: ${summary.rented}
- Average sale price: ETB ${Math.round(summary.avgSalePrice).toLocaleString()}
- Average monthly rent: ETB ${Math.round(summary.avgRentPrice).toLocaleString()}
- Most active area: ${summary.topSubcity}
- Total market value: ETB ${Math.round(summary.totalValue).toLocaleString()}

TOP AREAS BY PRICE:
${stats.slice(0, 5).map((s: any) => `- ${s.subcity}: ETB ${Math.round(s.avg_price).toLocaleString()} avg (${s.listing_count} listings)`).join('\n')}

Write a comprehensive market report with these sections:
1. Executive Summary (2-3 sentences)
2. Market Overview (key metrics and what they mean)
3. Price Analysis (trends, hotspots, value areas)
4. Investment Opportunities (specific recommendations)
5. Market Outlook (short-term predictions)
6. Tips for Buyers and Renters

Keep it professional, data-driven, and specific to Ethiopia. Include ETB amounts. Make it useful for both investors and regular buyers. Write in English. Keep each section concise but insightful.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const report = data.content?.[0]?.text || 'Unable to generate report.';
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

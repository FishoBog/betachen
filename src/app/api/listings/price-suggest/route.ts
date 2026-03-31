import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { propertyData, imageUrls } = await req.json();

    // Fetch comparable properties from database
    const { data: comparables } = await supabase
      .from('properties')
      .select('title, type, price, currency, bedrooms, bathrooms, area, location, subcity, amenities, status')
      .eq('type', propertyData.type)
      .or(`subcity.ilike.%${propertyData.subcity || ''}%,location.ilike.%${propertyData.city || ''}%`)
      .in('status', ['active', 'sold', 'rented'])
      .limit(10);

    // Build the prompt with all data
    const comparablesText = comparables && comparables.length > 0
      ? comparables.map(c =>
          `• ${c.title}: ETB ${c.price?.toLocaleString()} | ${c.bedrooms}bd/${c.bathrooms}ba | ${c.area}m² | ${c.location} | Status: ${c.status}`
        ).join('\n')
      : 'No comparable properties found in database yet.';

    const amenitiesList = Array.isArray(propertyData.amenities) && propertyData.amenities.length > 0
      ? propertyData.amenities.join(', ')
      : 'None specified';

    const systemPrompt = `You are an expert Ethiopian real estate valuator with deep knowledge of property markets across all Ethiopian cities, especially Addis Ababa subcities. You analyze properties and provide accurate price estimates based on location, size, amenities, condition, and market comparables.

You understand:
- Ethiopian real estate market dynamics (2020-2025)
- Price differences between subcities (Bole vs Kolfe vs Arada etc.)
- Impact of amenities on price (generator, parking, security, elevator etc.)
- Difference between sale prices and rental rates
- How floor number, building age, and condition affect value
- Current ETB exchange rates and economic conditions

Always give prices in Ethiopian Birr (ETB). Be specific and realistic. Format your response as JSON only.`;

    const userPrompt = `Please estimate the market value for this Ethiopian property:

PROPERTY DETAILS:
- Type: ${propertyData.type === 'sale' ? 'For Sale' : propertyData.type === 'long_rent' ? 'Long-term Rental' : 'Short Stay'}
- Title: ${propertyData.title || 'Not specified'}
- Region: ${propertyData.region || 'Not specified'}
- City: ${propertyData.city || 'Not specified'}
- Subcity: ${propertyData.subcity || 'Not specified'}
- Woreda: ${propertyData.woreda || 'Not specified'}
- Specific Location: ${propertyData.specific_location || 'Not specified'}
- Bedrooms: ${propertyData.bedrooms || 'Not specified'}
- Bathrooms: ${propertyData.bathrooms || 'Not specified'}
- Area: ${propertyData.area ? `${propertyData.area} m²` : 'Not specified'}
- Floor: ${propertyData.floor || 'Not specified'} of ${propertyData.total_floors || 'unknown'}
- Year Built: ${propertyData.year_built || 'Not specified'}
- Amenities: ${amenitiesList}
- Description: ${propertyData.description || 'Not provided'}

COMPARABLE PROPERTIES ON ቤታችን PLATFORM:
${comparablesText}

${imageUrls && imageUrls.length > 0 ? `PHOTOS: ${imageUrls.length} photo(s) provided for visual assessment.` : ''}

Based on all this information, provide a price estimate in this exact JSON format:
{
  "suggested_price": <number>,
  "price_range_min": <number>,
  "price_range_max": <number>,
  "confidence": "high" | "medium" | "low",
  "currency": "ETB",
  "unit": ${propertyData.type === 'long_rent' ? '"per_month"' : propertyData.type === 'short_rent' ? '"per_night"' : '"total"'},
  "reasoning": "<2-3 sentence explanation in English>",
  "reasoning_am": "<same explanation in Amharic>",
  "factors_positive": ["<factor1>", "<factor2>", "<factor3>"],
  "factors_negative": ["<factor1>", "<factor2>"],
  "market_insight": "<one sentence about current market in this area>",
  "comparable_count": ${comparables?.length || 0}
}

Return ONLY the JSON, no other text.`;

    // Build messages — include images if provided
    const messages: any[] = [];

    if (imageUrls && imageUrls.length > 0) {
      const content: any[] = [{ type: 'text', text: userPrompt }];
      // Add up to 3 images for visual assessment
      for (const url of imageUrls.slice(0, 3)) {
        content.push({
          type: 'image',
          source: { type: 'url', url }
        });
      }
      messages.push({ role: 'user', content });
    } else {
      messages.push({ role: 'user', content: userPrompt });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages
      })
    });

    const aiData = await response.json();
    const rawText = aiData.content?.[0]?.text || '{}';

    // Parse JSON response
    const clean = rawText.replace(/```json|```/g, '').trim();
    const estimate = JSON.parse(clean);

    return NextResponse.json({ success: true, estimate });
  } catch (err: any) {
    console.error('Price suggestion error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

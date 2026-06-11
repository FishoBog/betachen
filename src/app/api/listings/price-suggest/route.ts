import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Formula-based price suggestion. Returns the exact shape the PriceSuggestion
// component expects: { success, estimate }. No external AI call, so it has no
// API-key dependency and never throws a "network error". Can later be swapped
// for an AI-backed implementation without touching the frontend.
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Rough base sale price per square metre (ETB) by city. Addis Ababa anchors the
// top of the market; regional cities scale down. These are deliberately
// conservative ballpark figures for a *suggestion*, not an appraisal.
const CITY_BASE_PER_SQM: Record<string, number> = {
  'Addis Ababa': 75000,
  'Shaggar': 55000,
  'Bishoftu': 45000,
  'Adama': 42000,
  'Hawassa': 40000,
  'Bahir Dar': 38000,
  'Dire Dawa': 36000,
  'Mekelle': 34000,
  'Gondar': 32000,
  'Jimma': 30000,
  'Dessie': 28000,
  'Shashemene': 28000,
  'Harar': 30000,
  'Jigjiga': 26000,
  'Sodo': 25000,
  'Arba Minch': 25000,
  'Hosaena': 24000,
};
const DEFAULT_PER_SQM = 30000;

// Amenities that meaningfully lift value, with a rough multiplier each.
const PREMIUM_AMENITIES = ['elevator', 'pool', 'gym', 'solar', 'generator', 'cctv', 'furnished', 'ac'];

function num(v: any): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export async function POST(req: NextRequest) {
  try {
    const { propertyData } = await req.json();
    const p = propertyData || {};

    const city: string = p.city || '';
    const area = num(p.area);
    const bedrooms = num(p.bedrooms);
    const bathrooms = num(p.bathrooms);
    const amenities: string[] = Array.isArray(p.amenities) ? p.amenities : [];
    const type: string = p.type || 'sale';

    // --- Base value from area × city rate ---
    const perSqm = CITY_BASE_PER_SQM[city] ?? DEFAULT_PER_SQM;
    // If no area given, fall back to a rooms-based footprint estimate.
    const effectiveArea = area > 0 ? area : Math.max(60, (bedrooms || 2) * 35 + 30);
    let base = effectiveArea * perSqm;

    // --- Adjustments ---
    const positive: string[] = [];
    const negative: string[] = [];

    // Bedrooms / bathrooms nudge value.
    if (bedrooms >= 4) { base *= 1.12; positive.push(`Spacious ${bedrooms}-bedroom layout`); }
    else if (bedrooms === 3) { base *= 1.05; }
    else if (bedrooms > 0 && bedrooms <= 1) { base *= 0.92; negative.push('Compact (1 bedroom) — smaller buyer pool'); }

    if (bathrooms >= 3) { base *= 1.06; positive.push(`${bathrooms} bathrooms`); }

    // Condition.
    if (p.condition === 'new') { base *= 1.10; positive.push('New / recently built condition'); }
    else if (p.condition === 'needs_renovation') { base *= 0.82; negative.push('Needs renovation — priced below move-in-ready homes'); }

    // Amenities.
    const premiumHits = amenities.filter(a => PREMIUM_AMENITIES.includes(a));
    if (premiumHits.length > 0) {
      base *= (1 + Math.min(0.15, premiumHits.length * 0.03));
      positive.push(`Premium amenities: ${premiumHits.join(', ')}`);
    }
    if (city) positive.push(`Located in ${city}`);

    // --- Convert sale value to the right unit for rentals ---
    let unit = 'total';
    let suggested = base;
    if (type === 'long_rent') {
      // Rough monthly rent ≈ 0.5% of sale value.
      suggested = base * 0.005;
      unit = 'per_month';
    } else if (type === 'short_rent') {
      // Rough nightly ≈ monthly/30 with a short-stay premium.
      suggested = base * 0.005 / 30 * 1.6;
      unit = 'per_night';
    }

    // Round to something clean.
    const round = (n: number) => {
      if (n >= 1000000) return Math.round(n / 50000) * 50000;
      if (n >= 10000) return Math.round(n / 1000) * 1000;
      return Math.round(n / 100) * 100;
    };
    suggested = round(suggested);
    const rangeMin = round(suggested * 0.88);
    const rangeMax = round(suggested * 1.12);

    // --- Real comparable count from the database (same city + type, active) ---
    let comparableCount = 0;
    try {
      const { count } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('type', type)
        .ilike('location', `%${city}%`);
      comparableCount = count || 0;
    } catch {
      comparableCount = 0;
    }

    // --- Confidence based on how much the listing told us ---
    let dataPoints = 0;
    if (area > 0) dataPoints++;
    if (bedrooms > 0) dataPoints++;
    if (bathrooms > 0) dataPoints++;
    if (city) dataPoints++;
    if (amenities.length > 0) dataPoints++;
    const confidence: 'high' | 'medium' | 'low' =
      dataPoints >= 4 && area > 0 ? 'high' : dataPoints >= 2 ? 'medium' : 'low';

    if (area <= 0) negative.push('No floor area provided — estimate is approximate');

    const unitWord = unit === 'per_month' ? 'monthly rent' : unit === 'per_night' ? 'nightly rate' : 'sale price';
    const reasoning =
      `This ${unitWord} estimate is based on ${city || 'the selected area'}'s typical price levels` +
      `${area > 0 ? ` for a ${effectiveArea} m² property` : ''}` +
      `${bedrooms > 0 ? ` with ${bedrooms} bedroom(s)` : ''}, adjusted for condition and amenities. ` +
      `It is a market-based guide — final pricing depends on exact location, finishing quality, and demand.`;

    const reasoning_am =
      `ይህ የ${unitWord === 'sale price' ? 'መሸጫ ዋጋ' : unitWord === 'monthly rent' ? 'ወርሃዊ ኪራይ' : 'የሌሊት ዋጋ'} ግምት ` +
      `በ${city || 'በተመረጠው አካባቢ'} ያለውን የተለመደ የዋጋ ደረጃ መሰረት በማድረግ` +
      `${area > 0 ? ` ለ${effectiveArea} ካሬ ሜትር ንብረት` : ''} ተሰልቷል። ` +
      `ይህ የገበያ ግምት ነው — የመጨረሻው ዋጋ በትክክለኛው አካባቢ፣ በማጠናቀቂያ ጥራት እና በፍላጎት ይወሰናል።`;

    const marketInsight =
      comparableCount > 0
        ? `There are ${comparableCount} active ${type === 'sale' ? 'sale' : 'rental'} listing(s) in ${city} on Betachen right now — check them to position your price competitively.`
        : `There are few comparable active listings in ${city} yet, so this estimate leans on city-wide averages. Pricing competitively now can help you stand out.`;

    const estimate = {
      suggested_price: suggested,
      price_range_min: rangeMin,
      price_range_max: rangeMax,
      confidence,
      currency: 'ETB',
      unit,
      reasoning,
      reasoning_am,
      factors_positive: positive.length ? positive : ['Standard property in a recognised city'],
      factors_negative: negative,
      market_insight: marketInsight,
      comparable_count: comparableCount,
    };

    return NextResponse.json({ success: true, estimate });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Could not generate estimate.' },
      { status: 500 }
    );
  }
}

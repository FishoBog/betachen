import { NextRequest, NextResponse } from 'next/server';

// Formula-based price suggestion. Returns { success, estimate } in the exact
// shape the PriceSuggestion component expects. Hardened so it can NEVER throw:
// the optional database "comparable count" is fully isolated, and everything is
// wrapped so any failure still returns a usable estimate (never a 500).
export const runtime = 'nodejs';

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
const PREMIUM_AMENITIES = ['elevator', 'pool', 'gym', 'solar', 'generator', 'cctv', 'furnished', 'ac'];

function num(v: any): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

// Optional: count comparable active listings. Fully isolated — any failure here
// (missing env var, network, etc.) returns 0 and never breaks the estimate.
async function getComparableCount(city: string, type: string): Promise<number> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || !city) return 0;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { count } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('type', type)
      .ilike('location', `%${city}%`);
    return count || 0;
  } catch {
    return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const p = body?.propertyData || {};

    const city: string = p.city || '';
    const area = num(p.area);
    const bedrooms = num(p.bedrooms);
    const bathrooms = num(p.bathrooms);
    const amenities: string[] = Array.isArray(p.amenities) ? p.amenities : [];
    const type: string = p.type || 'sale';

    const perSqm = CITY_BASE_PER_SQM[city] ?? DEFAULT_PER_SQM;
    const effectiveArea = area > 0 ? area : Math.max(60, (bedrooms || 2) * 35 + 30);
    let base = effectiveArea * perSqm;

    const positive: string[] = [];
    const negative: string[] = [];

    if (bedrooms >= 4) { base *= 1.12; positive.push(`Spacious ${bedrooms}-bedroom layout`); }
    else if (bedrooms === 3) { base *= 1.05; }
    else if (bedrooms > 0 && bedrooms <= 1) { base *= 0.92; negative.push('Compact (1 bedroom) — smaller buyer pool'); }

    if (bathrooms >= 3) { base *= 1.06; positive.push(`${bathrooms} bathrooms`); }

    if (p.condition === 'new') { base *= 1.10; positive.push('New / recently built condition'); }
    else if (p.condition === 'needs_renovation') { base *= 0.82; negative.push('Needs renovation — priced below move-in-ready homes'); }

    const premiumHits = amenities.filter(a => PREMIUM_AMENITIES.includes(a));
    if (premiumHits.length > 0) {
      base *= (1 + Math.min(0.15, premiumHits.length * 0.03));
      positive.push(`Premium amenities: ${premiumHits.join(', ')}`);
    }
    if (city) positive.push(`Located in ${city}`);

    let unit = 'total';
    let suggested = base;
    if (type === 'long_rent') { suggested = base * 0.005; unit = 'per_month'; }
    else if (type === 'short_rent') { suggested = base * 0.005 / 30 * 1.6; unit = 'per_night'; }

    const round = (n: number) => {
      if (n >= 1000000) return Math.round(n / 50000) * 50000;
      if (n >= 10000) return Math.round(n / 1000) * 1000;
      return Math.round(n / 100) * 100;
    };
    suggested = round(suggested);
    const rangeMin = round(suggested * 0.88);
    const rangeMax = round(suggested * 1.12);

    const comparableCount = await getComparableCount(city, type);

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
        : `There are few comparable active listings in ${city || 'this area'} yet, so this estimate leans on city-wide averages. Pricing competitively now can help you stand out.`;

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
      { status: 200 }
    );
  }
}

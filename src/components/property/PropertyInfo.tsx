'use client';
import type { Property } from '@/types';
import { useLang } from '@/context/LangContext';
import { CheckCircle, AlertCircle, Zap, Wifi, Droplets, Shield, Car, Home } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: highlight ? '#059669' : '#111827' }}>{value}</span>
    </div>
  );
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, background: bg, color, fontSize: 13, fontWeight: 600 }}>
      {children}
    </span>
  );
}

function UtilityItem({ icon: Icon, label, value, good }: { icon: any; label: string; value: string; good?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: good ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={good ? '#059669' : '#9ca3af'} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #f3f4f6' }}>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PropertyInfo({ property }: { property: Property }) {
  const { lang } = useLang();
  const am = lang === 'AM';
  const p = property as any;

  const roadLabel = (t: string) => t === 'asphalt' ? (am ? 'አስፋልት' : 'Asphalt / Paved') : t === 'cobblestone' ? (am ? 'ጠጠር' : 'Cobblestone') : (am ? 'የጸና መንገድ' : 'Dirt Road');
  const kitchenLabel = (t: string) => t === 'private' ? (am ? 'የግል ወጥ ቤት' : 'Private Kitchen') : t === 'shared' ? (am ? 'የጋራ ወጥ ቤት' : 'Shared Kitchen') : (am ? 'ወጥ ቤት የለም' : 'No Kitchen');
  const bathroomLabel = (t: string) => t === 'private' ? (am ? 'የግል' : 'Private') : (am ? 'የጋራ' : 'Shared');
  const electricityLabel = (t: string) => t === '24hr' ? (am ? '24 ሰዓት ያለ መቆራረጥ' : '24 hrs — Reliable') : t === 'frequent_cuts' ? (am ? 'ተደጋጋሚ መቆራረጥ' : 'Frequent Power Cuts') : (am ? 'ሶላር ብቻ' : 'Solar Only');
  const internetLabel = (t: string) => t === 'fiber' ? (am ? 'ኢትዮ ፋይበር' : 'Ethio Telecom Fiber') : t === 'mobile' ? (am ? 'ሞባይል ዳታ' : 'Mobile Data Only') : (am ? 'ፋይበር + ሞባይል' : 'Fiber + Mobile');

  // ── Property Summary (Zillow-style) ──────────────────────────────────────
  const buildSummary = () => {
    const parts: string[] = [];
    if (property.bedrooms) parts.push(`${property.bedrooms}-bed`);
    if (property.bathrooms) parts.push(`${property.bathrooms}-bath`);
    if (property.area_sqm) parts.push(`${property.area_sqm} m²`);
    const type = p.type === 'sale' ? 'property' : p.type === 'long_rent' ? 'rental' : 'short-stay property';
    const loc = p.location || p.subcity || 'Addis Ababa';
    const highlights: string[] = [];
    if (p.ground_water) highlights.push('borehole water');
    if (p.electricity_reliability === '24hr') highlights.push('24hr electricity');
    if (p.has_compound_wall) highlights.push('walled compound');
    if (p.road_type === 'asphalt') highlights.push('asphalt road access');
    if (p.internet_type === 'fiber' || p.internet_type === 'both') highlights.push('fiber internet');
    if (p.parking_spaces) highlights.push(`${p.parking_spaces} parking space${p.parking_spaces > 1 ? 's' : ''}`);

    let summary = parts.length > 0
      ? `This ${parts.join(', ')} ${type} is located in ${loc}.`
      : `This ${type} is located in ${loc}.`;

    if (property.description) {
      summary += ` ${property.description.slice(0, 180)}${property.description.length > 180 ? '...' : ''}`;
    }
    if (highlights.length > 0) {
      summary += ` Key features include ${highlights.join(', ')}.`;
    }
    return summary;
  };

  // ── Construction stage ───────────────────────────────────────────────────
  const constructionStages: Record<string, { label: string; color: string; bg: string; desc: string }> = {
    land_only:        { label: am ? 'ባዶ መሬት' : 'Land Only',              color: '#92400e', bg: '#fef3c7', desc: am ? 'ያልተሰራ ቦታ ብቻ' : 'Undeveloped land — build your own' },
    foundation:       { label: am ? 'መሰረት ብቻ' : 'Foundation Stage',      color: '#1d4ed8', bg: '#dbeafe', desc: am ? 'መሰረት ተቆፍሯል' : 'Foundation laid, construction not yet started' },
    under_construction:{ label: am ? 'በግንባታ ላይ' : 'Under Construction',  color: '#d97706', bg: '#fef3c7', desc: am ? 'ግንባታ ቀጥሏል' : 'Currently under construction' },
    shell_only:       { label: am ? 'ቅርፊት ብቻ' : 'Shell / Carcass',       color: '#7c3aed', bg: '#ede9fe', desc: am ? 'ጉዋዳ ብቻ — ፍሬም ተጠናቋል' : 'Structural shell complete, interior unfinished' },
    finishing:        { label: am ? 'ፊኒሺንግ ላይ' : 'Finishing Stage',      color: '#0891b2', bg: '#cffafe', desc: am ? 'ፊኒሺንግ ላይ ነው' : 'Interior finishing in progress' },
    completed:        { label: am ? 'ተጠናቋል' : 'Completed',               color: '#059669', bg: '#d1fae5', desc: am ? 'ዝግጁ ነው' : 'Move-in ready' },
  };

  const stage = p.construction_stage ? constructionStages[p.construction_stage] : null;

  // ── Condition ────────────────────────────────────────────────────────────
  const conditionMap: Record<string, { label: string; color: string; bg: string }> = {
    new:              { label: am ? 'አዲስ / በቅርብ የተሰራ' : 'New / Recently Built', color: '#059669', bg: '#d1fae5' },
    good:             { label: am ? 'ጥሩ ሁኔታ' : 'Good Condition',               color: '#1d4ed8', bg: '#dbeafe' },
    needs_renovation: { label: am ? 'ጥገና ያስፈልጋል' : 'Needs Renovation',         color: '#92400e', bg: '#fef3c7' },
  };
  const condition = p.condition ? conditionMap[p.condition] : null;

  return (
    <div style={{ display: 'grid', gap: 32 }}>

      {/* ── SUMMARY ── */}
      <div style={{ background: 'linear-gradient(135deg, #f8faff, #f0f6ff)', borderRadius: 14, padding: '20px 24px', border: '1px solid #dbeafe' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#006AFF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
          {am ? 'ስለ ንብረቱ' : 'About This Property'}
        </div>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>
          {am && property.description ? property.description : buildSummary()}
        </p>
      </div>

      {/* ── STATUS BADGES ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {condition && (
          <Badge color={condition.color} bg={condition.bg}>
            <CheckCircle size={13} /> {condition.label}
          </Badge>
        )}
        {stage && (
          <Badge color={stage.color} bg={stage.bg}>
            <Home size={13} /> {stage.label}
          </Badge>
        )}
        {p.bank_loan_eligible && (
          <Badge color="#059669" bg="#d1fae5">
            <CheckCircle size={13} /> {am ? 'ለባንክ ብድር ብቁ' : 'Bank Loan Eligible'}
          </Badge>
        )}
        {p.diaspora_friendly && (
          <Badge color="#7c3aed" bg="#ede9fe">
            <CheckCircle size={13} /> {am ? 'ዲያስፖራ ተስማሚ' : 'Diaspora Friendly'}
          </Badge>
        )}
        {p.managed_property && (
          <Badge color="#0891b2" bg="#cffafe">
            <CheckCircle size={13} /> {am ? 'የሚተዳደር ንብረት' : 'Managed Property'}
          </Badge>
        )}
      </div>

      {/* ── CONSTRUCTION STAGE DETAIL ── */}
      {stage && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>
              {am ? 'የግንባታ ደረጃ' : 'Construction Stage'}: {stage.label}
            </div>
            <div style={{ fontSize: 13, color: '#78350f' }}>{stage.desc}</div>
          </div>
        </div>
      )}

      {/* ── BANK LOAN INFO ── */}
      {p.bank_loan_eligible && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
            {am ? 'ለባንክ ብድር ብቁ ነው' : 'This property is eligible for bank financing'}
          </div>
          <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.6 }}>
            {am
              ? 'ባለቤቱ ለባንክ ብድር ያስፈልጉ ሰነዶችን ማቅረብ ይችላሉ። ለዝርዝር መረጃ ባለቤቱን ያነጋግሩ።'
              : 'The owner can provide documentation required for bank financing. Contact the owner to learn more about available loan options through Ethiopian banks.'}
          </div>
          {p.bank_loan_notes && (
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#065f46' }}>{p.bank_loan_notes}</div>
          )}
        </div>
      )}

      {/* ── PROPERTY DETAILS ── */}
      <div>
        <SectionTitle>{am ? 'የንብረት ዝርዝሮች' : 'Property Details'}</SectionTitle>
        <div>
          {property.bedrooms != null && <DetailRow label={am ? 'መኝታ ክፍሎች' : 'Bedrooms'} value={`${property.bedrooms}`} />}
          {property.bathrooms != null && <DetailRow label={am ? 'መታጠቢያ ክፍሎች' : 'Bathrooms'} value={`${property.bathrooms} (${bathroomLabel(property.bathroom_type ?? 'private')})`} />}
          {p.total_rooms && <DetailRow label={am ? 'ጠቅላላ ክፍሎች' : 'Total Rooms'} value={`${p.total_rooms}`} />}
          {property.kitchen_type && <DetailRow label={am ? 'ወጥ ቤት' : 'Kitchen'} value={kitchenLabel(property.kitchen_type)} />}
          {property.area_sqm && <DetailRow label={am ? 'የቤት ስፋት' : 'Living Area'} value={`${property.area_sqm} m²`} />}
          {p.plot_area_sqm && <DetailRow label={am ? 'የቦታ ስፋት' : 'Plot / Land Area'} value={`${p.plot_area_sqm} m²`} />}
          {property.floor && <DetailRow label={am ? 'ፎቅ' : 'Floor'} value={`${property.floor}${property.total_floors ? ` of ${property.total_floors}` : ''}`} />}
          {property.year_built && <DetailRow label={am ? 'የተሰራ ዓመት' : 'Year Built'} value={`${property.year_built}`} />}
          {p.parking_spaces && <DetailRow label={am ? 'ፓርኪንግ' : 'Parking'} value={`${p.parking_spaces} space${p.parking_spaces > 1 ? 's' : ''}`} />}
          {p.road_type && <DetailRow label={am ? 'የመንገድ አይነት' : 'Road Access'} value={roadLabel(p.road_type)} highlight={p.road_type === 'asphalt'} />}
          {p.distance_to_road_m && <DetailRow label={am ? 'ከዋና መንገድ ርቀት' : 'Distance to Main Road'} value={`${p.distance_to_road_m} metres`} />}
        </div>
      </div>

      {/* ── UTILITIES ── */}
      <div>
        <SectionTitle>{am ? 'አገልግሎቶች እና መሰረተ ልማት' : 'Utilities & Infrastructure'}</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {p.electricity_reliability && (
            <UtilityItem icon={Zap} label={am ? 'ኤሌክትሪክ' : 'Electricity'} value={electricityLabel(p.electricity_reliability)} good={p.electricity_reliability === '24hr'} />
          )}
          {p.internet_type && p.internet_type !== 'none' && (
            <UtilityItem icon={Wifi} label={am ? 'ኢንተርኔት' : 'Internet'} value={internetLabel(p.internet_type)} good={p.internet_type === 'fiber' || p.internet_type === 'both'} />
          )}
          {p.ground_water && (
            <UtilityItem icon={Droplets} label={am ? 'የከርሰ ምድር ውሃ' : 'Ground Water'} value={am ? 'ቦሪሆል / ጉድጓድ አለ' : 'Borehole / Well on site'} good />
          )}
          {p.water_tanker && (
            <UtilityItem icon={Droplets} label={am ? 'የውሃ ታንከር' : 'Water Tanker'} value={am ? 'ይገኛል' : 'Delivery available'} good />
          )}
          {p.parking_spaces && (
            <UtilityItem icon={Car} label={am ? 'ፓርኪንግ' : 'Parking'} value={`${p.parking_spaces} ${am ? 'ቦታ' : 'space' + (p.parking_spaces > 1 ? 's' : '')}`} good />
          )}
          {p.has_compound_wall && (
            <UtilityItem icon={Shield} label={am ? 'ደህንነት' : 'Security'} value={am ? 'የግቢ ግድግዳ / አጥር' : 'Compound wall / fence'} good />
          )}
          {p.has_guard_house && (
            <UtilityItem icon={Shield} label={am ? 'ጠባቂ' : 'Guard'} value={am ? 'የጠባቂ ቤት አለ' : 'Guard house on site'} good />
          )}
        </div>
      </div>

      {/* ── AMENITIES ── */}
      {property.amenities?.length > 0 && (
        <div>
          <SectionTitle>{am ? 'ተጨማሪ አገልግሎቶች' : 'Amenities'}</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {property.amenities.map(a => (
              <span key={a} style={{ padding: '6px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>
                {a.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── NEARBY ── */}
      {p.nearby_landmarks?.length > 0 && (
        <div>
          <SectionTitle>{am ? 'አቅራቢያ የሚገኙ' : 'Nearby'}</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {p.nearby_landmarks.map((l: string) => (
              <span key={l} style={{ padding: '6px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

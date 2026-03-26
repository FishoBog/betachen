'use client';
import type { Property } from '@/types';
import { useLang } from '@/context/LangContext';

const AMENITY_LABELS: Record<string, { en: string; am: string }> = {
  parking:    { en: '🚗 Parking',          am: '🚗 ፓርኪንግ' },
  wifi:       { en: '📶 WiFi',             am: '📶 ዋይፋይ' },
  generator:  { en: '⚡ Generator',        am: '⚡ ጀነሬተር' },
  water_tank: { en: '💧 Water Tank',       am: '💧 የውሃ ታንከር' },
  security:   { en: '💂 Security Guard',   am: '💂 ጠባቂ' },
  cctv:       { en: '📹 CCTV',             am: '📹 ካሜራ' },
  gym:        { en: '🏋️ Gym',              am: '🏋️ ጂም' },
  pool:       { en: '🏊 Swimming Pool',    am: '🏊 መዋኛ' },
  elevator:   { en: '🛗 Elevator',         am: '🛗 ሊፍት' },
  furnished:  { en: '🛋️ Furnished',        am: '🛋️ የታጠቀ' },
  ac:         { en: '❄️ Air Conditioning', am: '❄️ ኤርኮንዲሽን' },
  solar:      { en: '☀️ Solar Panel',      am: '☀️ ሶላር' },
  garden:     { en: '🌿 Garden',           am: '🌿 የአትክልት ቦታ' },
  balcony:    { en: '🏠 Balcony',          am: '🏠 በረንዳ' },
};

const CONDITION_CONFIG: Record<string, { en: string; am: string; color: string; bg: string }> = {
  new:              { en: 'New / Recently Built', am: 'አዲስ / በቅርብ የተሰራ', color: '#065f46', bg: '#d1fae5' },
  good:             { en: 'Good Condition',        am: 'ጥሩ ሁኔታ',            color: '#1d4ed8', bg: '#dbeafe' },
  needs_renovation: { en: 'Needs Renovation',      am: 'ጥገና ያስፈልጋል',       color: '#92400e', bg: '#fef3c7' },
};

function FactItem({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '14px 16px', borderRadius: 12,
      background: highlight ? '#fef2ee' : '#f9fafb',
      border: `1px solid ${highlight ? '#fcd9c7' : '#e5e7eb'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: highlight ? '#E8431A' : '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', paddingLeft: 22 }}>{value}</div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap' as const }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    </div>
  );
}

export function PropertyInfo({ property }: { property: Property }) {
  const { lang } = useLang();
  const am = lang === 'AM';
  const p = property as any;
  const condition = p.condition ? CONDITION_CONFIG[p.condition] : null;

  const roadLabel = (type: string) => {
    if (am) return type === 'asphalt' ? 'አስፋልት' : type === 'cobblestone' ? 'ኮብልስቶን' : 'የጸና መንገድ';
    return type === 'asphalt' ? 'Asphalt Road' : type === 'cobblestone' ? 'Cobblestone' : 'Dirt Road';
  };

  const kitchenLabel = (type: string) => {
    if (am) return type === 'private' ? 'የግል ወጥ ቤት' : type === 'shared' ? 'የጋራ ወጥ ቤት' : 'ወጥ ቤት የለም';
    return type === 'private' ? 'Private Kitchen' : type === 'shared' ? 'Shared Kitchen' : 'No Kitchen';
  };

  const bathroomLabel = (type: string) => {
    if (am) return type === 'private' ? 'የግል' : 'የጋራ';
    return type === 'private' ? 'Private' : 'Shared';
  };

  const electricityLabel = (type: string) => {
    if (am) return type === '24hr' ? '24 ሰዓት ያለ መቆራረጥ' : type === 'frequent_cuts' ? 'ተደጋጋሚ መቆራረጥ አለ' : 'ሶላር ብቻ';
    return type === '24hr' ? '24hrs — Reliable' : type === 'frequent_cuts' ? 'Frequent Power Cuts' : 'Solar Only';
  };

  const internetLabel = (type: string) => {
    if (am) return type === 'fiber' ? 'ኢትዮ ፋይበር' : type === 'mobile' ? 'ሞባይል ዳታ' : 'ፋይበር + ሞባይል';
    return type === 'fiber' ? 'Ethio Telecom Fiber' : type === 'mobile' ? 'Mobile Data Only' : 'Fiber + Mobile Data';
  };

  return (
    <div style={{ display: 'grid', gap: 28 }}>

      {/* Description */}
      {property.description && (
        <div>
          <SectionHeading>{am ? '📝 መግለጫ' : '📝 About this property'}</SectionHeading>
          <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, margin: 0 }}>{property.description}</p>
        </div>
      )}

      {/* Condition */}
      {condition && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: condition.bg, borderRadius: 20, width: 'fit-content' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: condition.color }}>
            🏗️ {am ? condition.am : condition.en}
          </span>
        </div>
      )}

      {/* Key facts */}
      <div>
        <SectionHeading>{am ? '🔑 ዋና መረጃዎች' : '🔑 Key Facts'}</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
          {property.bedrooms ? <FactItem icon="🛏" label={am ? 'መኝታ ክፍሎች' : 'Bedrooms'} value={`${property.bedrooms}`} /> : null}
          {property.bathrooms ? <FactItem icon="🚿" label={am ? 'መታጠቢያ' : 'Bathrooms'} value={`${property.bathrooms} — ${bathroomLabel(property.bathroom_type ?? 'private')}`} /> : null}
          {p.total_rooms ? <FactItem icon="🚪" label={am ? 'ጠቅላላ ክፍሎች' : 'Total Rooms'} value={`${p.total_rooms}`} /> : null}
          {property.kitchen_type ? <FactItem icon="🍳" label={am ? 'ወጥ ቤት' : 'Kitchen'} value={kitchenLabel(property.kitchen_type)} highlight={property.kitchen_type === 'private'} /> : null}
          {property.area_sqm ? <FactItem icon="📐" label={am ? 'የቤት ስፋት' : 'House Area'} value={`${property.area_sqm} m²`} /> : null}
          {p.plot_area_sqm ? <FactItem icon="🗺️" label={am ? 'የቦታ ስፋት' : 'Plot Area'} value={`${p.plot_area_sqm} m²`} /> : null}
          {property.floor ? <FactItem icon="🏢" label={am ? 'ፎቅ' : 'Floor'} value={`${property.floor}${property.total_floors ? ` / ${property.total_floors}` : ''}`} /> : null}
          {property.year_built ? <FactItem icon="📅" label={am ? 'የተሰራ' : 'Year Built'} value={`${property.year_built}`} /> : null}
          {p.parking_spaces ? <FactItem icon="🚗" label={am ? 'ፓርኪንግ' : 'Parking'} value={`${p.parking_spaces} ${am ? 'ቦታ' : 'spaces'}`} /> : null}
        </div>
      </div>

      {/* Location */}
      <div>
        <SectionHeading>{am ? '📍 አካባቢ' : '📍 Location Details'}</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
          {property.location_name ? <FactItem icon="📌" label={am ? 'አካባቢ' : 'Area'} value={property.location_name} /> : null}
          {p.road_type ? <FactItem icon="🛣️" label={am ? 'የመንገድ አይነት' : 'Road Type'} value={roadLabel(p.road_type)} highlight={p.road_type === 'asphalt'} /> : null}
          {p.distance_to_road_m ? (
            <FactItem
              icon="📏"
              label={am ? 'ከዋና መንገድ' : 'From Main Road'}
              value={`${p.distance_to_road_m}m ${am ? 'ርቀት' : 'to'} ${p.road_type ? roadLabel(p.road_type) : ''}`}
            />
          ) : null}
        </div>
      </div>

      {/* Utilities */}
      <div>
        <SectionHeading>{am ? '⚡ አገልግሎቶች' : '⚡ Utilities & Infrastructure'}</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
          {p.electricity_reliability ? (
            <FactItem icon="💡" label={am ? 'ኤሌክትሪክ' : 'Electricity'} value={electricityLabel(p.electricity_reliability)} highlight={p.electricity_reliability === '24hr'} />
          ) : null}
          {p.internet_type && p.internet_type !== 'none' ? (
            <FactItem icon="🌐" label={am ? 'ኢንተርኔት' : 'Internet'} value={internetLabel(p.internet_type)} highlight={p.internet_type === 'fiber' || p.internet_type === 'both'} />
          ) : null}
          {p.ground_water ? (
            <FactItem icon="💧" label={am ? 'የከርሰ ምድር ውሃ' : 'Ground Water'} value={am ? '✓ ቦሪሆል / ጉድጓድ አለ' : '✓ Borehole / Well on site'} highlight />
          ) : null}
          {p.water_tanker ? (
            <FactItem icon="🚛" label={am ? 'የውሃ ታንከር' : 'Water Tanker'} value={am ? '✓ ይገኛል' : '✓ Delivery Available'} highlight />
          ) : null}
        </div>
      </div>

      {/* Security */}
      {(p.has_compound_wall || p.has_guard_house) && (
        <div>
          <SectionHeading>{am ? '🔒 ደህንነት' : '🔒 Security'}</SectionHeading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {p.has_compound_wall && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#f0f6ff', border: '1px solid #bfdbfe', borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>🧱</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>{am ? 'የግቢ ግድግዳ / አጥር አለ' : 'Compound Wall / Fence'}</span>
              </div>
            )}
            {p.has_guard_house && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#f0f6ff', border: '1px solid #bfdbfe', borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>💂</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>{am ? 'የጠባቂ ቤት አለ' : 'Guard House on Site'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearby */}
      {p.nearby_landmarks?.length > 0 && (
        <div>
          <SectionHeading>{am ? '🏫 አቅራቢያ የሚገኙ' : '🏫 Walking Distance To'}</SectionHeading>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10, marginTop: -8 }}>
            {am ? 'ከዚህ ንብረት አቅራቢያ የሚገኙ:' : 'The following places are accessible nearby:'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {p.nearby_landmarks.map((l: string) => (
              <span key={l} style={{ padding: '7px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 13, color: '#374151', fontWeight: 600 }}>
                📍 {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {property.amenities?.length > 0 && (
        <div>
          <SectionHeading>{am ? '✨ ተጨማሪ አገልግሎቶች' : '✨ Amenities'}</SectionHeading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {property.amenities.map(a => (
              <span key={a} style={{ padding: '8px 16px', background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 10, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
                {am ? (AMENITY_LABELS[a]?.am ?? a) : (AMENITY_LABELS[a]?.en ?? a)}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
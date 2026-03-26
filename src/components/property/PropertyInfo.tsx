'use client';
import { BedDouble, Bath, Maximize2, MapPin, Calendar, Building, Car, Droplets, UtensilsCrossed, Navigation, Zap, Wifi, Shield } from 'lucide-react';
import type { Property } from '@/types';
import { useLang } from '@/context/LangContext';

const AMENITY_LABELS: Record<string, { en: string; am: string }> = {
  parking:    { en: '🚗 Parking',    am: '🚗 ፓርኪንግ' },
  wifi:       { en: '📶 WiFi',       am: '📶 ዋይፋይ' },
  generator:  { en: '⚡ Generator',  am: '⚡ ጀነሬተር' },
  water_tank: { en: '💧 Water Tank', am: '💧 የውሃ ታንከር' },
  security:   { en: '💂 Security',   am: '💂 ጠባቂ' },
  cctv:       { en: '📹 CCTV',       am: '📹 ካሜራ' },
  gym:        { en: '🏋️ Gym',        am: '🏋️ ጂም' },
  pool:       { en: '🏊 Pool',       am: '🏊 መዋኛ' },
  elevator:   { en: '🛗 Elevator',   am: '🛗 ሊፍት' },
  furnished:  { en: '🛋️ Furnished',  am: '🛋️ የተዘጋጀ' },
  ac:         { en: '❄️ A/C',        am: '❄️ ኤርኮንዲሽን' },
  solar:      { en: '☀️ Solar',      am: '☀️ ሶላር' },
  garden:     { en: '🌿 Garden',     am: '🌿 የአትክልት ቦታ' },
  balcony:    { en: '🏠 Balcony',    am: '🏠 በረንዳ' },
};

const CONDITION_LABELS: Record<string, { en: string; am: string; color: string; bg: string }> = {
  new:              { en: '✨ New / Recently Built', am: '✨ አዲስ / በቅርብ የተሰራ', color: '#065f46', bg: '#d1fae5' },
  good:             { en: '✓ Good Condition',        am: '✓ ጥሩ ሁኔታ',            color: '#1d4ed8', bg: '#dbeafe' },
  needs_renovation: { en: '🔧 Needs Renovation',     am: '🔧 ጥገና ያስፈልጋል',       color: '#92400e', bg: '#fef3c7' },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #f3f4f6' }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{children}</span>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#111827', fontWeight: 700, textAlign: 'right' as const }}>{value}</span>
    </div>
  );
}

export function PropertyInfo({ property }: { property: Property }) {
  const { lang } = useLang();
  const am = lang === 'AM';

  const p = property as any;
  const condition = p.condition ? CONDITION_LABELS[p.condition] : null;

  return (
    <div style={{ display: 'grid', gap: 28 }}>

      {/* Condition badge */}
      {condition && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: condition.bg, borderRadius: 20, width: 'fit-content' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: condition.color }}>
            {am ? condition.am : condition.en}
          </span>
        </div>
      )}

      {/* Description */}
      {property.description && (
        <div>
          <SectionTitle>{am ? 'መግለጫ' : 'Description'}</SectionTitle>
          <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: 15 }}>{property.description}</p>
        </div>
      )}

      {/* Facts & Features — Zillow style */}
      <div>
        <SectionTitle>{am ? 'እውነታዎች እና ባህሪያት' : 'Facts & Features'}</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 32px' }}>

          {/* Interior */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8431A', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 4, marginTop: 8 }}>
              {am ? 'ውስጥ' : 'Interior'}
            </div>
            {property.bedrooms ? <FactRow label={am ? 'መኝታ ክፍሎች' : 'Bedrooms'} value={property.bedrooms} /> : null}
            {property.bathrooms ? <FactRow label={am ? 'መታጠቢያ ክፍሎች' : 'Bathrooms'} value={`${property.bathrooms} (${am ? (property.bathroom_type === 'private' ? 'የግል' : 'የጋራ') : property.bathroom_type})`} /> : null}
            {p.total_rooms ? <FactRow label={am ? 'ጠቅላላ ክፍሎች' : 'Total Rooms'} value={p.total_rooms} /> : null}
            {property.kitchen_type && property.kitchen_type !== 'none' ? <FactRow label={am ? 'ወጥ ቤት' : 'Kitchen'} value={am ? (property.kitchen_type === 'private' ? 'የግል' : 'የጋራ') : property.kitchen_type} /> : null}
            {property.kitchen_type === 'none' ? <FactRow label={am ? 'ወጥ ቤት' : 'Kitchen'} value={am ? 'የለም' : 'None'} /> : null}
          </div>

          {/* Building */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8431A', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 4, marginTop: 8 }}>
              {am ? 'ህንፃ' : 'Building'}
            </div>
            {property.area_sqm ? <FactRow label={am ? 'የቤት ስፋት' : 'House Area'} value={`${property.area_sqm} m²`} /> : null}
            {p.plot_area_sqm ? <FactRow label={am ? 'የቦታ ስፋት' : 'Plot Area'} value={`${p.plot_area_sqm} m²`} /> : null}
            {property.floor ? <FactRow label={am ? 'ፎቅ' : 'Floor'} value={`${property.floor}${property.total_floors ? ` / ${property.total_floors}` : ''}`} /> : null}
            {property.year_built ? <FactRow label={am ? 'የተሰራበት ዓመት' : 'Year Built'} value={property.year_built} /> : null}
            {p.condition ? <FactRow label={am ? 'ሁኔታ' : 'Condition'} value={am ? CONDITION_LABELS[p.condition]?.am?.replace(/^[^ ]+ /, '') : CONDITION_LABELS[p.condition]?.en?.replace(/^[^ ]+ /, '')} /> : null}
          </div>

          {/* Location */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8431A', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 4, marginTop: 8 }}>
              {am ? 'አካባቢ' : 'Location'}
            </div>
            {property.location_name ? <FactRow label={am ? 'አድራሻ' : 'Address'} value={property.location_name} /> : null}
            {p.road_type ? <FactRow label={am ? 'የመንገድ አይነት' : 'Road Type'} value={am ? (p.road_type === 'asphalt' ? 'አስፋልት' : p.road_type === 'cobblestone' ? 'ኮብልስቶን' : 'የጸና መንገድ') : (p.road_type === 'asphalt' ? 'Asphalt' : p.road_type === 'cobblestone' ? 'Cobblestone' : 'Dirt Road')} /> : null}
            {p.distance_to_road_m ? <FactRow label={am ? 'ከዋና መንገድ ርቀት' : 'Distance to Main Road'} value={`${p.distance_to_road_m}m`} /> : null}
            {p.parking_spaces ? <FactRow label={am ? 'ፓርኪንግ' : 'Parking'} value={`${p.parking_spaces} ${am ? 'ቦታ' : 'spaces'}`} /> : null}
          </div>

          {/* Utilities */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8431A', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 4, marginTop: 8 }}>
              {am ? 'አገልግሎቶች' : 'Utilities'}
            </div>
            {p.electricity_reliability ? <FactRow label={am ? 'ኤሌክትሪክ' : 'Electricity'} value={am ? (p.electricity_reliability === '24hr' ? '24 ሰዓት' : p.electricity_reliability === 'frequent_cuts' ? 'ተደጋጋሚ መቆራረጥ' : 'ሶላር ብቻ') : (p.electricity_reliability === '24hr' ? '24hrs Reliable' : p.electricity_reliability === 'frequent_cuts' ? 'Frequent Cuts' : 'Solar Only')} /> : null}
            {p.internet_type && p.internet_type !== 'none' ? <FactRow label={am ? 'ኢንተርኔት' : 'Internet'} value={am ? (p.internet_type === 'fiber' ? 'ኢትዮ ፋይበር' : p.internet_type === 'mobile' ? 'ሞባይል ዳታ' : 'ፋይበር + ሞባይል') : (p.internet_type === 'fiber' ? 'Ethio Fiber' : p.internet_type === 'mobile' ? 'Mobile Data' : 'Fiber + Mobile')} /> : null}
            {p.ground_water !== undefined ? <FactRow label={am ? 'የከርሰ ምድር ውሃ' : 'Ground Water'} value={p.ground_water ? (am ? '✓ አለ' : '✓ Available') : (am ? 'የለም' : 'No')} /> : null}
            {p.water_tanker !== undefined ? <FactRow label={am ? 'የውሃ ታንከር' : 'Water Tanker'} value={p.water_tanker ? (am ? '✓ አለ' : '✓ Available') : (am ? 'የለም' : 'No')} /> : null}
          </div>

          {/* Security */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8431A', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 4, marginTop: 8 }}>
              {am ? 'ደህንነት' : 'Security'}
            </div>
            {p.has_compound_wall !== undefined ? <FactRow label={am ? 'የግቢ ግድግዳ' : 'Compound Wall'} value={p.has_compound_wall ? (am ? '✓ አለ' : '✓ Yes') : (am ? 'የለም' : 'No')} /> : null}
            {p.has_guard_house !== undefined ? <FactRow label={am ? 'የጠባቂ ቤት' : 'Guard House'} value={p.has_guard_house ? (am ? '✓ አለ' : '✓ Yes') : (am ? 'የለም' : 'No')} /> : null}
          </div>

        </div>
      </div>

      {/* Nearby landmarks */}
      {p.nearby_landmarks?.length > 0 && (
        <div>
          <SectionTitle>{am ? 'አቅራቢያ' : 'Nearby'}</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {p.nearby_landmarks.map((l: string) => (
              <span key={l} style={{ padding: '6px 14px', background: '#f0f6ff', border: '1px solid #bfdbfe', borderRadius: 20, fontSize: 13, color: '#1e40af', fontWeight: 500 }}>
                📍 {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {property.amenities?.length > 0 && (
        <div>
          <SectionTitle>{am ? 'አገልግሎቶች' : 'Amenities'}</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {property.amenities.map(a => (
              <span key={a} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#374151', fontWeight: 500 }}>
                {am ? (AMENITY_LABELS[a]?.am ?? a) : (AMENITY_LABELS[a]?.en ?? a)}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
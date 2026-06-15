'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import { Upload, MapPin, Home, CheckCircle, ArrowRight, ArrowLeft, X, ChevronDown, Mail, Phone, User, PlusCircle, Building2, Navigation, Tag, KeyRound, CalendarClock, Hotel, BedDouble, Store } from 'lucide-react';
import { PriceSuggestion } from '@/components/property/PriceSuggestion';

// Key under which an in-progress listing draft is auto-saved to the browser.
// This lets the form survive a refresh or the browser Back button instead of
// starting over. Cleared once the listing is successfully created.
const DRAFT_KEY = 'betachen_new_listing_draft_v1';

const ETHIOPIA_CITIES = [
  { cityEn: 'Addis Ababa', cityAm: 'አዲስ አበባ', subsEn: ['Bole','Yeka','Kirkos','Lemi Kura','Nifas Silk-Lafto','Arada','Lideta','Gullele','Kolfe Keraniyo','Akaki-Kality','Addis Ketema'], subsAm: ['ቦሌ','የካ','ቂርቆስ','ለሚ ኩራ','ንፋስ ስልክ ላፍቶ','አራዳ','ልደታ','ጉለሌ','ኮልፌ ቀራኒዮ','አቃቂ ቃሊቲ','አዲስ ከተማ'] },
  { cityEn: 'Dire Dawa', cityAm: 'ድሬዳዋ', subsEn: ['Kezira','Magala','Melka Jebdu','Sabiyan','Gende Qore'], subsAm: ['ቀዚራ','መጋላ','መልካ ጀብዱ','ሳቢያን','ገንደ ቆሬ'] },
  { cityEn: 'Adama', cityAm: 'አዳማ', subsEn: ['Bole','Arada','Dabe Soloke','Melka Adama','Boku'], subsAm: ['ቦሌ','አራዳ','ዳቤ ሶሎቄ','መልካ አዳማ','ቦቁ'] },
  { cityEn: 'Gondar', cityAm: 'ጎንደር', subsEn: ['Maraki','Arada','Azezo','Fasil','Jantekel'], subsAm: ['ማራኪ','አራዳ','አዘዞ','ፋሲል','ጃንተከል'] },
  { cityEn: 'Hawassa', cityAm: 'ሐዋሳ', subsEn: ['Hayiq Dar','Misrak','Tabor','Mehal'], subsAm: ['ሐይቅ ዳር','ምሥራቅ','ታቦር','መሀል'] },
  { cityEn: 'Bahir Dar', cityAm: 'ባሕር ዳር', subsEn: ['Belay Zeleke','Atse Tewodros','Fasilo','Shimbit'], subsAm: ['በላይ ዘለቀ','አፄ ቴዎድሮስ','ፋሲሎ','ሽምቢት'] },
  { cityEn: 'Mekelle', cityAm: 'መቐለ', subsEn: ['Hadnet','Ayder','Kedamay Weyane','Qwiha'], subsAm: ['ሃድነት','አይደር','ቀዳማይ ወያነ','ኩዊሃ'] },
  { cityEn: 'Jimma', cityAm: 'ጅማ', subsEn: ['Hermata','Jiren','Bosa Bazab'], subsAm: ['ሀርማታ','ጅሬን','ቦሳ ባዛብ'] },
  { cityEn: 'Dessie', cityAm: 'ደሴ', subsEn: ['Arada','Piazza','Dawudo'], subsAm: ['አራዳ','ፒያሳ','ዳውዶ'] },
  { cityEn: 'Shashemene', cityAm: 'ሻሸመኔ', subsEn: ['Bulchana','Arada','Kuyera'], subsAm: ['ቡልቻና','አራዳ','ኩየራ'] },
  { cityEn: 'Bishoftu', cityAm: 'ቢሾፍቱ', subsEn: ['Kebele 01','Kebele 02','Kuriftu'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ኩሪፍቱ'] },
  { cityEn: 'Harar', cityAm: 'ሐረር', subsEn: ['Jugol','Shenkor','Aboker'], subsAm: ['ጁጎል','ሸንኮር','አቦከር'] },
  { cityEn: 'Shaggar', cityAm: 'ሸገር', subsEn: ['Sebeta','Burayu','Sululta','Gelan','Holeta','Legetafo'], subsAm: ['ሰበታ','ቡራዩ','ሱሉልታ','ገላን','ሆለታ','ለገጣፎ'] },
  { cityEn: 'Jigjiga', cityAm: 'ጅጅጋ', subsEn: ['Karamarda','Dudahidi','Garab\'asse','Qordere'], subsAm: ['ካራማርዳ','ዱዳሂዲ','ጋራብአሰ','ቆርዴሬ'] },
  { cityEn: 'Sodo', cityAm: 'ሶዶ', subsEn: ['Mehal','Arada','Sikela'], subsAm: ['መሀል','አራዳ','ሲቄላ'] },
  { cityEn: 'Arba Minch', cityAm: 'አርባ ምንጭ', subsEn: ['Secha','Sikela'], subsAm: ['ሰቻ','ሲቄላ'] },
  { cityEn: 'Hosaena', cityAm: 'ሆሳዕና', subsEn: ['Bobicho','Arada','Sech-Duna','Lich-Amba','Jelo-Naremo','Heto'], subsAm: ['ቦቢቾ','አራዳ','ሰች-ዱና','ሊች-አምባ','ጀሎ-ናሬሞ','ሄቶ'] },
];

const CITY_COORDS: Record<string, [number, number]> = {
  'Addis Ababa': [9.0192, 38.7525], 'Dire Dawa': [9.5931, 41.8661],
  'Adama': [8.5400, 39.2700], 'Gondar': [12.6000, 37.4667],
  'Hawassa': [7.0500, 38.4667], 'Bahir Dar': [11.5742, 37.3614],
  'Mekelle': [13.4833, 39.4667], 'Jimma': [7.6667, 36.8333],
  'Dessie': [11.1333, 39.6333], 'Shashemene': [7.2000, 38.6000],
  'Bishoftu': [8.7500, 38.9833], 'Harar': [9.3000, 42.1333],
  'Shaggar': [9.0000, 38.7500], 'Jigjiga': [9.3500, 42.8000],
  'Sodo': [6.9000, 37.7500], 'Arba Minch': [6.0333, 37.5500],
  'Hosaena': [7.5500, 37.8500],
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid #e5e7eb', borderRadius: 11,
  fontSize: 16.5, color: '#111827', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', background: 'white',
};
const labelStyle: React.CSSProperties = {
  fontSize: 15.5, fontWeight: 600, color: '#1f2937', display: 'block', marginBottom: 7,
};
const sectionStyle: React.CSSProperties = {
  background: 'white', borderRadius: 16,
  border: '1px solid #e5e7eb', padding: '30px 34px', marginBottom: 20,
};
const subHeading: React.CSSProperties = {
  fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 13, marginTop: 22,
  paddingBottom: 9, borderBottom: '1px solid #f3f4f6',
};

const Req = () => <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>;

function Toggle({ label, desc, value, onChange, color = '#006AFF', bg = '#f0f6ff' }: { label: string; desc?: string; value: boolean; onChange: () => void; color?: string; bg?: string }) {
  return (
    <div onClick={onChange} style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${value ? color : '#e5e7eb'}`, background: value ? bg : 'white', cursor: 'pointer' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: value ? color : '#374151' }}>{value ? '✓ ' : ''}{label}</div>
      {desc && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{desc}</div>}
    </div>
  );
}

function MapPinPicker({ lat, lng, onPick, city, t, lang }: { lat: string; lng: string; onPick: (lat: number, lng: number) => void; city: string; t: any; lang: string }) {
  const defaultCoords = CITY_COORDS[city] || [9.0192, 38.7525];
  const [coordText, setCoordText] = useState(lat && lng ? `${lat}, ${lng}` : '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsOk, setGpsOk] = useState(false);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQ, setSearchQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  // Landmark search: type a place name, fly the map there. Works even where the
  // map shows few labels, since the geocoder finds the place regardless.
  const runLandmarkSearch = async () => {
    const q = searchQ.trim();
    if (!q) return;
    setSearching(true); setSearchMsg(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=et&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const flat = parseFloat(data[0].lat), flng = parseFloat(data[0].lon);
        if (mapInst.current && !isNaN(flat) && !isNaN(flng)) {
          mapInst.current.setView([flat, flng], 16);
        }
      } else {
        setSearchMsg(lang === 'EN' ? 'Place not found. Try a nearby landmark or area name.' : 'ቦታው አልተገኘም። በአቅራቢያ ያለ ምልክት ወይም የአካባቢ ስም ይሞክሩ።');
      }
    } catch {
      setSearchMsg(lang === 'EN' ? 'Search failed. Please try again.' : 'ፍለጋ አልተሳካም። እንደገና ይሞክሩ።');
    }
    setSearching(false);
  };

  // Tappable map: user taps the location of their property and we capture the
  // coordinates from the tapped point — no copying/pasting required.
  useEffect(() => {
    if (!mapEl.current || mapInst.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      if (cancelled || !mapEl.current) return;
      const start: [number, number] = (lat && lng) ? [parseFloat(lat), parseFloat(lng)] : defaultCoords;
      const map = L.map(mapEl.current).setView(start, 13);
      mapInst.current = map;
      // Standard OpenStreetMap tiles — densest labels for landmarks, churches,
      // mosques, schools, hospitals, businesses and place names, so the lister
      // can orient by nearby points of interest when dropping the pin.
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      if (lat && lng) {
        markerRef.current = L.marker(start).addTo(map);
      }
      // Drop / move the pin wherever the user taps.
      map.on('click', (e: any) => {
        const { lat: clat, lng: clng } = e.latlng;
        if (markerRef.current) markerRef.current.setLatLng([clat, clng]);
        else markerRef.current = L.marker([clat, clng]).addTo(map);
        onPick(clat, clng);
        setCoordText(`${clat.toFixed(6)}, ${clng.toFixed(6)}`);
      });
    })();
    return () => { cancelled = true; mapInst.current?.remove(); mapInst.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when the chosen city changes (only if no pin set yet).
  useEffect(() => {
    if (mapInst.current && !(lat && lng)) {
      const c = CITY_COORDS[city] || [9.0192, 38.7525];
      mapInst.current.setView(c, 13);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const parseCoords = (text: string) => {
    const parts = text.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const pLat = parseFloat(parts[0]), pLng = parseFloat(parts[1]);
      if (!isNaN(pLat) && !isNaN(pLng)) onPick(pLat, pLng);
    }
  };

  const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const R = 6371;
    const dLat = ((bLat - aLat) * Math.PI) / 180;
    const dLng = ((bLng - aLng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };

  const useMyLocation = () => {
    setGpsError(null);
    setGpsOk(false);
    if (!('geolocation' in navigator)) {
      setGpsError(lang === 'EN' ? 'Your device does not support location. Use the manual method below.' : 'መሳሪያዎ አካባቢን አይደግፍም። ከታች ያለውን በእጅ የማስገቢያ ዘዴ ይጠቀሙ።');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const gLat = pos.coords.latitude;
        const gLng = pos.coords.longitude;
        const c = city ? CITY_COORDS[city] : undefined;
        if (c) {
          const d = distanceKm(gLat, gLng, c[0], c[1]);
          if (d > 150) {
            setGpsLoading(false);
            setGpsError(
              (lang === 'EN' ? `Your current location is about ${Math.round(d)} km from ${city}. If you are not at the property, please use the manual method below to set the location.` : `የአሁኑ አካባቢዎ ከ${city} በግምት ${Math.round(d)} ኪ.ሜ ይርቃል። ንብረቱ ጋ ካልሆኑ፣ እባክዎ ከታች ያለውን በእጅ የማስገቢያ ዘዴ ይጠቀሙ።`)
            );
            return;
          }
        }
        onPick(gLat, gLng);
        setCoordText(`${gLat.toFixed(6)}, ${gLng.toFixed(6)}`);
        setGpsOk(true);
        setGpsLoading(false);
      },
      err => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(lang === 'EN' ? 'Location permission denied. Use the manual method below.' : 'የአካባቢ ፍቃድ ተከልክሏል። ከታች ያለውን በእጅ የማስገቢያ ዘዴ ይጠቀሙ።');
        } else {
          setGpsError(lang === 'EN' ? 'Could not get your location. Use the manual method below.' : 'አካባቢዎን ማግኘት አልተቻለም። ከታች ያለውን በእጅ የማስገቢያ ዘዴ ይጠቀሙ።');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
          {lang === 'EN' ? 'At the property right now?' : 'አሁን ንብረቱ ጋ ነዎት?'}
        </div>
        <div style={{ fontSize: 13, color: '#047857', marginBottom: 12, lineHeight: 1.5 }}>
          {lang === 'EN' ? 'Tap below to capture the exact location from your phone. This is the most accurate option — use it only while you are standing at the property.' : 'ከስልክዎ ትክክለኛውን አካባቢ ለመውሰድ ከታች ይጫኑ። ይህ በጣም ትክክለኛው አማራጭ ነው — ንብረቱ ጋ ሆነው ብቻ ይጠቀሙበት።'}
        </div>
        <button type="button" onClick={useMyLocation} disabled={gpsLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: gpsLoading ? '#9ca3af' : '#059669', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: gpsLoading ? 'not-allowed' : 'pointer' }}>
          <Navigation size={16} />
          {gpsLoading ? (lang === 'EN' ? 'Getting your location...' : 'አካባቢዎን በማግኘት ላይ...') : (lang === 'EN' ? "I'm at the property — use my location" : 'ንብረቱ ጋ ነኝ — አካባቢዬን ተጠቀም')}
        </button>
        {gpsError && <div style={{ fontSize: 13, color: '#b45309', marginTop: 10 }}>⚠️ {gpsError}</div>}
        {gpsOk && <div style={{ fontSize: 13, color: '#047857', marginTop: 10, fontWeight: 600 }}>✓ {lang === 'EN' ? 'Location captured.' : 'አካባቢ ተወስዷል።'}</div>}
      </div>

      <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>
          {lang === 'EN' ? 'Not at the property? Tap it on the map' : 'ንብረቱ ጋ አይደሉም? በካርታው ላይ ይጫኑት'}
        </div>
        <div style={{ fontSize: 13, color: '#3b5bb5', marginBottom: 12, lineHeight: 1.5 }}>
          {lang === 'EN'
            ? 'Search a nearby landmark (hotel, church, mosque, school, square…) to jump there, then tap your property\u2019s exact spot — the pin drops and we capture the location automatically.'
            : 'በአቅራቢያ ያለ ምልክት (ሆቴል፣ ቤተ ክርስቲያን፣ መስጊድ፣ ትምህርት ቤት፣ አደባባይ…) ይፈልጉ ወደዚያ ለመዝለል፣ ከዚያ የንብረትዎን ትክክለኛ ቦታ ይጫኑ — ምልክቱ ይቀመጣል፣ አካባቢውንም በራሱ እንይዛለን።'}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); runLandmarkSearch(); } }}
            placeholder={lang === 'EN' ? 'e.g. Lucy Hotel, Bole Medhanialem, Meskel Square' : 'ለምሳሌ ሉሲ ሆቴል፣ ቦሌ መድኃኒዓለም፣ መስቀል አደባባይ'}
            style={{ flex: 1, padding: '11px 14px', border: '1.5px solid #c7d8f5', borderRadius: 9, fontSize: 14.5, outline: 'none', fontFamily: 'inherit', background: 'white' }}
          />
          <button type="button" onClick={runLandmarkSearch} disabled={searching}
            style={{ padding: '11px 20px', background: searching ? '#9ca3af' : '#006AFF', color: 'white', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: searching ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
            {searching ? (lang === 'EN' ? 'Searching…' : 'በመፈለግ ላይ…') : (lang === 'EN' ? 'Search' : 'ፈልግ')}
          </button>
        </div>
        {searchMsg && <div style={{ fontSize: 13, color: '#b45309', marginBottom: 10 }}>{searchMsg}</div>}
        <div ref={mapEl} style={{ height: 320, width: '100%', borderRadius: 10, overflow: 'hidden', border: '1px solid #c7d8f5', cursor: 'crosshair' }} />
      </div>
      {lat && lng && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>{t.coordSet}</div>
          <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>{parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}</div>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  title: '', description: '', property_kind: '', residential_type: '', deal: '', type: 'sale', currency: 'ETB',
  price: '', price_negotiable: false, condition: 'good',
  bedrooms: '', bathrooms: '', total_rooms: '', area: '',
  floor: '', year_built: '', total_floors: '',
  bathroom_type: 'private', kitchen_type: 'private',
  has_service_room: false, has_traditional_kitchen: false,
  has_store_room: false, has_guard_room: false,
  has_prayer_room: false, has_boys_quarter: false,
  construction_stage: '', construction_material: '', roof_type: '',
  plot_area_sqm: '', land_length_m: '', land_width_m: '',
  land_slope: '', corner_plot: false,
  bank_loan_eligible: false, bank_loan_amount: '', bank_loan_bank: '',
  title_deed_type: '',
  city: '', subcity: '', woreda: '', kebele: '', specific_location: '',
  lat: '', lng: '',
  parking_spaces: '', has_compound_wall: false, has_guard_house: false,
  ground_water: false, water_tanker: false,
  electricity_reliability: '24hr', internet_type: 'none',
  road_type: 'asphalt', distance_to_road_m: '',
  amenities: [] as string[], nearby_landmarks: [] as string[],
  diaspora_friendly: false, managed_property: false,
};

// Property KINDS shown as selectable cards in Step 1. Each has its own icon and
// accent color. Residential & Commercial then ask a Sale/Rent deal; the other
// kinds are inherently stay/rental based and skip that question.
const PROPERTY_KINDS: { value: string; en: string; am: string; Icon: any; color: string; bg: string; asksDeal: boolean }[] = [
  { value: 'residential', en: 'Residential', am: 'መኖሪያ',           Icon: Home,        color: '#006AFF', bg: '#f0f6ff', asksDeal: true },
  { value: 'short_stay',  en: 'Short Stay',  am: 'የአጭር ጊዜ ቆይታ',   Icon: CalendarClock, color: '#7c3aed', bg: '#ede9fe', asksDeal: false },
  { value: 'commercial',  en: 'Commercial',  am: 'የንግድ / ቢዝነስ',    Icon: Store,       color: '#0891b2', bg: '#cffafe', asksDeal: true },
  { value: 'hotel',       en: 'Hotel',       am: 'ሆቴል',            Icon: Hotel,       color: '#E8431A', bg: '#fef2ee', asksDeal: false },
  { value: 'guest_house', en: 'Guest House', am: 'የእንግዳ ማረፊያ',    Icon: BedDouble,   color: '#d97706', bg: '#fffbeb', asksDeal: false },
];

// Maps a chosen kind (+ deal for the two that ask) to the underlying `type`
// column the rest of the app already understands.
function deriveType(kind: string, deal: string): string {
  if (kind === 'residential' || kind === 'commercial') {
    return deal === 'rent' ? 'long_rent' : 'sale';
  }
  // short_stay, hotel, guest_house are all short-stay style listings.
  return 'short_rent';
}

export default function NewListingPage() {
  const { user, isSignedIn } = useUser();
  const { t, lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  // ── Telegram verification (alternative to email) ──
  // method: which verification the user is doing. 'telegram' opens the bot via a
  // deep link carrying a one-time token; we then poll until the bot marks it done.
  const [verifyMethod, setVerifyMethod] = useState<'email' | 'telegram'>('email');
  const [tgToken, setTgToken] = useState('');
  const [tgWaiting, setTgWaiting] = useState(false);
  const [tgError, setTgError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);

  // Tracks whether we've finished trying to restore a saved draft, so the
  // auto-save effect doesn't overwrite the draft with empty values on first paint.
  const [draftLoaded, setDraftLoaded] = useState(false);

  // ── RESTORE DRAFT ON MOUNT ──
  // Reads any saved draft from localStorage and repopulates the form, photos,
  // step, and owner contact fields. Runs once. Guarded for SSR + parse errors.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.form) setForm({ ...EMPTY_FORM, ...saved.form });
          if (Array.isArray(saved.photoUrls)) setPhotoUrls(saved.photoUrls);
          if (typeof saved.step === 'number') setStep(saved.step);
          if (saved.ownerName) setOwnerName(saved.ownerName);
          if (saved.ownerEmail) setOwnerEmail(saved.ownerEmail);
          if (saved.ownerPhone) setOwnerPhone(saved.ownerPhone);
        }
      }
    } catch {
      // Corrupt/unavailable draft → ignore and start fresh.
    }
    setDraftLoaded(true);
  }, []);

  // ── AUTO-SAVE DRAFT ON CHANGE ──
  // Persists the current progress whenever the form, photos, step, or owner
  // fields change — so a refresh or the browser Back button never wipes work.
  useEffect(() => {
    if (!draftLoaded) return; // don't save until the initial restore has run
    try {
      if (typeof window !== 'undefined') {
        const payload = JSON.stringify({ form, photoUrls, step, ownerName, ownerEmail, ownerPhone });
        window.localStorage.setItem(DRAFT_KEY, payload);
      }
    } catch {
      // Storage full or unavailable → fail silently, form still works in-memory.
    }
  }, [form, photoUrls, step, ownerName, ownerEmail, ownerPhone, draftLoaded]);

  // ── BROWSER BACK/FORWARD MOVES BETWEEN STEPS ──
  // Each step is on the same URL, so without this the browser Back button would
  // leave the whole form. We mirror `step` into history state and the ?step=
  // query param, and listen for popstate to move the step instead of exiting.
  const goToStep = (next: number) => {
    setStep(next);
    try {
      if (typeof window !== 'undefined') {
        window.history.pushState({ step: next }, '', `?step=${next}`);
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // On first load, honour a ?step= in the URL (e.g. after a refresh).
    const params = new URLSearchParams(window.location.search);
    const urlStep = parseInt(params.get('step') || '', 10);
    if (!isNaN(urlStep) && urlStep >= 1 && urlStep <= 5) {
      setStep(urlStep);
    }
    // Seed a history entry for the current step so the first Back has somewhere to go.
    try { window.history.replaceState({ step: urlStep || 1 }, '', window.location.search || '?step=1'); } catch {}

    const onPop = (e: PopStateEvent) => {
      const st = (e.state && typeof e.state.step === 'number') ? e.state.step : 1;
      setStep(st >= 1 && st <= 5 ? st : 1);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      setOwnerEmail(prev => prev || user.primaryEmailAddress?.emailAddress || '');
      setOwnerName(prev => prev || user.firstName || '');
      setVerified(true);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCityDropdown(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  // True only for residential/commercial listings marked For Sale. Drives which
  // sale-specific sections (deed, construction, bank debt, full details) appear.
  const isSale = form.deal === 'sale';
  // Non-sale types (rentals, short stay, hotel, guest house) skip the Details step.
  // Step 3 (the old Details & Amenities page) has been removed — its remaining
  // fields were moved into step 1. We always skip step 3 now, so the form flows
  // as 4 visible steps: Basics → Location → Photos → Review.
  const skipDetails = true;

  // ── CONSTRUCTION-STAGE-DRIVEN FIELD VISIBILITY (sale listings) ──
  // When a sale's construction stage is an early one, building-detail fields are
  // irrelevant and are hidden so the lister can't fill in meaningless data.
  //   earlyStage = land only / foundation / structure (columns erected)
  //   landOnly   = land only (also hides year built + plot dimensions + road)
  // Until a stage is chosen (empty), everything shows normally.
  const stage = form.construction_stage;
  const earlyStage = stage === 'land_only' || stage === 'foundation' || stage === 'columns_erected';
  const landOnly = stage === 'land_only';
  // Show building/room detail fields unless an early stage is selected.
  const showBuildingDetails = !earlyStage;
  // Year built: hidden only for land-only; shown for foundation & structure.
  const showYearBuilt = !landOnly;

  // ── RESIDENTIAL SUB-TYPE LOGIC ──
  // Residential listings choose a sub-type that controls which fields appear:
  //   condo  = Condominium/Apartment → asks unit floor; no additional rooms; no material/roof
  //   villa  = Villa → keeps additional rooms + material/roof; plot fields if sale
  //   gplus  = G+ → asks total floors; keeps additional rooms + material/roof; plot fields if sale
  const isResidential = form.property_kind === 'residential';
  const resType = form.residential_type;
  const isCondo = isResidential && resType === 'condo';
  const isVilla = isResidential && resType === 'villa';
  const isGplus = isResidential && resType === 'gplus';
  // Additional rooms + material/roof: shown for villa & G+, hidden for condo/apartment.
  // (Also still gated by showBuildingDetails so early construction stages hide them.)
  const showRoomsAndConstruction = !isCondo;
  // Plot area / length / width in step 1: villa & G+ that are for sale.
  const showPlotInStep1 = (isVilla || isGplus) && isSale;

  // Safety: if the listing becomes non-sale while sitting on the Details step
  // (e.g. user went back and switched to a rental), move them off step 3.
  useEffect(() => {
    if (skipDetails && step === 3) setStep(4);
  }, [skipDetails, step]);
  const selectedCity = ETHIOPIA_CITIES.find(c => c.cityEn === form.city);
  const filteredCities = ETHIOPIA_CITIES.filter(c => citySearch === '' || c.cityEn.toLowerCase().includes(citySearch.toLowerCase()) || c.cityAm.includes(citySearch));
  const toggleAmenity = (key: string) => setForm(p => ({ ...p, amenities: p.amenities.includes(key) ? p.amenities.filter(a => a !== key) : [...p.amenities, key] }));
  const toggleLandmark = (key: string) => setForm(p => ({ ...p, nearby_landmarks: p.nearby_landmarks.includes(key) ? p.nearby_landmarks.filter(a => a !== key) : [...p.nearby_landmarks, key] }));

  const handleSendCode = async () => {
    if (!ownerName.trim() || !ownerEmail.trim()) {
      setCodeError(lang === 'EN' ? 'Please enter your name and email' : 'ስምዎን እና ኢሜይልዎን ያስገቡ');
      return;
    }
    setSendingCode(true); setCodeError('');
    try {
      const res = await fetch('https://www.betachen.com/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail, name: ownerName }),
      });
      const data = await res.json();
      if (data.success) {
        setCodeSent(true);
      } else {
        setCodeError(lang === 'EN' ? 'Failed to send code. Try again.' : 'ኮድ መላክ አልተቻለም። እንደገና ይሞክሩ።');
      }
    } catch {
      setCodeError(lang === 'EN' ? 'Failed to send code. Try again.' : 'ኮድ መላክ አልተቻለም።');
    }
    setSendingCode(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) return;
    setVerifyingCode(true); setCodeError('');
    try {
      const res = await fetch('https://www.betachen.com/api/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail, code: verificationCode }),
      });
      const data = await res.json();
      if (data.success) {
        setVerified(true);
      } else {
        setCodeError(lang === 'EN' ? 'Incorrect code. Please try again.' : 'ኮዱ ትክክል አይደለም። እንደገና ይሞክሩ።');
      }
    } catch {
      setCodeError(lang === 'EN' ? 'Verification failed. Try again.' : 'ማረጋገጥ አልተቻለም።');
    }
    setVerifyingCode(false);
  };

  // Start Telegram verification: ask the server for a one-time token, open the
  // bot deep link, then poll until the bot marks the token verified.
  const handleTelegramStart = async () => {
    setTgError(''); setTgWaiting(true);
    try {
      const res = await fetch('/api/verify/telegram-start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!data.success || !data.token) {
        setTgError(lang === 'EN' ? 'Could not start Telegram verification. Try again.' : 'በቴሌግራም ማረጋገጥ አልተቻለም። እንደገና ይሞክሩ።');
        setTgWaiting(false);
        return;
      }
      setTgToken(data.token);
      // Open the bot with the token. The user presses Start; the webhook verifies.
      if (typeof window !== 'undefined') {
        window.open(`https://t.me/BetachenBot?start=${data.token}`, '_blank');
      }
    } catch {
      setTgError(lang === 'EN' ? 'Could not start Telegram verification. Try again.' : 'በቴሌግራም ማረጋገጥ አልተቻለም።');
      setTgWaiting(false);
    }
  };

  // While a Telegram token is pending, poll the check route every few seconds.
  useEffect(() => {
    if (!tgToken || verified) return;
    let stop = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/verify/telegram-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tgToken }) });
        const data = await res.json();
        if (data.verified) { setVerified(true); setTgWaiting(false); return; }
        if (data.expired) { setTgError(lang === 'EN' ? 'The link expired. Please try again.' : 'ሊንኩ ጊዜው አልፏል። እንደገና ይሞክሩ።'); setTgWaiting(false); setTgToken(''); return; }
      } catch {}
      if (!stop) setTimeout(poll, 3000);
    };
    const id = setTimeout(poll, 3000);
    return () => { stop = true; clearTimeout(id); };
  }, [tgToken, verified, lang]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    const supabase = createBrowserClient();
    const urls: string[] = [];
    for (const file of files.slice(0, 10)) {
      const fileName = `guest/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true });
      if (!error) { const { data } = supabase.storage.from('property-images').getPublicUrl(fileName); urls.push(data.publicUrl); }
    }
    setPhotoUrls(prev => [...prev, ...urls]);
    setUploadingPhotos(false);
  };

  const handleSubmit = async () => {
    if (!verified) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          ownerEmail,
          ownerPhone,
          ownerId: user?.id || null,
          photoUrls,
          form,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not create listing.');
      }
      // Listing created successfully → clear the saved draft so the next new
      // listing starts blank instead of reloading this one's data.
      try { if (typeof window !== 'undefined') window.localStorage.removeItem(DRAFT_KEY); } catch {}
      router.push(`/owner/listings/${data.id}/payment`);
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  const AMENITIES = [
    { key: 'wifi', label: lang === 'EN' ? 'WiFi' : 'ዋይፋይ' },
    { key: 'generator', label: lang === 'EN' ? 'Generator' : 'ጀነሬተር' },
    { key: 'water_tank', label: lang === 'EN' ? 'Water Tanker' : 'የውሃ ታንክር' },
    { key: 'cctv', label: 'CCTV' },
    { key: 'gym', label: lang === 'EN' ? 'Gym' : 'ጂም' },
    { key: 'pool', label: lang === 'EN' ? 'Pool' : 'መዋኛ' },
    { key: 'elevator', label: lang === 'EN' ? 'Elevator' : 'አሳንሰር' },
    { key: 'ac', label: lang === 'EN' ? 'Air Conditioning' : 'ኤ.ሲ' },
    { key: 'solar', label: lang === 'EN' ? 'Solar Panel' : 'ሶላር' },
    { key: 'garden', label: lang === 'EN' ? 'Garden' : 'የአትክልት ቦታ' },
    { key: 'balcony', label: lang === 'EN' ? 'Balcony' : 'በረንዳ' },
    { key: 'intercom', label: lang === 'EN' ? 'Intercom' : 'ኢንተርኮም' },
    { key: 'borehole', label: lang === 'EN' ? 'Well Water' : 'የጉድጓድ ውሃ' },
    { key: 'water_heater', label: lang === 'EN' ? 'Water Heater' : 'ውሃ ማሞቂያ' },
  ];

  const LANDMARKS_EN = ['School','University','Hospital','Clinic','Market','Supermarket','Mosque','Church','Bank','ATM','Bus Stop / Taxi','Main Road','Restaurant','Hotel','Police Station'];
  const LANDMARKS_AM = ['ትምህርት ቤት','ዩኒቨርሲቲ','ሆስፒታል','ክሊኒክ','ገበያ','ሱፐርማርኬት','መስጊድ','ቤተክርስቲያን','ባንክ','ኤቲኤም','የባስ ማቆሚያ / ታክሲ','ዋና መንገድ','ሬስቶራንት','ሆቴል','ፖሊስ ጣቢያ'];
  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '44px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111827', marginBottom: 6 }}>{t.formTitle}</h1>
          <p style={{ color: '#6b7280', fontSize: 16 }}>{t.formSubtitle}</p>
        </div>

        {!verified && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} color="#E8431A" />
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#111827' }}>
                  {lang === 'EN' ? 'Verify your email to continue' : 'ለመቀጠል ኢሜይልዎን ያረጋግጡ'}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  {lang === 'EN' ? 'No account needed — verify by email or Telegram' : 'መለያ አያስፈልግም — በኢሜይል ወይም በቴሌግራም ያረጋግጡ'}
                </div>
              </div>
            </div>

            {/* Method toggle: Email or Telegram */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {([['email', lang === 'EN' ? 'Email' : 'ኢሜይል'], ['telegram', 'Telegram']] as const).map(([m, label]) => {
                const on = verifyMethod === m;
                return (
                  <button key={m} onClick={() => { setVerifyMethod(m as 'email' | 'telegram'); setCodeError(''); setTgError(''); }}
                    style={{ flex: 1, padding: '11px', borderRadius: 10, border: `2px solid ${on ? '#006AFF' : '#e5e7eb'}`, background: on ? '#006AFF' : 'white', color: on ? '#fff' : '#374151', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {verifyMethod === 'telegram' ? (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ background: '#eaf3ff', border: '1px solid #c7e0ff', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 14, color: '#1a1830', lineHeight: 1.6 }}>
                    {lang === 'EN'
                      ? 'Tap the button below to open the Betachen bot on Telegram and press Start. This page will continue automatically once you do.'
                      : 'ከታች ያለውን ይጫኑ — የቤታችን ቦት በቴሌግራም ይከፈታል፣ Start ይጫኑ። እንዳደረጉ ይህ ገጽ በራሱ ይቀጥላል።'}
                  </div>
                </div>
                <button onClick={handleTelegramStart} disabled={tgWaiting}
                  style={{ padding: '14px', borderRadius: 10, background: tgWaiting ? '#9ca3af' : '#229ED9', color: 'white', fontWeight: 800, fontSize: 16, border: 'none', cursor: tgWaiting ? 'not-allowed' : 'pointer' }}>
                  {tgWaiting
                    ? (lang === 'EN' ? 'Waiting for Telegram… press Start in the bot' : 'ቴሌግራምን በመጠበቅ ላይ… በቦቱ Start ይጫኑ')
                    : (lang === 'EN' ? 'Verify with Telegram' : 'በቴሌግራም አረጋግጥ')}
                </button>
                {tgWaiting && (
                  <button onClick={handleTelegramStart}
                    style={{ padding: '11px', borderRadius: 10, background: 'white', border: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    {lang === 'EN' ? 'Re-open Telegram' : 'ቴሌግራምን እንደገና ክፈት'}
                  </button>
                )}
                {tgError && <div style={{ color: '#dc2626', fontSize: 13 }}>{tgError}</div>}
              </div>
            ) : !codeSent ? (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>
                      <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {lang === 'EN' ? 'Your Name' : 'ስምዎ'}<Req />
                    </label>
                    <input style={inputStyle} value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder={lang === 'EN' ? 'e.g. Abebe Kebede' : 'ለምሳሌ አበበ ቀበደ'} />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {lang === 'EN' ? 'Phone Number' : 'ስልክ ቁጥር'}
                    </label>
                    <input style={inputStyle} value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="+251911234567" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>
                    <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {lang === 'EN' ? 'Email Address' : 'ኢሜይል አድራሻ'}<Req />
                  </label>
                  <input style={inputStyle} type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="example@gmail.com" />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    {lang === 'EN' ? 'We will send a 6-digit code to this email' : 'ወደዚህ ኢሜይል 6 አሃዝ ኮድ እንልካለን'}
                  </div>
                </div>
                {codeError && <div style={{ color: '#dc2626', fontSize: 13 }}>{codeError}</div>}
                <button onClick={handleSendCode} disabled={sendingCode} style={{ padding: '14px', borderRadius: 10, background: sendingCode ? '#9ca3af' : '#006AFF', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: sendingCode ? 'not-allowed' : 'pointer' }}>
                  {sendingCode
                    ? (lang === 'EN' ? 'Sending code...' : 'ኮድ እየተላከ ነው...')
                    : (lang === 'EN' ? 'Send Verification Code' : 'የማረጋገጫ ኮድ ላክ')}
                </button>
                <div style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
                  {lang === 'EN' ? 'Already have an account?' : 'መለያ አለዎት?'}{' '}
                  <a href="/sign-in" style={{ color: '#006AFF', fontWeight: 600, textDecoration: 'none' }}>
                    {lang === 'EN' ? 'Sign in instead' : 'ይግቡ'}
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#065f46' }}>
                    {lang === 'EN' ? `Code sent to ${ownerEmail}` : `ኮድ ወደ ${ownerEmail} ተልኳል`}
                  </div>
                  <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                    {lang === 'EN' ? 'Check your inbox and spam folder' : 'inbox እና spam ያረጋግጡ'}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Enter 6-digit code' : '6 አሃዝ ኮድ ያስገቡ'}</label>
                  <input
                    style={{ ...inputStyle, fontSize: 26, letterSpacing: 8, textAlign: 'center', fontWeight: 700 }}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                {codeError && <div style={{ color: '#dc2626', fontSize: 13 }}>{codeError}</div>}
                <button onClick={handleVerifyCode} disabled={verifyingCode || verificationCode.length !== 6} style={{ padding: '14px', borderRadius: 10, background: verifyingCode || verificationCode.length !== 6 ? '#9ca3af' : '#059669', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: verifyingCode || verificationCode.length !== 6 ? 'not-allowed' : 'pointer' }}>
                  {verifyingCode
                    ? (lang === 'EN' ? 'Verifying...' : 'እያረጋገጠ ነው...')
                    : (lang === 'EN' ? 'Verify & Continue' : 'አረጋግጥ እና ቀጥል')}
                </button>
                <button onClick={() => { setCodeSent(false); setVerificationCode(''); setCodeError(''); }} style={{ padding: '11px', borderRadius: 10, background: 'white', border: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  {lang === 'EN' ? 'Change email' : 'ኢሜይል ቀይር'}
                </button>
              </div>
            )}
          </div>
        )}

        {verified && (
          <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={22} color="#059669" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#065f46' }}>
                {lang === 'EN' ? `Verified: ${ownerEmail}` : `ተረጋግጧል: ${ownerEmail}`}
              </div>
              <div style={{ fontSize: 13, color: '#047857' }}>
                {lang === 'EN' ? 'You can now post your listing' : 'አሁን ማስታወቂያዎን መለጠፍ ይችላሉ'}
              </div>
            </div>
          </div>
        )}

        {verified && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto' as const }}>
              {steps.map((s, i) => {
                const target = i + 1;
                // Step 3 (old Details page) is always skipped now.
                if (skipDetails && target === 3) return null;
                const reachable = target <= step;
                // Display number is sequential (1..4) even though internal step
                // ids skip 3 — so users never see a gap like "2, 4".
                const displayNum = target > 3 ? target - 1 : target;
                return (
                  <div key={s} onClick={() => { if (reachable) goToStep(target); }} style={{ flex: 1, minWidth: 80, cursor: reachable ? 'pointer' : 'default' }}>
                    <div style={{ height: 4, borderRadius: 2, background: step >= target ? '#006AFF' : '#e5e7eb', marginBottom: 6 }} />
                    <div style={{ fontSize: 12, color: step >= target ? '#006AFF' : '#9ca3af', fontWeight: step === target ? 700 : 400, whiteSpace: 'nowrap' as const, textDecoration: reachable && step !== target ? 'underline' : 'none' }}>{displayNum}. {s}</div>
                  </div>
                );
              })}
            </div>

            {step === 1 && (
              <div>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={20} color="#E8431A" /></div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#111827' }}>{t.step1}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>{t.propTitle}<Req /></label>
                      <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder={t.propTitlePlaceholder} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t.description}</label>
                      <textarea style={{ ...inputStyle, height: 110, resize: 'vertical' as const }} value={form.description} onChange={e => set('description', e.target.value)} placeholder={t.descPlaceholder} />
                    </div>
                    <div>
                      <label style={labelStyle}>{lang === 'EN' ? 'Property Type' : 'የንብረቱ አይነት'}<Req /></label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 4 }}>
                        {PROPERTY_KINDS.map(pk => {
                          const active = form.property_kind === pk.value;
                          const Icon = pk.Icon;
                          return (
                            <div key={pk.value} onClick={() => {
                              // Set the kind; reset deal; derive the underlying type.
                              const nextDeal = pk.asksDeal ? (form.deal || 'sale') : '';
                              setForm(prev => ({ ...prev, property_kind: pk.value, deal: nextDeal, type: deriveType(pk.value, nextDeal) }));
                            }} style={{ padding: '18px 12px', borderRadius: 14, border: `2px solid ${active ? pk.color : '#e5e7eb'}`, background: active ? pk.bg : 'white', cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.15s', boxShadow: active ? `0 2px 10px ${pk.color}22` : 'none' }}>
                              <div style={{ width: 46, height: 46, borderRadius: '50%', background: pk.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                <Icon size={24} color={pk.color} />
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: active ? pk.color : '#374151' }}>{lang === 'EN' ? pk.en : pk.am}</div>
                              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{lang === 'EN' ? pk.am : pk.en}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sale / Rent toggle — only for Residential & Commercial */}
                    {(form.property_kind === 'residential' || form.property_kind === 'commercial') && (
                      <div>
                        <label style={labelStyle}>{lang === 'EN' ? 'Sale or Rent?' : 'ሽያጭ ወይስ ኪራይ?'}<Req /></label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                          {[
                            { v: 'sale', en: 'For Sale', am: 'ለሽያጭ', Icon: Tag, color: '#006AFF', bg: '#f0f6ff' },
                            { v: 'rent', en: 'For Rent', am: 'ለኪራይ', Icon: KeyRound, color: '#059669', bg: '#ecfdf5' },
                          ].map(d => {
                            const active = form.deal === d.v;
                            const Icon = d.Icon;
                            return (
                              <div key={d.v} onClick={() => setForm(prev => ({ ...prev, deal: d.v, type: deriveType(prev.property_kind, d.v) }))} style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${active ? d.color : '#e5e7eb'}`, background: active ? d.bg : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Icon size={20} color={active ? d.color : '#9ca3af'} />
                                <span style={{ fontSize: 15, fontWeight: 700, color: active ? d.color : '#374151' }}>{lang === 'EN' ? d.en : d.am}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Residential sub-type — solid colored tabs; selected one is
                        marked with a darker ring + checkmark. G+ reveals the floors
                        dropdown on the same row. */}
                    {isResidential && (
                      <div>
                        <label style={labelStyle}>{lang === 'EN' ? 'Residential Type' : 'የመኖሪያ አይነት'}<Req /></label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                          {[
                            { v: 'condo', en: 'Condo / Apt', am: 'ኮንዶ', color: '#006AFF', ring: '#003a8c' },
                            { v: 'villa', en: 'Villa', am: 'ቪላ', color: '#E8431A', ring: '#9e2a0f' },
                            { v: 'gplus', en: 'G+', am: 'ጂ+', color: '#7c3aed', ring: '#4c1d95' },
                          ].map(rt => {
                            const active = form.residential_type === rt.v;
                            return (
                              <div key={rt.v} onClick={() => set('residential_type', rt.v)} style={{ padding: '9px 16px', borderRadius: 9, border: `3px solid ${active ? rt.ring : 'transparent'}`, background: rt.color, cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 5, boxShadow: active ? '0 2px 8px rgba(0,0,0,0.18)' : 'none' }}>
                                {active && <span style={{ fontSize: 13, color: 'white', fontWeight: 900 }}>✓</span>}
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{lang === 'EN' ? rt.en : rt.am}</span>
                              </div>
                            );
                          })}
                          {/* G+ floors dropdown — same row, compact, only when G+ active */}
                          {isGplus && (
                            <select value={form.total_floors} onChange={e => set('total_floors', e.target.value)} style={{ width: 110, padding: '10px 10px', border: '2px solid #7c3aed', borderRadius: 9, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}>
                              <option value="">{lang === 'EN' ? 'Floors…' : 'ወለል…'}</option>
                              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                                <option key={n} value={String(n)}>{`G+${n}`}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <div>
                        <label style={labelStyle}>{t.condition}</label>
                        <select style={inputStyle} value={form.condition} onChange={e => set('condition', e.target.value)}>
                          <option value="new">{t.condNew}</option>
                          <option value="good">{t.condGood}</option>
                          <option value="needs_renovation">{t.condRenovation}</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>{lang === 'EN' ? 'Price' : 'ዋጋ'}<Req /></label>
                        {form.type !== 'short_rent' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: '#374151' }}>{t.negotiable}</span>
                            <div onClick={() => set('price_negotiable', !form.price_negotiable)} style={{ width: 44, height: 24, borderRadius: 12, background: form.price_negotiable ? '#006AFF' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                              <div style={{ position: 'absolute', top: 2, left: form.price_negotiable ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                            </div>
                          </div>
                        )}
                      </div>
                      {form.price_negotiable && form.type !== 'short_rent' ? (
                        <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 14, color: '#065f46' }}>{t.negotiableNote}</div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={labelStyle}>{t.currency}</label>
                            <select style={inputStyle} value={form.currency} onChange={e => set('currency', e.target.value)}>
                              <option value="ETB">ETB — Ethiopian Birr</option>
                              <option value="USD">USD — US Dollar</option>
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>{lang === 'EN' ? 'Price' : 'ዋጋ'}</label>
                            <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder={form.type === 'sale' ? 'e.g. 5000000' : 'e.g. 15000'} />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Construction Stage — for sale listings. Moved up here so its value
                        can drive which building-detail fields appear below. */}
                    {isSale && (
                    <div>
                      <div style={subHeading}>{lang === 'EN' ? 'Construction Stage' : 'የግንባታ ደረጃ'}</div>
                      <div>
                        <label style={labelStyle}>{lang === 'EN' ? 'Current Stage' : 'የአሁኑ ደረጃ'}</label>
                        <select style={inputStyle} value={form.construction_stage} onChange={e => set('construction_stage', e.target.value)}>
                          <option value="">{lang === 'EN' ? '— Select —' : '— ይምረጡ —'}</option>
                          <option value="land_only">{lang === 'EN' ? 'Land Only' : 'ባዶ ቦታ ብቻ'}</option>
                          <option value="foundation">{lang === 'EN' ? 'Foundation Laid' : 'መሰረት የወጣለት'}</option>
                          <option value="columns_erected">{lang === 'EN' ? 'Structure Done' : 'እስትራክቸር ያለቀ'}</option>
                          <option value="plastering">{lang === 'EN' ? 'Plastering' : 'ሲሚንቶ ደረጃ'}</option>
                          <option value="finishing">{lang === 'EN' ? 'Finishing' : 'ፊኒሺንግ የቀረው'}</option>
                          <option value="completed">{lang === 'EN' ? 'Completed' : 'ተጠናቋል'}</option>
                        </select>
                        {earlyStage && (
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                            {lang === 'EN'
                              ? 'Building details (rooms, finishes, amenities) are hidden for this stage since they do not apply yet.'
                              : 'ለዚህ ደረጃ የሕንፃ ዝርዝሮች (ክፍሎች፣ ፊኒሺንግ፣ አገልግሎቶች) ገና ስለማይመለከቱ ተደብቀዋል።'}
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                    {/* Bathroom & Kitchen type — only for RENTALS (shared/private
                        matters for renters; sale units are private by default).
                        Also hidden when an early construction stage is selected. */}
                    {!isSale && showBuildingDetails && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>{lang === 'EN' ? 'Bathroom / Toilet' : 'መታጠቢያ/ መፀዳጃ ክፍል'}</label>
                        <select style={inputStyle} value={form.bathroom_type} onChange={e => set('bathroom_type', e.target.value)}>
                          <option value="private">{t.privateBath}</option>
                          <option value="shared">{t.sharedBath}</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>{t.kitchenType}</label>
                        <select style={inputStyle} value={form.kitchen_type} onChange={e => set('kitchen_type', e.target.value)}>
                          <option value="private">{t.privateKitchen}</option>
                          <option value="shared">{t.sharedKitchen}</option>
                          <option value="none">{t.noKitchen}</option>
                        </select>
                      </div>
                    </div>
                    )}
                    {showBuildingDetails && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div><label style={labelStyle}>{t.bedrooms}</label><input style={inputStyle} type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="e.g. 3" /></div>
                      <div><label style={labelStyle}>{t.bathrooms}</label><input style={inputStyle} type="number" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="e.g. 2" /></div>
                      <div><label style={labelStyle}>{t.totalRooms}</label><input style={inputStyle} type="number" min="0" value={form.total_rooms} onChange={e => set('total_rooms', e.target.value)} placeholder="e.g. 6" /></div>
                    </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label style={labelStyle}>{t.houseArea}</label><input style={inputStyle} type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. 120" /></div>
                      {isCondo && (
                      <div><label style={labelStyle}>{lang === 'EN' ? 'Which floor is the unit on?' : 'ዩኒቱ በስንተኛ ፎቅ ነው?'}</label><input style={inputStyle} type="number" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="e.g. 3" /></div>
                      )}
                    </div>
                    {showYearBuilt && (
                    <div><label style={labelStyle}>{t.yearBuilt}</label><input style={inputStyle} type="number" value={form.year_built} onChange={e => set('year_built', e.target.value)} placeholder="e.g. 2020" /></div>
                    )}

                    {/* Plot area / length / width — villa & G+ for sale only. */}
                    {showPlotInStep1 && (
                    <div>
                      <div style={subHeading}>{lang === 'EN' ? 'Plot (Land)' : 'ቦታ (መሬት)'}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label style={labelStyle}>{lang === 'EN' ? 'Plot Area (m²)' : 'የቦታ ስፋት (m²)'}</label><input style={inputStyle} type="number" value={form.plot_area_sqm} onChange={e => set('plot_area_sqm', e.target.value)} placeholder="e.g. 250" /></div>
                        <div><label style={labelStyle}>{lang === 'EN' ? 'Length (m)' : 'ርዝመት (m)'}</label><input style={inputStyle} type="number" value={form.land_length_m} onChange={e => set('land_length_m', e.target.value)} placeholder="e.g. 25" /></div>
                        <div><label style={labelStyle}>{lang === 'EN' ? 'Width (m)' : 'ስፋት (m)'}</label><input style={inputStyle} type="number" value={form.land_width_m} onChange={e => set('land_width_m', e.target.value)} placeholder="e.g. 10" /></div>
                      </div>
                    </div>
                    )}

                    {/* Water supply — all residential, in step 1. */}
                    {isResidential && (
                    <div>
                      <div style={subHeading}>{t.waterSupply}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Toggle label={lang === 'EN' ? 'Well Water' : 'የጉድጓድ ውሃ'} value={form.ground_water} onChange={() => set('ground_water', !form.ground_water)} color="#059669" bg="#ecfdf5" />
                        <Toggle label={lang === 'EN' ? 'Water Tanker' : 'የውሃ ታንከር'} value={form.water_tanker} onChange={() => set('water_tanker', !form.water_tanker)} color="#2563eb" bg="#eff6ff" />
                      </div>
                    </div>
                    )}
                    {(isVilla || isGplus) && showBuildingDetails && (
                    <div>
                      <div style={subHeading}>{lang === 'EN' ? 'Additional Rooms' : 'ተጨማሪ ክፍሎች'}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                        <Toggle label={lang === 'EN' ? 'Service / Maid Room' : 'የሰራተኛ ክፍል'} value={form.has_service_room} onChange={() => set('has_service_room', !form.has_service_room)} />
                        <Toggle label={lang === 'EN' ? 'Traditional Kitchen' : 'ባህላዊ ኩሽና'} value={form.has_traditional_kitchen} onChange={() => set('has_traditional_kitchen', !form.has_traditional_kitchen)} color="#d97706" bg="#fffbeb" />
                        <Toggle label={lang === 'EN' ? 'Store Room' : 'የእቃ ማስቀመጫ'} value={form.has_store_room} onChange={() => set('has_store_room', !form.has_store_room)} color="#7c3aed" bg="#ede9fe" />
                        <Toggle label={lang === 'EN' ? 'Guard Room' : 'የጠባቂ ክፍል'} value={form.has_guard_room} onChange={() => set('has_guard_room', !form.has_guard_room)} color="#059669" bg="#ecfdf5" />
                        <Toggle label={lang === 'EN' ? 'Prayer Room' : 'የጸሎት ክፍል'} value={form.has_prayer_room} onChange={() => set('has_prayer_room', !form.has_prayer_room)} color="#0891b2" bg="#cffafe" />
                        <Toggle label={lang === 'EN' ? 'Family Room' : 'የቤተሰብ ክፍል'} value={form.has_boys_quarter} onChange={() => set('has_boys_quarter', !form.has_boys_quarter)} color="#E8431A" bg="#fef2ee" />
                      </div>
                    </div>
                    )}
                    {isSale && showBuildingDetails && showRoomsAndConstruction && (<>
                    <div>
                      <div style={subHeading}>{lang === 'EN' ? 'Construction Details' : 'የግንባታ ዝርዝሮች'}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={labelStyle}>{lang === 'EN' ? 'Material' : 'ቁሳቁስ'}</label>
                          <select style={inputStyle} value={form.construction_material} onChange={e => set('construction_material', e.target.value)}>
                            <option value="">{lang === 'EN' ? '— Select —' : '— ይምረጡ —'}</option>
                            <option value="concrete_frame">{lang === 'EN' ? 'Concrete Frame' : 'ኮንክሪት ፍሬም'}</option>
                            <option value="hcb">{lang === 'EN' ? 'HCB Block' : 'ሆሎው ብሎክ'}</option>
                            <option value="stone">{lang === 'EN' ? 'Stone' : 'ድንጋይ'}</option>
                            <option value="wood">{lang === 'EN' ? 'Wood' : 'እንጨት'}</option>
                            <option value="mixed">{lang === 'EN' ? 'Mixed' : 'ድብልቅ'}</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>{lang === 'EN' ? 'Roof Type' : 'ጣሪያ'}</label>
                          <select style={inputStyle} value={form.roof_type} onChange={e => set('roof_type', e.target.value)}>
                            <option value="">{lang === 'EN' ? '— Select —' : '— ይምረጡ —'}</option>
                            <option value="concrete_slab">{lang === 'EN' ? 'Concrete Slab' : 'ስላብ'}</option>
                            <option value="corrugated_iron">{lang === 'EN' ? 'Corrugated Iron (EGA)' : 'ቆርቆሮ'}</option>
                            <option value="tile">{lang === 'EN' ? 'Tile' : 'ታይል'}</option>
                            <option value="flat_roof">{lang === 'EN' ? 'Flat Roof' : 'ጠፍጣፋ ጣሪያ'}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    </>)}
                    {isSale && (
                    <div>
                      <div style={subHeading}>{lang === 'EN' ? 'Existing Bank Debt / Mortgage' : 'ያለ የባንክ ዕዳ'}</div>
                      <Toggle label={lang === 'EN' ? 'This property has an existing bank debt' : 'ይህ ንብረት የባንክ ዕዳ አለበት'} desc={lang === 'EN' ? 'Debt transfers to the new owner' : 'ዕዳው ወደ አዲሱ ባለቤት ይተላለፋል'} value={form.bank_loan_eligible} onChange={() => set('bank_loan_eligible', !form.bank_loan_eligible)} color="#c2410c" bg="#fff7ed" />
                      {form.bank_loan_eligible && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                          <div>
                            <label style={labelStyle}>{lang === 'EN' ? 'Outstanding Debt (ETB)' : 'የቀረ ዕዳ (ETB)'}</label>
                            <input style={inputStyle} type="number" value={form.bank_loan_amount} onChange={e => set('bank_loan_amount', e.target.value)} placeholder="e.g. 3000000" />
                          </div>
                          <div>
                            <label style={labelStyle}>{lang === 'EN' ? 'Lender Bank' : 'ባንክ'}</label>
                            <select style={inputStyle} value={form.bank_loan_bank} onChange={e => set('bank_loan_bank', e.target.value)}>
                              <option value="">{lang === 'EN' ? '— Select bank —' : '— ባንክ ይምረጡ —'}</option>
                              <option value="CBE">Commercial Bank of Ethiopia (CBE)</option>
                              <option value="Awash">Awash Bank</option>
                              <option value="Dashen">Dashen Bank</option>
                              <option value="Abyssinia">Bank of Abyssinia</option>
                              <option value="Wegagen">Wegagen Bank</option>
                              <option value="United">United Bank</option>
                              <option value="NIB">NIB International Bank</option>
                              <option value="Zemen">Zemen Bank</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                    )}

                    {/* ── Moved from old Details step: plot (non villa/G+ sales),
                        parking, distance to main road, road type — all sale-only. ── */}
                    {isSale && !showPlotInStep1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: landOnly ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
                      <div><label style={labelStyle}>{t.plotArea}</label><input style={inputStyle} type="number" value={form.plot_area_sqm} onChange={e => set('plot_area_sqm', e.target.value)} placeholder="e.g. 300" /></div>
                      {!landOnly && (<>
                      <div><label style={labelStyle}>{lang === 'EN' ? 'Length (m)' : 'ርዝመት (ሜ)'}</label><input style={inputStyle} type="number" value={form.land_length_m} onChange={e => set('land_length_m', e.target.value)} placeholder="e.g. 20" /></div>
                      <div><label style={labelStyle}>{lang === 'EN' ? 'Width (m)' : 'ስፋት (ሜ)'}</label><input style={inputStyle} type="number" value={form.land_width_m} onChange={e => set('land_width_m', e.target.value)} placeholder="e.g. 15" /></div>
                      </>)}
                    </div>
                    )}
                    {isSale && showBuildingDetails && (
                    <div><label style={labelStyle}>{t.parkingSpaces}</label><input style={inputStyle} type="number" min="0" value={form.parking_spaces} onChange={e => set('parking_spaces', e.target.value)} placeholder="e.g. 2" /></div>
                    )}
                    {isSale && !landOnly && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label style={labelStyle}>{t.distRoad}</label><input style={inputStyle} type="number" min="0" value={form.distance_to_road_m} onChange={e => set('distance_to_road_m', e.target.value)} placeholder="e.g. 50" /></div>
                      <div>
                        <label style={labelStyle}>{t.roadType}</label>
                        <select style={inputStyle} value={form.road_type} onChange={e => set('road_type', e.target.value)}>
                          <option value="asphalt">{t.asphalt}</option>
                          <option value="cobblestone">{t.cobblestone}</option>
                          <option value="dirt">{t.dirtRoad}</option>
                        </select>
                      </div>
                    </div>
                    )}

                    {/* Title Deed — moved to the bottom of step 1 (sale only). */}
                    {isSale && (
                    <div>
                      <label style={labelStyle}>{lang === 'EN' ? 'Title Deed Type' : 'የቦታ ሰነድ አይነት'}</label>
                      <select style={inputStyle} value={form.title_deed_type} onChange={e => set('title_deed_type', e.target.value)}>
                        <option value="">{lang === 'EN' ? '— Select deed type —' : '— ይምረጡ —'}</option>
                        <option value="leasehold">{lang === 'EN' ? 'Leasehold (ሊዝ)' : 'ሊዝ ይዞታ'}</option>
                        <option value="freehold">{lang === 'EN' ? 'Freehold / Legal Map' : 'ህጋዊ ካርታ'}</option>
                        <option value="condominium">{lang === 'EN' ? 'Condominium' : 'ኮንዶሚኒየም'}</option>
                        <option value="cooperative">{lang === 'EN' ? 'Cooperative / ህብረት ስራ' : 'ህብረት ስራ'}</option>
                      </select>
                    </div>
                    )}
                  </div>
                </div>
                <button onClick={() => {
                  if (!form.property_kind) { setError(lang === 'EN' ? 'Please choose a property type.' : 'እባክዎ የንብረት አይነት ይምረጡ።'); return; }
                  if ((form.property_kind === 'residential' || form.property_kind === 'commercial') && !form.deal) { setError(lang === 'EN' ? 'Please choose Sale or Rent.' : 'እባክዎ ሽያጭ ወይም ኪራይ ይምረጡ።'); return; }
                  if (form.property_kind === 'residential' && !form.residential_type) { setError(lang === 'EN' ? 'Please choose a residential type (Condo, Villa, or G+).' : 'እባክዎ የመኖሪያ አይነት ይምረጡ (ኮንዶ፣ ቪላ ወይም ጂ+)።'); return; }
                  if (!form.title || (!form.price && !form.price_negotiable)) { setError(t.fillTitlePrice); return; }
                  setError(''); goToStep(2);
                }} style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {t.nextLocation} <ArrowRight size={18} />
                </button>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>
                  <Req /> {lang === 'EN' ? 'Required fields' : 'የግዴታ መስኮች'}
                </div>
                {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={20} color="#E8431A" /></div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#111827' }}>{t.step2}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div ref={cityRef} style={{ position: 'relative' }}>
                      <label style={labelStyle}>{t.cityLabel}<Req /></label>
                      <div style={{ position: 'relative' }}>
                        <input value={citySearch || (form.city ? `${form.city} (${ETHIOPIA_CITIES.find(c => c.cityEn === form.city)?.cityAm})` : '')} onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); if (!e.target.value) { set('city', ''); set('subcity', ''); } }} onFocus={() => setShowCityDropdown(true)} placeholder={t.cityPlaceholder} style={inputStyle} />
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                      </div>
                      {showCityDropdown && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, zIndex: 100, maxHeight: 240, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4 }}>
                          {filteredCities.map(c => (
                            <div key={c.cityEn} onClick={() => { set('city', c.cityEn); set('subcity', ''); setCitySearch(''); setShowCityDropdown(false); }} style={{ padding: '11px 16px', cursor: 'pointer', fontSize: 15, color: '#111827', borderBottom: '1px solid #f3f4f6', background: form.city === c.cityEn ? '#f0f6ff' : 'white' }}>
                              <span style={{ fontWeight: form.city === c.cityEn ? 700 : 400 }}>{lang === 'EN' ? c.cityEn : c.cityAm}</span>
                              <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: 13 }}>{lang === 'EN' ? c.cityAm : c.cityEn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ ...labelStyle, opacity: selectedCity ? 1 : 0.5 }}>{t.subcityLabel}</label>
                      <select value={form.subcity} onChange={e => set('subcity', e.target.value)} disabled={!selectedCity} style={{ ...inputStyle, opacity: selectedCity ? 1 : 0.5 }}>
                        <option value="">{selectedCity ? `All ${selectedCity.cityEn}` : '— Select city first —'}</option>
                        {selectedCity?.subsEn.map((sub, i) => (<option key={sub} value={sub}>{lang === 'EN' ? `${sub} — ${selectedCity.subsAm[i]}` : `${selectedCity.subsAm[i]} — ${sub}`}</option>))}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><label style={labelStyle}>{t.woredaLabel}</label><input style={inputStyle} value={form.woreda} onChange={e => set('woreda', e.target.value)} placeholder={t.woredaPlaceholder} /></div>
                      <div><label style={labelStyle}>{t.kebeleLabel}</label><input style={inputStyle} value={form.kebele} onChange={e => set('kebele', e.target.value)} placeholder={t.kebelePlaceholder} /></div>
                    </div>
                    <div>
                      <label style={labelStyle}>{t.landmarkLabel}</label>
                      <input style={inputStyle} value={form.specific_location} onChange={e => set('specific_location', e.target.value)} placeholder={t.landmarkPlaceholder} />
                    </div>
                    <MapPinPicker lat={form.lat} lng={form.lng} city={form.city} t={t} lang={lang} onPick={(lat, lng) => { set('lat', lat.toFixed(6)); set('lng', lng.toFixed(6)); }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { if (typeof window!=='undefined') window.history.back(); else setStep(1); }} style={{ flex: 1, padding: '15px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><ArrowLeft size={18} /> {t.back}</button>
                  <button onClick={() => { if (!form.city) { setError(t.selectCity); return; } setError(''); goToStep(skipDetails ? 4 : 3); }} style={{ flex: 2, padding: '15px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{t.nextDetails} <ArrowRight size={18} /></button>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>
                  <Req /> {lang === 'EN' ? 'Required fields' : 'የግዴታ መስኮች'}
                </div>
                {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
              </div>
            )}

            {step === 4 && (
              <div>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Upload size={20} color="#E8431A" /></div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#111827' }}>{t.uploadTitle}</div>
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>{t.uploadDesc}</div>
                  <div style={{ border: '2px dashed #d1d5db', borderRadius: 14, padding: '32px 24px', textAlign: 'center', background: '#f9fafb' }}>
                    {uploadingPhotos ? (
                      <div style={{ color: '#006AFF', fontWeight: 600, padding: '12px 0' }}>{t.uploading}</div>
                    ) : (
                      <>
                        <Upload size={36} color="#9ca3af" style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{t.uploadClick}</div>
                        <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 18 }}>{t.uploadHint}</div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => cameraInputRef.current?.click()}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                            📷 {lang === 'EN' ? 'Take Photo' : 'ፎቶ አንሳ'}
                          </button>
                          <button type="button" onClick={() => galleryInputRef.current?.click()}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, background: 'white', color: '#374151', fontWeight: 700, fontSize: 14, border: '1.5px solid #d1d5db', cursor: 'pointer' }}>
                            📁 {lang === 'EN' ? 'Choose from device' : 'ከመሳሪያ ምረጥ'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  {photoUrls.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginTop: 20 }}>
                      {photoUrls.map((url, i) => (
                        <div key={url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                          <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {i === 0 && <div style={{ position: 'absolute', top: 6, left: 6, background: '#006AFF', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>COVER</div>}
                          <button onClick={() => setPhotoUrls(p => p.filter(u => u !== url))} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} color="white" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { if (typeof window!=='undefined') window.history.back(); else setStep(skipDetails ? 2 : 3); }} style={{ flex: 1, padding: '15px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><ArrowLeft size={18} /> {t.back}</button>
                  <button onClick={() => goToStep(5)} style={{ flex: 2, padding: '15px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{t.nextReview} <ArrowRight size={18} /></button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <PriceSuggestion propertyData={{ type: form.type, title: form.title, description: form.description, region: '', city: form.city, subcity: form.subcity, woreda: form.woreda, specific_location: form.specific_location, bedrooms: form.bedrooms, bathrooms: form.bathrooms, area: form.area, floor: form.floor, year_built: form.year_built, amenities: form.amenities }} imageUrls={photoUrls} onUsePrice={(price) => set('price', price.toString())} />
                </div>
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} color="#059669" /></div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#111827' }}>{t.reviewTitle}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 0 }}>
                    {[
                      [lang === 'EN' ? 'Owner Name' : 'ባለቤት ስም', ownerName, 0],
                      [lang === 'EN' ? 'Owner Email' : 'ኢሜይል', ownerEmail, 0],
                      [lang === 'EN' ? 'Owner Phone' : 'ስልክ', ownerPhone || '—', 0],
                      [lang === 'EN' ? 'Title' : 'ርዕስ', form.title, 1],
                      [lang === 'EN' ? 'Type' : 'አይነት', form.type, 1],
                      [lang === 'EN' ? 'Price' : 'ዋጋ', form.price_negotiable ? 'Negotiable' : `${form.currency} ${parseFloat(form.price || '0').toLocaleString()}`, 1],
                      [lang === 'EN' ? 'City' : 'ከተማ', form.city || '—', 2],
                      [lang === 'EN' ? 'Subcity' : 'ክፍለ ከተማ', form.subcity || '—', 2],
                      [t.bedrooms, form.bedrooms || '—', 1],
                      [t.bathrooms, form.bathrooms || '—', 1],
                      [t.houseArea, form.area ? `${form.area} m²` : '—', 1],
                      [lang === 'EN' ? 'Photos' : 'ፎቶዎች', `${photoUrls.length}`, 4],
                    ].map(([label, value, editStep]) => (
                      <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f3f4f6', gap: 10 }}>
                        <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>{label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: '60%' }}>
                          <span style={{ fontSize: 14, color: '#111827', fontWeight: 500, textAlign: 'right' as const }}>{value}</span>
                          <button type="button" onClick={() => goToStep((editStep as number) === 0 ? 1 : (editStep as number))} style={{ fontSize: 12, color: '#006AFF', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                            {lang === 'EN' ? 'Edit' : 'አስተካክል'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'white', borderRadius: 16, border: '2px solid #006AFF', padding: '26px 30px', marginBottom: 20 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{t.listingFeeTitle}</div>
                  <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>• {t.listingFeeDesc1}<br />• {t.listingFeeDesc2}<br />• {t.listingFeeDesc3}<br />• {t.listingFeeDesc4}</div>
                </div>
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => goToStep(4)} style={{ flex: 1, padding: '15px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><ArrowLeft size={18} /> {t.back}</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '15px', borderRadius: 12, background: loading ? '#9ca3af' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {loading ? t.submitting : t.submitPay}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, MapPin, BedDouble, Bath, Maximize2, Heart, ArrowRight, TrendingUp, Shield, Clock, SlidersHorizontal, X, ChevronDown, Video, FileText, Home, Zap, Lock, Globe, Building2, ShoppingBag, Layers, Megaphone, Scale, Truck, Paintbrush, Landmark, ClipboardList, HardHat, CalendarDays, Hotel, Stethoscope, Warehouse } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { Navbar } from '@/components/layout/Navbar';
import { AdCard } from '@/components/ads/AdCard';

type Property = {
  id: string; title: string; type: string; price: number;
  bedrooms: number; bathrooms: number; area: number;
  location: string; subcity: string; images: string[];
  status: string; currency: string; price_negotiable: boolean;
};

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  sale: { color: '#1d4ed8', bg: '#dbeafe' },
  long_rent: { color: '#065f46', bg: '#d1fae5' },
  short_rent: { color: '#92400e', bg: '#fef3c7' },
};

function formatPrice(price: number, currency: string) {
  if (!price) return 'Negotiable';
  if (price >= 1000000) return `${currency} ${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${currency} ${(price / 1000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
}

const ETHIOPIA_CITIES = [
  { cityEn: 'Addis Ababa', cityAm: 'አዲስ አበባ', subsEn: ['Bole','Yeka','Kirkos','Lemi Kura','Nifas Silk-Lafto','Arada','Lideta','Gullele','Kolfe Keraniyo','Akaki-Kality','Addis Ketema'], subsAm: ['ቦሌ','የካ','ቂርቆስ','ለሚ ኩራ','ንፋስ ስልክ ላፍቶ','አራዳ','ልደታ','ጉለሌ','ኮልፌ ቀራኒዮ','አቃቂ ቃሊቲ','አዲስ ከተማ'] },
  { cityEn: 'Dire Dawa', cityAm: 'ድሬዳዋ', subsEn: ['Kezira','Magala','Melka Jebdu','Sabiyan','Gende Qore','Gende Tesfa'], subsAm: ['ቀዚራ','መጋላ','መልካ ጀብዱ','ሳቢያን','ገንደ ቆሬ','ገንደ ተስፋ'] },
  { cityEn: 'Adama', cityAm: 'አዳማ', subsEn: ['Bole','Arada','Dabe Soloke','Melka Adama','Boku','Migira','Posta Bet'], subsAm: ['ቦሌ','አራዳ','ዳቤ ሶሎቄ','መልካ አዳማ','ቦቁ','ሚጊራ','ፖስታ ቤት'] },
  { cityEn: 'Gondar', cityAm: 'ጎንደር', subsEn: ['Maraki','Arada','Azezo','Fasil','Jantekel','Lideta','Gebriel'], subsAm: ['ማራኪ','አራዳ','አዘዞ','ፋሲል','ጃንተከል','ልደታ','ገብርኤል'] },
  { cityEn: 'Hawassa', cityAm: 'ሐዋሳ', subsEn: ['Hayiq Dar','Misrak','Tabor','Mehal','Bahil Adarash','Tula','Monopol'], subsAm: ['ሐይቅ ዳር','ምሥራቅ','ታቦር','መሀል','ባህል አዳራሽ','ቱላ','ሞኖፖል'] },
  { cityEn: 'Bahir Dar', cityAm: 'ባሕር ዳር', subsEn: ['Belay Zeleke','Atse Tewodros','Fasilo','Shimbit','Ginbot 20','Tana','Diaspora Sefer'], subsAm: ['በላይ ዘለቀ','አፄ ቴዎድሮስ','ፋሲሎ','ሽምቢት','ግንቦት 20','ጣና','ዲያስፖራ ሰፈር'] },
  { cityEn: 'Mekelle', cityAm: 'መቐለ', subsEn: ['Hadnet','Ayder','Kedamay Weyane','Qwiha','Semien','Saharti','Adi Haki'], subsAm: ['ሃድነት','አይደር','ቀዳማይ ወያነ','ኩዊሃ','ሰሜን','ሰሐርቲ','ዓዲ ሓቂ'] },
  { cityEn: 'Jimma', cityAm: 'ጅማ', subsEn: ['Hermata','Jiren','Bosa Bazab','Mendera Kochino','Ginjo','Seto Semero'], subsAm: ['ሀርማታ','ጅሬን','ቦሳ ባዛብ','መንደራ ኮቺኖ','ጊንጆ','ሴቶ ሰመሮ'] },
  { cityEn: 'Dessie', cityAm: 'ደሴ', subsEn: ['Arada','Piazza','Dawudo','Segno Gebeya','Hotie','Memhir Akale Wold','Kurkur'], subsAm: ['አራዳ','ፒያሳ','ዳውዶ','ሰኞ ገበያ','ሆጤ','መምህር አካለ ወልድ','ኩርኩር'] },
  { cityEn: 'Jijiga', cityAm: 'ጅጅጋ', subsEn: ['Kebele 01','Kebele 04','Taiwan','Dudaxada','Dudahidhi'], subsAm: ['ቀበሌ 01','ቀበሌ 04','ታይዋን','ዱዳሀዳ','ዱዳሂዲ'] },
  { cityEn: 'Shashemene', cityAm: 'ሻሸመኔ', subsEn: ['Bulchana','Arada','Kuyera','Abosto','Alelu','Haile Selassie'], subsAm: ['ቡልቻና','አራዳ','ኩየራ','አቦስቶ','አለሉ','ኃይለ ሥላሴ'] },
  { cityEn: 'Bishoftu', cityAm: 'ቢሾፍቱ', subsEn: ['Kebele 01','Kebele 02','Kuriftu','Babogaya','Hora'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ኩሪፍቱ','ባቦጋያ','ሆራ'] },
  { cityEn: 'Sodo', cityAm: 'ሶዶ', subsEn: ['Arada','Mehal','Wolaita Sodo Zuria','Gurumu','Kercheche'], subsAm: ['አራዳ','መሀል','ወላይታ ሶዶ ዙሪያ','ጉሩሙ','ቀርጨጬ'] },
  { cityEn: 'Arba Minch', cityAm: 'አርባ ምንጭ', subsEn: ['Secha','Sikela','Kulfo','Limat','Dozo'], subsAm: ['ሰጫ','ሲከላ','ኩልፎ','ልማት','ዶዞ'] },
  { cityEn: 'Hosaena', cityAm: 'ሆሳዕና', subsEn: ['Gojeb','Sech Duna','Lichamba','Bobicho'], subsAm: ['ጎጀብ','ሰጭ ዱና','ሊቻምባ','ቦቢቾ'] },
  { cityEn: 'Nekemte', cityAm: 'ነቀምት', subsEn: ['Bakanisa','Chalalaki','Kumsa Moroda','Cheleleki'], subsAm: ['በቀኒሳ','ጨለለቂ','ኩምሳ ሞሮዳ','ጨለለቂ'] },
  { cityEn: 'Asella', cityAm: 'አሰላ', subsEn: ['Kebele 01','Kebele 02','Arada','Chilalo'], subsAm: ['ቀበሌ 01','ቀበሌ 02','አራዳ','ጭላሎ'] },
  { cityEn: 'Dilla', cityAm: 'ዲላ', subsEn: ['Arada','Mehal','Odey','Chichu'], subsAm: ['አራዳ','መሀል','ኦዴይ','ቺቹ'] },
  { cityEn: 'Ambo', cityAm: 'አምቦ', subsEn: ['Kebele 01','Senkele','Abebe Bikila','Oda Nabee'], subsAm: ['ቀበሌ 01','ሰንቀሌ','አበበ ቢቂላ','ኦዳ ነቤ'] },
  { cityEn: 'Debre Birhan', cityAm: 'ደብረ ብርሃን', subsEn: ['Kebele 01','Kebele 04','Kebele 09','Atse Zerayacob'], subsAm: ['ቀበሌ 01','ቀበሌ 04','ቀበሌ 09','አፄ ዘርዓ ያዕቆብ'] },
  { cityEn: 'Debre Markos', cityAm: 'ደብረ ማርቆስ', subsEn: ['Kebele 03','Kebele 05','Gojjam Ber','Nigus Teklehaimanot'], subsAm: ['ቀበሌ 03','ቀበሌ 05','ጎጃም በር','ንጉሥ ተክለሃይማኖት'] },
  { cityEn: 'Kombolcha', cityAm: 'ኮምቦልቻ', subsEn: ['Kebele 01','Kebele 03','Worka','Millennium'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ወርቃ','ሚሊኒየም'] },
  { cityEn: 'Harar', cityAm: 'ሐረር', subsEn: ['Jugol','Shenkor','Aboker','JinEala','Duk Ber'], subsAm: ['ጁጎል','ሸንኮር','አቦከር','ጅን ኤላ','ዱክ በር'] },
  { cityEn: 'Lalibela', cityAm: 'ላሊበላ', subsEn: ['Kebele 01','Kebele 02','Shimberma','Neakuto Leab'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ሽምብርማ','ነአኩቶ ለአብ'] },
  { cityEn: 'Aksum', cityAm: 'አክሱም', subsEn: ['Hayelom','Hawelti','Nebrid','Kindeya'], subsAm: ['ሃየሎም','ሓወልቲ','ነብሪድ','ክንደያ'] },
  { cityEn: 'Adigrat', cityAm: 'ዓዲግራት', subsEn: ['Kebele 01','Kebele 03','Agazi','GindaAt'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ዓጋዚ','ጊንዳዓት'] },
  { cityEn: 'Shire', cityAm: 'ሽረ እንዳሥላሴ', subsEn: ['Kebele 01','Kebele 02','Kebele 03','Axum Road'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ቀበሌ 03','አክሱም መንገድ'] },
  { cityEn: 'Maychew', cityAm: 'ማይጨው', subsEn: ['Kebele 01','Kebele 02','Adi-Goshu'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ዓዲ ጎሹ'] },
  { cityEn: 'Alamata', cityAm: 'አላማጣ', subsEn: ['Kebele 01','Kebele 02','Garjale'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ጋርጃሌ'] },
  { cityEn: 'Kobo', cityAm: 'ቆቦ', subsEn: ['Kebele 01','Kebele 02','Arada'], subsAm: ['ቀበሌ 01','ቀበሌ 02','አራዳ'] },
  { cityEn: 'Debre Tabor', cityAm: 'ደብረ ታቦር', subsEn: ['Kebele 01','Kebele 03','Kebele 04','Guna'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ቀበሌ 04','ጉና'] },
  { cityEn: 'Debark', cityAm: 'ደባርቅ', subsEn: ['Kebele 01','Kebele 02','Simien Gate'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ስሜን መግቢያ'] },
  { cityEn: 'Woldiya', cityAm: 'ወልድያ', subsEn: ['Piazza','Arada','Gubalafto'], subsAm: ['ፒያሳ','አራዳ','ጉባላፍቶ'] },
  { cityEn: 'Welkite', cityAm: 'ወልቂጤ', subsEn: ['Kebele 01','Kebele 02','Gubre'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ጉብሬ'] },
  { cityEn: 'Goba', cityAm: 'ጎባ', subsEn: ['Arada','Furuna','Kebele 01'], subsAm: ['አራዳ','ፉሩና','ቀበሌ 01'] },
  { cityEn: 'Robe', cityAm: 'ሮቤ', subsEn: ['Mehal Ketema','Beklo Bet','Airport Road'], subsAm: ['መሀል ከተማ','በቅሎ ቤት','አየር መንገድ'] },
  { cityEn: 'Burayu', cityAm: 'ቡራዩ', subsEn: ['Gefersa','Keta','Sansusi'], subsAm: ['ገፈርሳ','ቀታ','ሳንሱሲ'] },
  { cityEn: 'Sululta', cityAm: 'ሱሉልታ', subsEn: ['Sululta Center','Mulu'], subsAm: ['ሱሉልታ መሀል','ሙሉ'] },
  { cityEn: 'Sebeta', cityAm: 'ሰበታ', subsEn: ['Alem Gena','Sebeta Center','Walayte'], subsAm: ['ዓለም ገና','ሰበታ መሀል','ወላይቴ'] },
  { cityEn: 'Legetafo', cityAm: 'ለገጣፎ', subsEn: ['Legedadi','Legetafo Center'], subsAm: ['ለገዳዲ','ለገጣፎ መሀል'] },
  { cityEn: 'Gambela', cityAm: 'ጋምቤላ', subsEn: ['Kebele 01','Kebele 03','Baro River side','Newland'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ባሮ ወንዝ ዳር','ኒውላንድ'] },
  { cityEn: 'Assosa', cityAm: 'አሶሳ', subsEn: ['Kebele 01','Kebele 02','Amba 14','Selga'], subsAm: ['ቀበሌ 01','ቀበሌ 02','አምባ 14','ሰልጋ'] },
  { cityEn: 'Semera', cityAm: 'ሰመራ', subsEn: ['Semera Center','Logia Town','Agat'], subsAm: ['ሰመራ መሀል','ሎጊያ ከተማ','አጋት'] },
];

export default function HomePage() {
  const { t, lang } = useLang();
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('any');
  const [cityFilter, setCityFilter] = useState('');
  const [subcity, setSubcity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const cityRef = useRef<HTMLDivElement>(null);

  const selectedCity = ETHIOPIA_CITIES.find(c => c.cityEn === cityFilter);
  const filteredCities = ETHIOPIA_CITIES.filter(c =>
    citySearch === '' ||
    c.cityEn.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.cityAm.includes(citySearch)
  );

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('properties').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = properties.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    if (minPrice && p.price < parseFloat(minPrice)) return false;
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;
    if (bedrooms !== 'any' && p.bedrooms !== parseInt(bedrooms)) return false;
    if (cityFilter && !p.location?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    if (subcity && !p.subcity?.toLowerCase().includes(subcity.toLowerCase()) && !p.location?.toLowerCase().includes(subcity.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  const toggleFav = (id: string) => setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const typeLabels: Record<string, string> = {
    sale: t.forSale, long_rent: t.forRent, short_rent: t.shortStay
  };

  const activeFilterCount = [
    minPrice, maxPrice,
    bedrooms !== 'any' ? bedrooms : '',
    cityFilter, subcity,
    sortBy !== 'newest' ? sortBy : '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setMinPrice(''); setMaxPrice('');
    setBedrooms('any'); setSubcity('');
    setCityFilter(''); setCitySearch('');
    setSortBy('newest'); setSearch('');
    setTypeFilter('all');
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box' as const, background: 'white',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block',
    marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.5px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO ── */}
      <div style={{
        padding: '100px 24px 110px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 540,
        backgroundImage: 'url(https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/hero-addis.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}>

        {/* Original blue overlay — unchanged */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(0,50,140,0.55) 0%, rgba(0,70,180,0.42) 40%, rgba(0,30,100,0.65) 100%)' }} />

        {/* ── BETACHEN BRANDING OVERLAY (top-right corner) ── */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 24,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(8, 18, 40, 0.50)',
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: 14,
          padding: '16px 14px 12px',
          width: 138,
        }}>
          {/* Tukul Badge */}
          <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="bc">
                <circle cx="48" cy="48" r="42" />
              </clipPath>
            </defs>
            <circle cx="48" cy="48" r="46" fill="#0d1f45" stroke="#8b1a1a" strokeWidth="3" />
            <g clipPath="url(#bc)">
              <rect x="0" y="0" width="96" height="96" fill="#0d1f45" />
              {/* Light rays */}
              <line x1="48" y1="17" x2="14" y2="60" stroke="#c8941e" strokeWidth="0.7" opacity="0.5" />
              <line x1="48" y1="17" x2="18" y2="62" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="24" y2="62" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="31" y2="62" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="39" y2="61" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="48" y2="61" stroke="#c8941e" strokeWidth="0.7" opacity="0.55" />
              <line x1="48" y1="17" x2="57" y2="61" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="65" y2="62" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="72" y2="62" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="78" y2="60" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              <line x1="48" y1="17" x2="82" y2="57" stroke="#c8941e" strokeWidth="0.6" opacity="0.45" />
              {/* Roof */}
              <polygon points="48,15 82,61 14,61" fill="#7a5810" />
              {/* Walls */}
              <rect x="22" y="61" width="52" height="24" fill="#c8941e" rx="1" />
              {/* Door posts */}
              <rect x="31" y="63" width="6" height="22" fill="#5a2d0c" rx="1" />
              <rect x="59" y="63" width="6" height="22" fill="#5a2d0c" rx="1" />
              {/* Trees */}
              <ellipse cx="16" cy="69" rx="5" ry="7" fill="#1a5c2a" />
              <rect x="14" y="74" width="4" height="11" fill="#5a3010" />
              <ellipse cx="80" cy="69" rx="5" ry="7" fill="#1a5c2a" />
              <rect x="78" y="74" width="4" height="11" fill="#5a3010" />
              {/* Door */}
              <rect x="40" y="67" width="16" height="18" fill="#2d1206" rx="2" />
              <rect x="43" y="70" width="5" height="8" fill="#3d1a08" rx="1" />
              <rect x="48" y="70" width="5" height="8" fill="#3d1a08" rx="1" />
              {/* Beacon */}
              <circle cx="48" cy="15" r="3" fill="#8b1a1a" />
              <circle cx="48" cy="15" r="1.4" fill="#fff" opacity="0.9" />
              {/* Ethiopian flag stripe */}
              <rect x="6" y="80" width="28" height="7" fill="#078930" />
              <rect x="34" y="80" width="28" height="7" fill="#FCDD09" />
              <rect x="62" y="80" width="28" height="7" fill="#DA121A" />
            </g>
            <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          </svg>

          {/* ቤታችን Ethiopic */}
          <span style={{
            fontFamily: "'Noto Serif Ethiopic', serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1,
            textAlign: 'center',
          }}>
            ቤታችን
          </span>

          {/* Latin */}
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
          }}>
            Betachen
          </span>

          {/* Ethiopian flag stripe */}
          <div style={{ display: 'flex', width: 64, height: 3, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ flex: 1, background: '#078930' }} />
            <div style={{ flex: 1, background: '#FCDD09' }} />
            <div style={{ flex: 1, background: '#DA121A' }} />
          </div>
        </div>
        {/* ── END BRANDING OVERLAY ── */}

        {/* Original hero content — unchanged except heroTitle2 color darkened */}
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,67,26,0.92)', borderRadius: 20, padding: '8px 22px', marginBottom: 28 }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '1px' }}>🇪🇹 {t.badge}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 58px)', fontWeight: 900, color: 'white', lineHeight: 1.08, marginBottom: 18, letterSpacing: '-2px' }}>
            {t.heroTitle1}<br />
            {/* CHANGED: was #FF6B35, now #8b1a1a for better contrast */}
            <span style={{ color: '#8b1a1a' }}>{t.heroTitle2}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 44, lineHeight: 1.7 }}>{t.heroSub}</p>
          <div style={{ background: 'white', borderRadius: 16, padding: 8, display: 'flex', gap: 8, maxWidth: 620, margin: '0 auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px' }}>
              <Search size={18} color="#9ca3af" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#111827', background: 'transparent', fontFamily: 'inherit' }} />
            </div>
            <button style={{ padding: '12px 32px', background: '#E8431A', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              {t.searchBtn}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginTop: 52 }}>
            {[['1,200+', t.statsProps], ['20+', t.statsCities], ['500+', t.statsOwners]].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>{num}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ── END HERO ── */}

      {/* Filter bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
            {[['all', t.allProps], ['sale', t.forSale], ['long_rent', t.forRent], ['short_rent', t.shortStay]].map(([val, label]) => (
              <button key={val} onClick={() => setTypeFilter(val)} style={{ padding: '8px 18px', borderRadius: 25, border: `2px solid ${typeFilter === val ? '#006AFF' : '#e5e7eb'}`, background: typeFilter === val ? '#006AFF' : 'white', color: typeFilter === val ? 'white' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{label}</button>
            ))}
            <button onClick={() => setShowFilters(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 25, border: `2px solid ${showFilters || activeFilterCount > 0 ? '#E8431A' : '#e5e7eb'}`, background: showFilters || activeFilterCount > 0 ? '#fef2ee' : 'white', color: showFilters || activeFilterCount > 0 ? '#E8431A' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <SlidersHorizontal size={14} />
              {lang === 'EN' ? 'Filters' : 'ማጣሪያዎች'} {activeFilterCount > 0 && <span style={{ background: '#E8431A', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{activeFilterCount}</span>}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 25, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
                <X size={13} /> {lang === 'EN' ? 'Clear all' : 'ሁሉንም አጽዳ'}
              </button>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              {loading ? t.loading : `${filtered.length} ${t.propsFound}`}
            </span>
          </div>

          {showFilters && (
            <div style={{ marginTop: 16, padding: '20px 24px', background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Min Price (ETB)' : 'ዝቅተኛ ዋጋ (ETB)'}</label>
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder={lang === 'EN' ? 'e.g. 500000' : 'ለምሳሌ 500000'} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Max Price (ETB)' : 'ከፍተኛ ዋጋ (ETB)'}</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder={lang === 'EN' ? 'e.g. 5000000' : 'ለምሳሌ 5000000'} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Bedrooms' : 'መኝታ ክፍሎች'}</label>
                  <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} style={inputStyle}>
                    <option value="any">{lang === 'EN' ? 'Any' : 'ማንኛውም'}</option>
                    <option value="1">{lang === 'EN' ? '1 Bedroom' : '1 መኝታ ክፍል'}</option>
                    <option value="2">{lang === 'EN' ? '2 Bedrooms' : '2 መኝታ ክፍሎች'}</option>
                    <option value="3">{lang === 'EN' ? '3 Bedrooms' : '3 መኝታ ክፍሎች'}</option>
                    <option value="4">{lang === 'EN' ? '4 Bedrooms' : '4 መኝታ ክፍሎች'}</option>
                    <option value="5">{lang === 'EN' ? '5+ Bedrooms' : '5+ መኝታ ክፍሎች'}</option>
                  </select>
                </div>
                <div ref={cityRef} style={{ position: 'relative' }}>
                  <label style={labelStyle}>{lang === 'EN' ? 'City' : 'ከተማ'}</label>
                  <div style={{ position: 'relative' }}>
                    <input value={citySearch}
                      onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); if (!e.target.value) { setCityFilter(''); setSubcity(''); } }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder={lang === 'EN' ? 'Search city...' : 'ከተማ ፈልግ...'}
                      style={inputStyle} />
                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                  {showCityDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, zIndex: 100, maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4 }}>
                      <div onClick={() => { setCityFilter(''); setCitySearch(''); setSubcity(''); setShowCityDropdown(false); }}
                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Globe size={13} color="#6b7280" /> {lang === 'EN' ? 'All Ethiopia' : 'ሁሉም ኢትዮጵያ'}
                      </div>
                      {filteredCities.map(c => (
                        <div key={c.cityEn}
                          onClick={() => { setCityFilter(c.cityEn); setCitySearch(lang === 'EN' ? `${c.cityEn} (${c.cityAm})` : `${c.cityAm} (${c.cityEn})`); setSubcity(''); setShowCityDropdown(false); }}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#111827', borderBottom: '1px solid #f3f4f6', background: cityFilter === c.cityEn ? '#f0f6ff' : 'white' }}
                          onMouseEnter={e => { if (cityFilter !== c.cityEn) (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                          onMouseLeave={e => { if (cityFilter !== c.cityEn) (e.currentTarget as HTMLElement).style.background = 'white'; }}>
                          <span style={{ fontWeight: cityFilter === c.cityEn ? 700 : 400 }}>{lang === 'EN' ? c.cityEn : c.cityAm}</span>
                          <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 12 }}>{lang === 'EN' ? c.cityAm : c.cityEn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, opacity: selectedCity ? 1 : 0.5 }}>{lang === 'EN' ? 'Subcity' : 'ክፍለ ከተማ'}</label>
                  <select value={subcity} onChange={e => setSubcity(e.target.value)} disabled={!selectedCity} style={{ ...inputStyle, opacity: selectedCity ? 1 : 0.5, cursor: selectedCity ? 'pointer' : 'not-allowed' }}>
                    <option value="">{selectedCity ? (lang === 'EN' ? `All ${selectedCity.cityEn}` : `ሁሉም ${selectedCity.cityAm}`) : (lang === 'EN' ? '— Select city first —' : '— መጀመሪያ ከተማ ይምረጡ —')}</option>
                    {selectedCity?.subsEn.map((sub, i) => (
                      <option key={sub} value={sub}>{lang === 'EN' ? `${sub} — ${selectedCity.subsAm[i]}` : `${selectedCity.subsAm[i]} — ${sub}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Sort By' : 'ደርድር'}</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
                    <option value="newest">{lang === 'EN' ? 'Newest First' : 'አዲሱ ቀደም'}</option>
                    <option value="price_asc">{lang === 'EN' ? 'Price: Low to High' : 'ዋጋ: ዝቅ ወደ ከፍ'}</option>
                    <option value="price_desc">{lang === 'EN' ? 'Price: High to Low' : 'ዋጋ: ከፍ ወደ ዝቅ'}</option>
                  </select>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 16 }}>
                  {minPrice && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{lang === 'EN' ? 'Min' : 'ዝቅተኛ'}: ETB {parseInt(minPrice).toLocaleString()} <button onClick={() => setMinPrice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {maxPrice && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{lang === 'EN' ? 'Max' : 'ከፍተኛ'}: ETB {parseInt(maxPrice).toLocaleString()} <button onClick={() => setMaxPrice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {bedrooms !== 'any' && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{bedrooms} {lang === 'EN' ? 'bed' : 'መኝ'} <button onClick={() => setBedrooms('any')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {cityFilter && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{cityFilter} <button onClick={() => { setCityFilter(''); setCitySearch(''); setSubcity(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {subcity && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{subcity} <button onClick={() => setSubcity('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {sortBy !== 'newest' && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sortBy === 'price_asc' ? (lang === 'EN' ? 'Price ↑' : 'ዋጋ ↑') : (lang === 'EN' ? 'Price ↓' : 'ዋጋ ↓')} <button onClick={() => setSortBy('newest')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Property Grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTop: '4px solid #006AFF', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{t.loading}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Building2 size={40} color="#d1d5db" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{activeFilterCount > 0 ? (lang === 'EN' ? 'No properties match your filters' : 'ማጣሪያዎቹን የሚያሟሉ ንብረቶች የሉም') : t.noProps}</div>
            <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 28 }}>{activeFilterCount > 0 ? (lang === 'EN' ? 'Try adjusting your filters' : 'ማጣሪያዎቹን ለማስተካከል ይሞክሩ') : t.noPropsDesc}</div>
            {activeFilterCount > 0 ? (
              <button onClick={clearFilters} style={{ padding: '12px 28px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>{lang === 'EN' ? 'Clear Filters' : 'ማጣሪያዎችን አጽዳ'}</button>
            ) : (
              <Link href="/owner/listings/new" style={{ padding: '12px 28px', background: '#E8431A', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {t.postListing} <ArrowRight size={18} />
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtered.map(p => {
              const tc = TYPE_COLORS[p.type] || TYPE_COLORS.sale;
              const isFav = favorites.includes(p.id);
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <Link href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Home size={32} color="#93c5fd" />
                          </div>
                          <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>{t.noPhoto}</div>
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 12, left: 12, background: tc.bg, color: tc.color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                        {typeLabels[p.type]}
                      </div>
                      <button onClick={e => { e.preventDefault(); toggleFav(p.id); }} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <Heart size={16} fill={isFav ? '#E8431A' : 'none'} color={isFav ? '#E8431A' : '#6b7280'} />
                      </button>
                    </div>
                  </Link>
                  <Link href={`/properties/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '18px 20px 20px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: p.price_negotiable ? '#92400e' : '#006AFF', marginBottom: 4 }}>
                      {p.price_negotiable ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 20 }}>
                          {t.negotiablePrice}
                        </span>
                      ) : (
                        <>
                          {formatPrice(p.price, p.currency)}
                          {p.type === 'long_rent' && <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{t.perMonth}</span>}
                          {p.type === 'short_rent' && <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{t.perNight}</span>}
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E8431A', fontSize: 13, marginBottom: 14 }}>
                      <MapPin size={13} />{p.location || p.subcity || 'Ethiopia'}
                    </div>
                    <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280' }}>
                      {p.bedrooms > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BedDouble size={14} />{p.bedrooms} {t.bd}</span>}
                      {p.bathrooms > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={14} />{p.bathrooms} {t.ba}</span>}
                      {p.area && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Maximize2 size={14} />{p.area} m²</span>}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Homepage Ads */}
      {!loading && filtered.length > 0 && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 40px' }}>
          <AdCard placement="homepage" maxAds={3} />
        </div>
      )}

      {/* Commercial Properties Teaser */}
      <div style={{ background: '#f8faff', padding: '72px 24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap' as const, gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', borderRadius: 20, padding: '7px 16px', marginBottom: 14 }}>
                <Building2 size={14} color="#006AFF" />
                <span style={{ color: '#006AFF', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>
                  {lang === 'EN' ? 'COMMERCIAL REAL ESTATE' : 'የንግድ ሪል እስቴት'}
                </span>
              </div>
              <h2 style={{ fontSize: 34, fontWeight: 900, color: '#111827', marginBottom: 10, letterSpacing: '-0.5px' }}>
                {lang === 'EN' ? 'Find Commercial Space' : 'የንግድ ቦታ ያግኙ'}
              </h2>
              <p style={{ color: '#6b7280', fontSize: 17, lineHeight: 1.6 }}>
                {lang === 'EN' ? 'Office spaces, retail, warehouses, event halls and more across Ethiopia' : 'ቢሮዎች፣ መደብሮች፣ መጋዘኖች፣ አዳራሾች እና ሌሎች በኢትዮጵያ'}
              </p>
            </div>
            <Link href="/commercial" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
              {lang === 'EN' ? 'Browse All Commercial' : 'ሁሉንም የንግድ ቤቶች ይሰሱ'} <ArrowRight size={17} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {[
              { key: 'office', Icon: Building2, en: 'Office Space', am: 'ቢሮ ቦታ', color: '#dbeafe', iconColor: '#1d4ed8' },
              { key: 'retail', Icon: ShoppingBag, en: 'Retail / Shop', am: 'መደብር / ሱቅ', color: '#d1fae5', iconColor: '#065f46' },
              { key: 'warehouse', Icon: Warehouse, en: 'Warehouse', am: 'መጋዘን', color: '#fef3c7', iconColor: '#92400e' },
              { key: 'event_hall', Icon: CalendarDays, en: 'Event Hall', am: 'አዳራሽ', color: '#fce7f3', iconColor: '#9d174d' },
              { key: 'hotel', Icon: Hotel, en: 'Hotel / Guest', am: 'ሆቴል', color: '#ede9fe', iconColor: '#5b21b6' },
              { key: 'commercial_land', Icon: MapPin, en: 'Commercial Land', am: 'የንግድ መሬት', color: '#d1fae5', iconColor: '#047857' },
              { key: 'mixed_use', Icon: Layers, en: 'Mixed Use', am: 'ድብልቅ አጠቃቀም', color: '#fff7ed', iconColor: '#c2410c' },
              { key: 'medical', Icon: Stethoscope, en: 'Medical / Clinic', am: 'የሕክምና ቦታ', color: '#fef2f2', iconColor: '#dc2626' },
            ].map(({ key, Icon, en, am, color, iconColor }) => (
              <Link key={key} href={`/commercial?type=${key}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: 16, padding: '24px 16px', border: '1.5px solid #e5e7eb', textAlign: 'center' as const, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#006AFF'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,106,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon size={26} color={iconColor} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                    {lang === 'EN' ? en : am}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 32, padding: '24px 32px', background: 'linear-gradient(135deg, #1e293b, #0f3460)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                  {lang === 'EN' ? 'Own a commercial space? List it on ጎጆ' : 'የንግድ ቦታ አለዎት? በጎጆ ላይ ይዘርዝሩ'}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                  {lang === 'EN' ? 'Reach businesses, investors and tenants — ETB 500 for 3 months' : 'ንግዶችን፣ ባለሀብቶችንና ተከራዮችን ይድረሱ — 3 ወር ETB 500'}
                </div>
              </div>
            </div>
            <Link href="/owner/commercial/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
              {lang === 'EN' ? 'List Commercial Space' : 'የንግድ ቦታ ዘርዝር'} <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* Advertisement Section */}
      <div style={{ background: 'white', padding: '72px 24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef2ee', borderRadius: 20, padding: '7px 16px', marginBottom: 14 }}>
              <Megaphone size={14} color="#E8431A" />
              <span style={{ color: '#E8431A', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>
                {lang === 'EN' ? 'SPONSORED' : 'ማስታወቂያ'}
              </span>
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: '#111827', marginBottom: 10 }}>
              {lang === 'EN' ? 'Services & Businesses' : 'አገልግሎቶችና ንግዶች'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: 17 }}>
              {lang === 'EN' ? 'Trusted businesses and services for property buyers, owners and investors' : 'ለቤት ገዢዎች፣ ባለቤቶችና ባለሀብቶች የታመኑ ንግዶችና አገልግሎቶች'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { category: lang === 'EN' ? 'Legal Services' : 'የሕግ አገልግሎቶች', icon: Scale, color: '#dbeafe', iconColor: '#1d4ed8', title: lang === 'EN' ? 'Property Legal Services' : 'የንብረት ሕጋዊ አገልግሎት', desc: lang === 'EN' ? 'Title deed verification, contract drafting, ownership transfer and legal consultation for property transactions.' : 'የርስት ማረጋገጫ፣ ውል ዝግጅት፣ ባለቤትነት ዝውውርና የሕግ ምክር።', cta: lang === 'EN' ? 'Contact a Lawyer' : 'ጠበቃ ያነጋግሩ' },
              { category: lang === 'EN' ? 'Moving & Logistics' : 'ማጓጓዝ', icon: Truck, color: '#d1fae5', iconColor: '#065f46', title: lang === 'EN' ? 'Moving & Relocation Services' : 'የቤት ዕቃ ማጓጓዣ', desc: lang === 'EN' ? 'Professional moving services across Addis Ababa and major Ethiopian cities. Safe, fast and affordable.' : 'በአዲስ አበባ እና በዋና ከተሞች የቤት ዕቃ ማጓጓዣ። ፈጣን፣ ደህንነቱ የተጠበቀ።', cta: lang === 'EN' ? 'Get a Quote' : 'ዋጋ ይጠይቁ' },
              { category: lang === 'EN' ? 'Interior Design' : 'የቤት ዲዛይን', icon: Paintbrush, color: '#fce7f3', iconColor: '#9d174d', title: lang === 'EN' ? 'Interior Design & Renovation' : 'የቤት ዲዛይን እና ጥገና', desc: lang === 'EN' ? 'Transform your new property with professional interior design, renovation and furnishing services.' : 'አዲስ ቤትዎን በሙያዊ የቤት ዲዛይን፣ ጥገናና የፈርኒቸር አገልግሎት ይቀይሩ።', cta: lang === 'EN' ? 'View Portfolio' : 'ስራዎቻቸውን ይመልከቱ' },
              { category: lang === 'EN' ? 'Finance & Mortgage' : 'ብድርና ፋይናንስ', icon: Landmark, color: '#fef3c7', iconColor: '#92400e', title: lang === 'EN' ? 'Home Loans & Mortgage' : 'የቤት ብድርና ሞርጌጅ', desc: lang === 'EN' ? 'Get financing for your property purchase. Compare mortgage rates from leading Ethiopian banks.' : 'ለቤት ግዢ ብድር ያግኙ። ከዋና ኢትዮጵያ ባንኮች ሞርጌጅ ያወዳድሩ።', cta: lang === 'EN' ? 'Check Eligibility' : 'ብቁነትዎን ያረጋግጡ' },
              { category: lang === 'EN' ? 'Property Management' : 'የንብረት አስተዳደር', icon: ClipboardList, color: '#ede9fe', iconColor: '#5b21b6', title: lang === 'EN' ? 'Property Management Services' : 'የንብረት አስተዳደር', desc: lang === 'EN' ? 'Let us manage your rental property. Tenant screening, rent collection and maintenance handled for you.' : 'ኪራይ ቤትዎን እኛ እናስተዳድር። ተከራይ ምርጫ፣ ኪራይ አሰባሰብና ጥገና።', cta: lang === 'EN' ? 'Learn More' : 'ተጨማሪ ይወቁ' },
              { category: lang === 'EN' ? 'Construction' : 'ግንባታ', icon: HardHat, color: '#fff7ed', iconColor: '#c2410c', title: lang === 'EN' ? 'Construction & Building Services' : 'የግንባታ አገልግሎቶች', desc: lang === 'EN' ? 'Residential and commercial construction, fit-out and building services from certified contractors.' : 'የመኖሪያ እና የንግድ ቤቶች ግንባታ፣ ፊኒሺንግ እና የግንባታ አገልግሎቶች።', cta: lang === 'EN' ? 'Request Quote' : 'ዋጋ ይጠይቁ' },
            ].map(({ category, icon: Icon, color, iconColor, title, desc, cta }) => (
              <div key={title} style={{ background: 'white', borderRadius: 18, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <div style={{ background: color, padding: '24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Icon size={26} color={iconColor} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: iconColor, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 4 }}>{category}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{title}</div>
                  </div>
                </div>
                <div style={{ padding: '20px 24px 24px' }}>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>{desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' as const, letterSpacing: '0.3px' }}>
                      {lang === 'EN' ? 'Sponsored' : 'ማስታወቂያ'}
                    </span>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: iconColor, color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                      {cta} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: '28px 32px', background: '#f9fafb', borderRadius: 18, border: '1.5px dashed #d1d5db', textAlign: 'center' as const }}>
            <Megaphone size={32} color="#9ca3af" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              {lang === 'EN' ? 'Advertise Your Business Here' : 'ንግድዎን እዚህ ያስተዋውቁ'}
            </div>
            <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 20 }}>
              {lang === 'EN' ? 'Reach thousands of property buyers, sellers, owners and investors across Ethiopia every day.' : 'በየቀኑ ሺዎችን የቤት ገዢዎች፣ ሻጮች፣ ባለቤቶችና ባለሀብቶች ይድረሱ።'}
            </div>
            <Link href="/advertise" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#E8431A', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              {lang === 'EN' ? 'Advertise on ጎጆ' : 'በጎጆ ላይ ያስተዋውቁ'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Diaspora Section */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '72px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8431A', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                <Globe size={14} color="white" />
                <span style={{ color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.5px' }}>{t.diasporaTag}</span>
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
                {t.diasporaTitle1}<br /><span style={{ color: '#FF6B35' }}>{t.diasporaTitle2}</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>{t.diasporaDesc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
                {[
                  { icon: Video, title: t.diasporaF1Title, desc: t.diasporaF1Desc },
                  { icon: Shield, title: t.diasporaF2Title, desc: t.diasporaF2Desc },
                  { icon: FileText, title: t.diasporaF3Title, desc: t.diasporaF3Desc },
                  { icon: Home, title: t.diasporaF4Title, desc: t.diasporaF4Desc },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="rgba(255,255,255,0.8)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/diaspora" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                {t.diasporaBtn} <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { number: '1,200+', label: t.diasporaStat1, icon: Building2 },
                { number: '4', label: t.diasporaStat2, icon: Shield },
                { number: '48hrs', label: t.diasporaStat3, icon: Zap },
                { number: '100%', label: t.diasporaStat4, icon: Lock },
              ].map(({ number, label, icon: Icon }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' as const }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon size={20} color="rgba(255,255,255,0.7)" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 4 }}>{number}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: '#f9fafb', padding: '64px 24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{t.whyTitle}</h2>
          <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 48 }}>{t.whySub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {[
              { icon: Shield, title: t.f1Title, desc: t.f1Desc },
              { icon: TrendingUp, title: t.f2Title, desc: t.f2Desc },
              { icon: Clock, title: t.f3Title, desc: t.f3Desc },
              { icon: MapPin, title: t.f4Title, desc: t.f4Desc },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', textAlign: 'left' as const }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={24} color="#E8431A" />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#006AFF', padding: '64px 24px', textAlign: 'center' as const }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>{t.ctaTitle}</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 32 }}>{t.ctaSub}</p>
        <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          {t.ctaBtn} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

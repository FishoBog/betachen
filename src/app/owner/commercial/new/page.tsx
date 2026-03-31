'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, MapPin, Maximize2, Heart, ArrowRight, SlidersHorizontal, X, ChevronDown, Globe, Building2 } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { Navbar } from '@/components/layout/Navbar';

type CommercialProperty = {
  id: string; title: string; type: string; price: number;
  area: number; location: string; subcity: string; images: string[];
  status: string; currency: string; price_negotiable: boolean;
  commercial_type: string; commercial_details: any;
};

const COMMERCIAL_TYPES = [
  { key: 'all', labelEn: 'All Commercial', labelAm: 'ሁሉም የንግድ ቤቶች' },
  { key: 'office', labelEn: 'Office Space', labelAm: 'ቢሮ ቦታ', icon: '🏢' },
  { key: 'retail', labelEn: 'Retail / Shop', labelAm: 'መደብር', icon: '🏪' },
  { key: 'warehouse', labelEn: 'Warehouse', labelAm: 'መጋዘን', icon: '🏭' },
  { key: 'event_hall', labelEn: 'Event Hall', labelAm: 'አዳራሽ', icon: '🎪' },
  { key: 'commercial_land', labelEn: 'Commercial Land', labelAm: 'የንግድ መሬት', icon: '🌍' },
  { key: 'mixed_use', labelEn: 'Mixed Use', labelAm: 'ድብልቅ', icon: '🏗️' },
  { key: 'hotel', labelEn: 'Hotel / Guest House', labelAm: 'ሆቴል', icon: '🏨' },
  { key: 'parking', labelEn: 'Parking', labelAm: 'ፓርኪንግ', icon: '🅿️' },
  { key: 'medical', labelEn: 'Medical / Clinic', labelAm: 'ሕክምና', icon: '🏥' },
  { key: 'bank', labelEn: 'Bank / Finance', labelAm: 'ባንክ', icon: '🏦' },
];

const LEASE_TYPE_LABELS: Record<string, { en: string; am: string }> = {
  monthly_rent: { en: 'Monthly Rent', am: 'ወርሃዊ ኪራይ' },
  annual_lease: { en: 'Annual Lease', am: 'ዓመታዊ ሊዝ' },
  long_term_lease: { en: 'Long-term Lease', am: 'የረጅም ጊዜ ሊዝ' },
  for_sale: { en: 'For Sale', am: 'ለሽያጭ' },
  lease_to_own: { en: 'Lease to Own', am: 'ሊዝ ወደ ባለቤትነት' },
  build_to_suit: { en: 'Build to Suit', am: 'እንደ ፍላጎት' },
  revenue_share: { en: 'Revenue Share', am: 'የገቢ ክፍፍል' },
};

const LEASE_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  monthly_rent: { color: '#065f46', bg: '#d1fae5' },
  annual_lease: { color: '#1d4ed8', bg: '#dbeafe' },
  long_term_lease: { color: '#5b21b6', bg: '#ede9fe' },
  for_sale: { color: '#92400e', bg: '#fef3c7' },
  lease_to_own: { color: '#9d174d', bg: '#fce7f3' },
  build_to_suit: { color: '#374151', bg: '#f3f4f6' },
  revenue_share: { color: '#0e7490', bg: '#cffafe' },
};

function formatPrice(price: number, currency: string) {
  if (!price) return currency === 'ETB' ? 'Negotiable' : 'Negotiable';
  if (price >= 1000000) return `${currency} ${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${currency} ${(price / 1000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
}

const ETHIOPIA_CITIES = [
  { cityEn: 'Addis Ababa', cityAm: 'አዲስ አበባ' },
  { cityEn: 'Dire Dawa', cityAm: 'ድሬዳዋ' },
  { cityEn: 'Adama', cityAm: 'አዳማ' },
  { cityEn: 'Gondar', cityAm: 'ጎንደር' },
  { cityEn: 'Hawassa', cityAm: 'ሐዋሳ' },
  { cityEn: 'Bahir Dar', cityAm: 'ባሕር ዳር' },
  { cityEn: 'Mekelle', cityAm: 'መቐለ' },
  { cityEn: 'Jimma', cityAm: 'ጅማ' },
  { cityEn: 'Dessie', cityAm: 'ደሴ' },
  { cityEn: 'Harar', cityAm: 'ሐረር' },
];

export default function CommercialPage() {
  const { lang } = useLang();
  const [properties, setProperties] = useState<CommercialProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [leaseFilter, setLeaseFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('properties')
      .select('*')
      .eq('status', 'active')
      .eq('is_commercial', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCityDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = properties.filter(p => {
    if (typeFilter !== 'all' && p.commercial_type !== typeFilter) return false;
    if (leaseFilter !== 'all' && p.commercial_details?.lease_type !== leaseFilter) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    if (minPrice && p.price < parseFloat(minPrice)) return false;
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;
    if (minArea && p.area < parseFloat(minArea)) return false;
    if (cityFilter && !p.location?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'area_desc') return (b.area || 0) - (a.area || 0);
    return 0;
  });

  const activeFilterCount = [
    minPrice, maxPrice, minArea, cityFilter,
    leaseFilter !== 'all' ? leaseFilter : '',
    sortBy !== 'newest' ? sortBy : '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setMinPrice(''); setMaxPrice(''); setMinArea('');
    setCityFilter(''); setCitySearch('');
    setLeaseFilter('all'); setSortBy('newest');
    setSearch(''); setTypeFilter('all');
  };

  const toggleFav = (id: string) => setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box' as const, background: 'white',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block',
    marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.5px',
  };

  const filteredCities = ETHIOPIA_CITIES.filter(c =>
    citySearch === '' ||
    c.cityEn.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.cityAm.includes(citySearch)
  );

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f3460 100%)', padding: '64px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#006AFF', borderRadius: 20, padding: '6px 18px', marginBottom: 20 }}>
            <Building2 size={13} color="white" />
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.8px' }}>
              {lang === 'EN' ? 'COMMERCIAL REAL ESTATE' : 'የንግድ ሪል እስቴት'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
            {lang === 'EN' ? 'Find Commercial Space' : 'የንግድ ቦታ ያግኙ'}<br />
            <span style={{ color: '#38bdf8' }}>{lang === 'EN' ? 'Across Ethiopia' : 'በኢትዮጵያ ሁሉ'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>
            {lang === 'EN'
              ? 'Office spaces, retail shops, warehouses, event halls and more — find the right commercial space for your business.'
              : 'ቢሮዎች፣ መደብሮች፣ መጋዘኖች፣ አዳራሾች እና ሌሎች — ለንግድዎ ትክክለኛውን ቦታ ያግኙ።'}
          </p>
          {/* Search bar */}
          <div style={{ background: 'white', borderRadius: 16, padding: 8, display: 'flex', gap: 8, maxWidth: 600, margin: '0 auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px' }}>
              <Search size={18} color="#9ca3af" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'EN' ? 'Search office, warehouse, retail...' : 'ቢሮ፣ መጋዘን፣ መደብር ፈልግ...'}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#111827', background: 'transparent', fontFamily: 'inherit' }} />
            </div>
            <button style={{ padding: '12px 28px', background: '#006AFF', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              {lang === 'EN' ? 'Search' : 'ፈልግ'}
            </button>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 44 }}>
            {[
              [lang === 'EN' ? 'Office Spaces' : 'ቢሮዎች', '🏢'],
              [lang === 'EN' ? 'Retail & Shops' : 'መደብሮች', '🏪'],
              [lang === 'EN' ? 'Warehouses' : 'መጋዘኖች', '🏭'],
              [lang === 'EN' ? 'Event Halls' : 'አዳራሾች', '🎪'],
            ].map(([label, icon]) => (
              <div key={label} style={{ textAlign: 'center' as const }}>
                <div style={{ fontSize: 22 }}>{icon}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Type tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', position: 'sticky', top: 64, zIndex: 40, overflowX: 'auto' as const }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 2, padding: '12px 0' }}>
          {COMMERCIAL_TYPES.map(ct => (
            <button key={ct.key} onClick={() => setTypeFilter(ct.key)}
              style={{ padding: '8px 16px', borderRadius: 25, border: `2px solid ${typeFilter === ct.key ? '#006AFF' : '#e5e7eb'}`, background: typeFilter === ct.key ? '#006AFF' : 'white', color: typeFilter === ct.key ? 'white' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: 5 }}>
              {ct.key !== 'all' && <span style={{ fontSize: 14 }}>{COMMERCIAL_TYPES.find(t => t.key === ct.key && t.key !== 'all') ? (ct as any).icon : ''}</span>}
              {lang === 'EN' ? ct.labelEn : ct.labelAm}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '10px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          {/* Lease type quick filters */}
          {[
            { key: 'all', en: 'All Types', am: 'ሁሉም' },
            { key: 'monthly_rent', en: 'For Rent', am: 'ለኪራይ' },
            { key: 'for_sale', en: 'For Sale', am: 'ለሽያጭ' },
            { key: 'annual_lease', en: 'Annual Lease', am: 'ዓመታዊ' },
            { key: 'long_term_lease', en: 'Long-term', am: 'የረጅም ጊዜ' },
          ].map(lt => (
            <button key={lt.key} onClick={() => setLeaseFilter(lt.key)}
              style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${leaseFilter === lt.key ? '#E8431A' : '#e5e7eb'}`, background: leaseFilter === lt.key ? '#fef2ee' : 'white', color: leaseFilter === lt.key ? '#E8431A' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {lang === 'EN' ? lt.en : lt.am}
            </button>
          ))}
          <button onClick={() => setShowFilters(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${showFilters || activeFilterCount > 0 ? '#E8431A' : '#e5e7eb'}`, background: showFilters || activeFilterCount > 0 ? '#fef2ee' : 'white', color: showFilters || activeFilterCount > 0 ? '#E8431A' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <SlidersHorizontal size={13} />
            {lang === 'EN' ? 'More Filters' : 'ተጨማሪ ማጣሪያዎች'}
            {activeFilterCount > 0 && <span style={{ background: '#E8431A', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 20, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}>
              <X size={12} /> {lang === 'EN' ? 'Clear' : 'አጽዳ'}
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            {loading ? (lang === 'EN' ? 'Loading...' : 'በመጫን ላይ...') : `${filtered.length} ${lang === 'EN' ? 'listings found' : 'ዝርዝሮች ተገኝተዋል'}`}
          </span>
        </div>

        {showFilters && (
          <div style={{ maxWidth: 1280, margin: '12px auto 0', padding: '20px 24px', background: 'white', borderRadius: 16, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Min Price (ETB)' : 'ዝቅተኛ ዋጋ'}</label>
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="e.g. 10000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Max Price (ETB)' : 'ከፍተኛ ዋጋ'}</label>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="e.g. 500000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Min Area (m²)' : 'ዝቅተኛ ስፋት (ሜ²)'}</label>
                <input type="number" value={minArea} onChange={e => setMinArea(e.target.value)} placeholder="e.g. 50" style={inputStyle} />
              </div>
              <div ref={cityRef} style={{ position: 'relative' }}>
                <label style={labelStyle}>{lang === 'EN' ? 'City' : 'ከተማ'}</label>
                <div style={{ position: 'relative' }}>
                  <input value={citySearch} onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); if (!e.target.value) setCityFilter(''); }}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder={lang === 'EN' ? 'Search city...' : 'ከተማ ፈልግ...'}
                    style={inputStyle} />
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                </div>
                {showCityDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, zIndex: 100, maxHeight: 200, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4 }}>
                    <div onClick={() => { setCityFilter(''); setCitySearch(''); setShowCityDropdown(false); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe size={13} /> {lang === 'EN' ? 'All Ethiopia' : 'ሁሉም ኢትዮጵያ'}
                    </div>
                    {filteredCities.map(c => (
                      <div key={c.cityEn} onClick={() => { setCityFilter(c.cityEn); setCitySearch(lang === 'EN' ? c.cityEn : c.cityAm); setShowCityDropdown(false); }}
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
                <label style={labelStyle}>{lang === 'EN' ? 'Sort By' : 'ደርድር'}</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
                  <option value="newest">{lang === 'EN' ? 'Newest First' : 'አዲሱ ቀደም'}</option>
                  <option value="price_asc">{lang === 'EN' ? 'Price: Low to High' : 'ዋጋ: ዝቅ ወደ ከፍ'}</option>
                  <option value="price_desc">{lang === 'EN' ? 'Price: High to Low' : 'ዋጋ: ከፍ ወደ ዝቅ'}</option>
                  <option value="area_desc">{lang === 'EN' ? 'Largest Area First' : 'ትልቁ ቦታ ቀደም'}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTop: '4px solid #006AFF', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{lang === 'EN' ? 'Loading listings...' : 'ዝርዝሮችን በመጫን ላይ...'}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Building2 size={40} color="#d1d5db" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {lang === 'EN' ? 'No commercial listings yet' : 'እስካሁን የንግድ ቤቶች የሉም'}
            </div>
            <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 28 }}>
              {lang === 'EN' ? 'Be the first to list a commercial property on ጎጆ' : 'በጎጆ ላይ የንግድ ቤት የሚዘረዝር የመጀመሪያው ሁን'}
            </div>
            <Link href="/owner/commercial/new" style={{ padding: '12px 28px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {lang === 'EN' ? 'List Commercial Property' : 'የንግድ ቤት ዘርዝር'} <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map(p => {
              const isFav = favorites.includes(p.id);
              const leaseType = p.commercial_details?.lease_type || 'monthly_rent';
              const leaseLabel = LEASE_TYPE_LABELS[leaseType] || { en: leaseType, am: leaseType };
              const leaseColor = LEASE_TYPE_COLORS[leaseType] || { color: '#374151', bg: '#f3f4f6' };
              const commType = COMMERCIAL_TYPES.find(ct => ct.key === p.commercial_type);
              return (
                <div key={p.id}
                  style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <Link href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ height: 210, background: 'linear-gradient(135deg, #1e293b, #0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 40 }}>{(commType as any)?.icon || '🏢'}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                            {lang === 'EN' ? commType?.labelEn : commType?.labelAm}
                          </div>
                        </div>
                      )}
                      {/* Lease type badge */}
                      <div style={{ position: 'absolute', top: 12, left: 12, background: leaseColor.bg, color: leaseColor.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                        {lang === 'EN' ? leaseLabel.en : leaseLabel.am}
                      </div>
                      {/* Property type badge */}
                      <div style={{ position: 'absolute', top: 12, right: 44, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                        {(commType as any)?.icon} {lang === 'EN' ? commType?.labelEn : commType?.labelAm}
                      </div>
                      <button onClick={e => { e.preventDefault(); toggleFav(p.id); }}
                        style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <Heart size={16} fill={isFav ? '#E8431A' : 'none'} color={isFav ? '#E8431A' : '#6b7280'} />
                      </button>
                    </div>
                  </Link>
                  <Link href={`/properties/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '18px 20px 20px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: p.price_negotiable ? '#92400e' : '#006AFF', marginBottom: 6 }}>
                      {p.price_negotiable ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 20 }}>
                          {lang === 'EN' ? 'Price on Negotiation' : 'ዋጋ በድርድር'}
                        </span>
                      ) : (
                        <>
                          {formatPrice(p.price, p.currency)}
                          {leaseType === 'monthly_rent' && <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{lang === 'EN' ? '/mo' : '/ወር'}</span>}
                          {leaseType === 'annual_lease' && <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{lang === 'EN' ? '/yr' : '/ዓ'}</span>}
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E8431A', fontSize: 13, marginBottom: 14 }}>
                      <MapPin size={13} />{p.location || p.subcity || 'Ethiopia'}
                    </div>
                    <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280', flexWrap: 'wrap' as const }}>
                      {p.area > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Maximize2 size={14} />{p.area} m²
                        </span>
                      )}
                      {p.commercial_details?.ceiling_height_m && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          ↕ {p.commercial_details.ceiling_height_m}m {lang === 'EN' ? 'ceiling' : 'ጣሪያ'}
                        </span>
                      )}
                      {p.commercial_details?.parking_spaces > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          🅿 {p.commercial_details.parking_spaces} {lang === 'EN' ? 'parking' : 'ፓርኪንግ'}
                        </span>
                      )}
                      {p.commercial_details?.has_fiber_internet && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669' }}>
                          ✓ {lang === 'EN' ? 'Fiber' : 'ፋይበር'}
                        </span>
                      )}
                      {p.commercial_details?.has_backup_generator && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706' }}>
                          ✓ {lang === 'EN' ? 'Generator' : 'ጀነሬተር'}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA to list */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '64px 24px', textAlign: 'center' as const }}>
        <Building2 size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 12 }}>
          {lang === 'EN' ? 'Have a Commercial Space?' : 'የንግድ ቦታ አለዎት?'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          {lang === 'EN'
            ? 'List your office, retail space, warehouse or any commercial property on ጎጆ and reach thousands of verified businesses.'
            : 'ቢሮዎን፣ መደብርዎን፣ መጋዘንዎን ወይም ሌላ የንግድ ቤትዎን በጎጆ ላይ ዘርዝሩ።'}
        </p>
        <Link href="/owner/commercial/new"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#006AFF', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          {lang === 'EN' ? 'List Commercial Property' : 'የንግድ ቤት ዘርዝር'} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

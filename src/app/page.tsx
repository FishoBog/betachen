'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, MapPin, BedDouble, Bath, Maximize2, Heart, ArrowRight, TrendingUp, Shield, Clock, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { Navbar } from '@/components/layout/Navbar';

type Property = {
  id: string; title: string; type: string; price: number;
  bedrooms: number; bathrooms: number; area: number;
  location: string; subcity: string; images: string[]; status: string;
};

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  sale: { color: '#1d4ed8', bg: '#dbeafe' },
  long_rent: { color: '#065f46', bg: '#d1fae5' },
  short_rent: { color: '#92400e', bg: '#fef3c7' },
};

function formatPrice(price: number) {
  if (price >= 1000000) return `ETB ${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `ETB ${(price / 1000).toFixed(0)}K`;
  return `ETB ${price.toLocaleString()}`;
}

const GOJO_IMAGE = 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/Gojo-bete.jpg';

const SUBCITIES = [
  'ቦሌ / Bole', 'ቂርቆስ / Kirkos', 'የካ / Yeka', 'ንፋስ ስልክ / Nifas Silk',
  'አቃቂ / Akaki', 'ሊደታ / Lideta', 'ጉለሌ / Gulele', 'ቆልፈ / Kolfe',
  'አራዳ / Arada', 'አዲስ ከተማ / Addis Ketema', 'ለሚ ኩራ / Lemi Kura',
];

export default function HomePage() {
  const { t } = useLang();
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('any');
  const [subcity, setSubcity] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('properties').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false); });
  }, []);

  const filtered = properties.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    if (minPrice && p.price < parseFloat(minPrice)) return false;
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;
    if (bedrooms !== 'any' && p.bedrooms !== parseInt(bedrooms)) return false;
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
    subcity,
    sortBy !== 'newest' ? sortBy : '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setMinPrice(''); setMaxPrice('');
    setBedrooms('any'); setSubcity('');
    setSortBy('newest'); setSearch('');
    setTypeFilter('all');
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box' as const, background: 'white',
  };

  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.5px' };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ padding: '100px 24px 110px', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: 540, backgroundImage: 'url(https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/hero-addis.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(0,50,140,0.55) 0%, rgba(0,70,180,0.42) 40%, rgba(0,30,100,0.65) 100%)' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,67,26,0.92)', borderRadius: 20, padding: '8px 22px', marginBottom: 28 }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '1px' }}>🇪🇹 {t.badge}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 58px)', fontWeight: 900, color: 'white', lineHeight: 1.08, marginBottom: 18, letterSpacing: '-2px' }}>
            {t.heroTitle1}<br /><span style={{ color: '#FF6B35' }}>{t.heroTitle2}</span>
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

      {/* Filter bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
            {[['all', t.allProps], ['sale', t.forSale], ['long_rent', t.forRent], ['short_rent', t.shortStay]].map(([val, label]) => (
              <button key={val} onClick={() => setTypeFilter(val)} style={{ padding: '8px 18px', borderRadius: 25, border: `2px solid ${typeFilter === val ? '#006AFF' : '#e5e7eb'}`, background: typeFilter === val ? '#006AFF' : 'white', color: typeFilter === val ? 'white' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{label}</button>
            ))}

            <button onClick={() => setShowFilters(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 25, border: `2px solid ${showFilters || activeFilterCount > 0 ? '#E8431A' : '#e5e7eb'}`, background: showFilters || activeFilterCount > 0 ? '#fef2ee' : 'white', color: showFilters || activeFilterCount > 0 ? '#E8431A' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <SlidersHorizontal size={14} />
              Filters {activeFilterCount > 0 && <span style={{ background: '#E8431A', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{activeFilterCount}</span>}
            </button>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 25, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
                <X size={13} /> Clear all
              </button>
            )}

            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              {loading ? t.loading : `${filtered.length} ${t.propsFound}`}
            </span>
          </div>

          {/* Expanded filters panel */}
          {showFilters && (
            <div style={{ marginTop: 16, padding: '20px 24px', background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>

                {/* Price range */}
                <div>
                  <label style={labelStyle}>Min Price (ETB)</label>
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="e.g. 500000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Max Price (ETB)</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="e.g. 5000000" style={inputStyle} />
                </div>

                {/* Bedrooms */}
                <div>
                  <label style={labelStyle}>Bedrooms</label>
                  <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} style={inputStyle}>
                    <option value="any">Any</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                </div>

                {/* Subcity */}
                <div>
                  <label style={labelStyle}>Subcity / Location</label>
                  <select value={subcity} onChange={e => setSubcity(e.target.value)} style={inputStyle}>
                    <option value="">Any location</option>
                    {SUBCITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label style={labelStyle}>Sort By</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active filter tags */}
              {activeFilterCount > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 16 }}>
                  {minPrice && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Min: ETB {parseInt(minPrice).toLocaleString()} <button onClick={() => setMinPrice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {maxPrice && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Max: ETB {parseInt(maxPrice).toLocaleString()} <button onClick={() => setMaxPrice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {bedrooms !== 'any' && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{bedrooms} bed <button onClick={() => setBedrooms('any')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {subcity && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{subcity} <button onClick={() => setSubcity('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
                  {sortBy !== 'newest' && <span style={{ padding: '4px 12px', background: '#fef2ee', color: '#E8431A', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sortBy === 'price_asc' ? 'Price ↑' : 'Price ↓'} <button onClick={() => setSortBy('newest')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8431A', marginLeft: 4 }}>×</button></span>}
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{t.loading}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 120, height: 100, borderRadius: 16, overflow: 'hidden', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
              <img src={GOJO_IMAGE} alt="ጎጆ" style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{activeFilterCount > 0 ? 'No properties match your filters' : t.noProps}</div>
            <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 28 }}>{activeFilterCount > 0 ? 'Try adjusting your filters' : t.noPropsDesc}</div>
            {activeFilterCount > 0 ? (
              <button onClick={clearFilters} style={{ padding: '12px 28px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>Clear Filters</button>
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
                  <Link href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: 80, height: 70, borderRadius: 8, overflow: 'hidden', margin: '0 auto', opacity: 0.7 }}>
                            <img src={GOJO_IMAGE} alt="ጎጆ" style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'top' }} />
                          </div>
                          <div style={{ fontSize: 12, marginTop: 8, color: '#9ca3af' }}>{t.noPhoto}</div>
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
                  <Link href={`/property/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '18px 20px 20px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#006AFF', marginBottom: 4 }}>
                      {formatPrice(p.price)}
                      {p.type === 'long_rent' && <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{t.perMonth}</span>}
                      {p.type === 'short_rent' && <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{t.perNight}</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E8431A', fontSize: 13, marginBottom: 14 }}>
                      <MapPin size={13} />{p.location || p.subcity || 'Ethiopia'}
                    </div>
                    <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280' }}>
                      {p.bedrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BedDouble size={14} />{p.bedrooms} {t.bd}</span>}
                      {p.bathrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={14} />{p.bathrooms} {t.ba}</span>}
                      {p.area && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Maximize2 size={14} />{p.area} m²</span>}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Diaspora Section */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '72px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8431A', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                <span style={{ fontSize: 16 }}>🌍</span>
                <span style={{ color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.5px' }}>DIASPORA INVESTMENT HUB</span>
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
                Invest in Ethiopia<br /><span style={{ color: '#FF6B35' }}>From Anywhere</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
                Browse verified properties with USD pricing, schedule video call tours, and manage your investment remotely.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
                {[
                  { icon: '💵', title: 'USD Pricing', desc: 'All prices in USD & ETB' },
                  { icon: '📹', title: 'Video Tours', desc: 'Virtual property walkthroughs' },
                  { icon: '📄', title: 'Online Contracts', desc: 'Sign agreements digitally' },
                  { icon: '🛡️', title: 'Managed Rental', desc: 'We handle everything for you' },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/diaspora" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                🌍 Explore Diaspora Hub <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { number: '1,200+', label: 'Properties Available', icon: '🏠' },
                { number: 'ETB 130', label: 'Per 1 USD (approx)', icon: '💱' },
                { number: '48hrs', label: 'Average Response Time', icon: '⚡' },
                { number: '100%', label: 'Secure Transactions', icon: '🔒' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 4 }}>{stat.number}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{stat.label}</div>
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
              <div key={title} style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', textAlign: 'left' }}>
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
      <div style={{ background: '#006AFF', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>{t.ctaTitle}</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 32 }}>{t.ctaSub}</p>
        <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          {t.ctaBtn} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

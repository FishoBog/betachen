'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, MapPin, Home, BedDouble, Bath, Maximize2, Heart, ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';
import { useLang } from '@/context/LangContext';

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

export default function HomePage() {
  const { t } = useLang();
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('properties').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false); });
  }, []);

  const filtered = properties.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleFav = (id: string) => setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const typeLabels: Record<string, string> = {
    sale: t.forSale, long_rent: t.forRent, short_rent: t.shortStay
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #006AFF 0%, #0047CC 60%, #003DA5 100%)', padding: '80px 24px 88px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8431A', borderRadius: 20, padding: '8px 20px', marginBottom: 28 }}>
            <span style={{ fontSize: 16 }}>🇪🇹</span>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>{t.badge}</span>
          </div>

          <h1 style={{ fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1.08, marginBottom: 18, letterSpacing: '-2px' }}>
            {t.heroTitle1}<br />
            <span style={{ color: '#FF6B35' }}>{t.heroTitle2}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 44, lineHeight: 1.7 }}>{t.heroSub}</p>

          {/* Search */}
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

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginTop: 48 }}>
            {[['1,200+', t.statsProps], ['20+', t.statsCities], ['500+', t.statsOwners]].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{num}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          {[['all', t.allProps], ['sale', t.forSale], ['long_rent', t.forRent], ['short_rent', t.shortStay]].map(([val, label]) => (
            <button key={val} onClick={() => setTypeFilter(val)} style={{
              padding: '8px 20px', borderRadius: 25,
              border: `2px solid ${typeFilter === val ? '#006AFF' : '#e5e7eb'}`,
              background: typeFilter === val ? '#006AFF' : 'white',
              color: typeFilter === val ? 'white' : '#374151',
              fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>{label}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
            {loading ? t.loading : `${filtered.length} ${t.propsFound}`}
          </span>
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
            <div style={{ fontSize: 64, marginBottom: 20 }}>🏠</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{t.noProps}</div>
            <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 28 }}>{t.noPropsDesc}</div>
            <Link href="/owner/listings/new" style={{ padding: '12px 28px', background: '#E8431A', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {t.postListing} <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map(p => {
              const tc = TYPE_COLORS[p.type] || TYPE_COLORS.sale;
              const isFav = favorites.includes(p.id);
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <Link href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#93c5fd' }}>
                          <Home size={48} strokeWidth={1} />
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

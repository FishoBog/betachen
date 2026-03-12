'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, MapPin, Home, BedDouble, Bath, Maximize2, Heart, ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';

type Property = {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  subcity: string;
  images: string[];
  status: string;
};

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  sale: { label: 'For Sale', color: '#1d4ed8', bg: '#dbeafe' },
  long_rent: { label: 'For Rent', color: '#065f46', bg: '#d1fae5' },
  short_rent: { label: 'Short Stay', color: '#92400e', bg: '#fef3c7' },
};

function formatPrice(price: number) {
  if (price >= 1000000) return `ETB ${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `ETB ${(price / 1000).toFixed(0)}K`;
  return `ETB ${price.toLocaleString()}`;
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('properties').select('*').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false); });
  }, []);

  const filtered = properties.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleFav = (id: string) => setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #006AFF 0%, #0047CC 60%, #003DA5 100%)',
        padding: '80px 24px 88px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dot pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>

          {/* Country badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 20, padding: '6px 18px', marginBottom: 28
          }}>
            <span style={{ fontSize: 16 }}>🇪🇹</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, letterSpacing: '0.3px' }}>
              Ethiopia's #1 Real Estate Platform
            </span>
          </div>

          <h1 style={{
            fontSize: 56,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.08,
            marginBottom: 18,
            letterSpacing: '-2px',
            textShadow: 'none'
          }}>
            Find Your Perfect<br />
            <span style={{ color: '#FF6B35' }}>Home in Ethiopia</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 18,
            marginBottom: 44,
            lineHeight: 1.7,
            fontWeight: 400
          }}>
            Search properties for sale, rent, and short stay<br />
            across Addis Ababa and all major Ethiopian cities
          </p>

          {/* Search box */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 8,
            display: 'flex',
            gap: 8,
            maxWidth: 620,
            margin: '0 auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px' }}>
              <Search size={18} color="#9ca3af" strokeWidth={2} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="City, neighborhood, or property type..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#111827', background: 'transparent', fontFamily: 'inherit' }}
              />
            </div>
            <button style={{
              padding: '12px 32px',
              background: '#E8431A',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
              letterSpacing: '0.2px'
            }}>
              Search
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginTop: 48 }}>
            {[['1,200+', 'Properties'], ['20+', 'Cities'], ['500+', 'Owners']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{num}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          {[['all', 'All Properties'], ['sale', 'For Sale'], ['long_rent', 'For Rent'], ['short_rent', 'Short Stay']].map(([val, label]) => (
            <button key={val} onClick={() => setTypeFilter(val)} style={{
              padding: '8px 20px', borderRadius: 25,
              border: `2px solid ${typeFilter === val ? '#006AFF' : '#e5e7eb'}`,
              background: typeFilter === val ? '#006AFF' : 'white',
              color: typeFilter === val ? 'white' : '#374151',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}>{label}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
            {loading ? 'Loading...' : `${filtered.length} properties found`}
          </span>
        </div>
      </div>

      {/* Property Grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Loading properties...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🏠</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No properties yet</div>
            <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 28 }}>Be the first to post a property on ጎጆ</div>
            <Link href="/owner/listings/new" style={{ padding: '12px 28px', background: '#E8431A', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Post a Listing <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map(p => {
              const tc = TYPE_LABELS[p.type] || TYPE_LABELS.sale;
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
                          <div style={{ fontSize: 12, marginTop: 8, color: '#9ca3af' }}>No photo yet</div>
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 12, left: 12, background: tc.bg, color: tc.color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                        {tc.label}
                      </div>
                      <button onClick={e => { e.preventDefault(); toggleFav(p.id); }} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <Heart size={16} fill={isFav ? '#E8431A' : 'none'} color={isFav ? '#E8431A' : '#6b7280'} />
                      </button>
                    </div>
                  </Link>
                  <Link href={`/property/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '18px 20px 20px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#006AFF', marginBottom: 4 }}>
                      {formatPrice(p.price)}
                      {p.type === 'long_rent' && <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>/mo</span>}
                      {p.type === 'short_rent' && <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>/night</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E8431A', fontSize: 13, marginBottom: 14 }}>
                      <MapPin size={13} />
                      {p.location || p.subcity || 'Ethiopia'}
                    </div>
                    <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280' }}>
                      {p.bedrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BedDouble size={14} />{p.bedrooms} bd</span>}
                      {p.bathrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={14} />{p.bathrooms} ba</span>}
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
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 12 }}>Why ጎጆ?</h2>
          <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 48 }}>Ethiopia's most trusted real estate platform</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {[
              { icon: Shield, title: 'Verified Listings', desc: 'All properties are reviewed before going live' },
              { icon: TrendingUp, title: 'Market Insights', desc: 'Track prices and trends across all cities' },
              { icon: Clock, title: 'Fast & Easy', desc: 'Post your property in under 5 minutes' },
              { icon: MapPin, title: 'Nationwide Coverage', desc: 'Properties across all major Ethiopian cities' },
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
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>Ready to list your property?</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 32 }}>Join thousands of property owners across Ethiopia</p>
        <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          Post a Free Listing <ArrowRight size={18} />
        </Link>
      </div>

    </div>
  );
}

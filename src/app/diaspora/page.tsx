'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Globe, Video, Shield, TrendingUp, MapPin, BedDouble, Bath, Maximize2, Heart, Phone, ArrowRight } from 'lucide-react';

type Property = {
  id: string; title: string; type: string; price: number;
  price_usd: number; currency: string; bedrooms: number;
  bathrooms: number; area: number; location: string;
  subcity: string; images: string[]; status: string;
  is_featured: boolean; diaspora_friendly: boolean;
  video_call_available: boolean; managed_property: boolean;
  owner_whatsapp: string;
};

function formatUSD(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatETB(n: number) {
  if (n >= 1000000) return `ETB ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `ETB ${(n / 1000).toFixed(0)}K`;
  return `ETB ${n.toLocaleString()}`;
}

const USD_RATE = 130; // ETB per USD — update periodically

export default function DiasporaPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'ETB'>('USD');

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('properties')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false); });
  }, []);

  const filtered = properties.filter(p => {
    if (filter === 'sale') return p.type === 'sale';
    if (filter === 'rent') return p.type === 'long_rent';
    if (filter === 'managed') return p.managed_property;
    if (filter === 'video') return p.video_call_available;
    return true;
  });

  const getPrice = (p: Property) => {
    const etbPrice = p.price || 0;
    const usdPrice = p.price_usd || Math.round(etbPrice / USD_RATE);
    return currency === 'USD' ? formatUSD(usdPrice) : formatETB(etbPrice);
  };

  const toggleFav = (id: string) =>
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '72px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8431A', borderRadius: 20, padding: '8px 20px', marginBottom: 24 }}>
            <Globe size={14} color="white" />
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>
              🌍 DIASPORA INVESTMENT HUB
            </span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1.5px' }}>
            Invest in Ethiopia<br />
            <span style={{ color: '#FF6B35' }}>From Anywhere in the World</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 40, lineHeight: 1.7 }}>
            Browse verified properties with USD pricing, video call tours,<br />
            and managed rental options — all from the comfort of your home abroad.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 40 }}>
            {[
              ['🏠', '1,200+', 'Properties'],
              ['💵', 'USD', 'Pricing Available'],
              ['📹', 'Video', 'Tours Available'],
              ['🔒', 'Verified', 'Owners'],
            ].map(([emoji, num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'white', marginTop: 4 }}>{num}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Currency toggle */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 4, gap: 4 }}>
            {(['USD', 'ETB'] as const).map(c => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: currency === c ? 'white' : 'transparent',
                color: currency === c ? '#111827' : 'rgba(255,255,255,0.8)',
                boxShadow: currency === c ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}>{c === 'USD' ? '🇺🇸 USD' : '🇪🇹 ETB'}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
            Rate: 1 USD ≈ ETB {USD_RATE} (approximate)
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#f9fafb', padding: '48px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 32 }}>
            How Diaspora Investing Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { icon: '🔍', step: '1', title: 'Browse & Save', desc: 'Find properties with USD pricing and video tour options' },
              { icon: '📹', step: '2', title: 'Request Video Tour', desc: 'Schedule a WhatsApp or Zoom call with the owner' },
              { icon: '📄', step: '3', title: 'Sign Contract Online', desc: 'Complete the legal agreement digitally on ጎጆ' },
              { icon: '💳', step: '4', title: 'Pay Securely', desc: 'Pay deposit via international card or bank transfer' },
              { icon: '🏠', step: '5', title: 'Get Managed', desc: 'Opt for managed rental — we handle everything for you' },
            ].map(item => (
              <div key={item.step} style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#006AFF', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{item.step}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          {[
            ['all', 'All Properties'],
            ['sale', '🏠 For Sale'],
            ['rent', '🔑 For Rent'],
            ['video', '📹 Video Tour Available'],
            ['managed', '🛡️ Managed Properties'],
          ].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '8px 18px', borderRadius: 25,
              border: `2px solid ${filter === val ? '#006AFF' : '#e5e7eb'}`,
              background: filter === val ? '#006AFF' : 'white',
              color: filter === val ? 'white' : '#374151',
              fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>{label}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{filtered.length} properties</span>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
              {(['USD', 'ETB'] as const).map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: currency === c ? 'white' : 'transparent', color: currency === c ? '#006AFF' : '#6b7280' }}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Loading properties...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No properties found</div>
            <div style={{ fontSize: 15, color: '#6b7280' }}>Try a different filter</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filtered.map(p => {
              const isFav = favorites.includes(p.id);
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: `2px solid ${p.is_featured ? '#f59e0b' : '#e5e7eb'}`, boxShadow: p.is_featured ? '0 4px 20px rgba(245,158,11,0.15)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = p.is_featured ? '0 4px 20px rgba(245,158,11,0.15)' : '0 1px 4px rgba(0,0,0,0.06)'; }}>

                  {/* Image */}
                  <Link href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ height: 210, background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: 48 }}>🏠</div>
                      )}

                      {/* Badges */}
                      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {p.is_featured && (
                          <div style={{ background: '#f59e0b', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 12, letterSpacing: '0.5px' }}>
                            ⭐ FEATURED
                          </div>
                        )}
                        {p.video_call_available && (
                          <div style={{ background: '#7c3aed', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Video size={10} /> VIDEO TOUR
                          </div>
                        )}
                        {p.managed_property && (
                          <div style={{ background: '#059669', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                            🛡️ MANAGED
                          </div>
                        )}
                      </div>

                      {/* Type badge */}
                      <div style={{ position: 'absolute', top: 12, right: 44, background: p.type === 'sale' ? '#dbeafe' : '#d1fae5', color: p.type === 'sale' ? '#1d4ed8' : '#065f46', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                        {p.type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                      </div>

                      {/* Favorite */}
                      <button onClick={e => { e.preventDefault(); toggleFav(p.id); }}
                        style={{ position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <Heart size={16} fill={isFav ? '#E8431A' : 'none'} color={isFav ? '#E8431A' : '#6b7280'} />
                      </button>
                    </div>
                  </Link>

                  {/* Content */}
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#006AFF', marginBottom: 2 }}>
                      {getPrice(p)}
                      {p.type === 'long_rent' && <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>/mo</span>}
                    </div>
                    {currency === 'USD' && (
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
                        ≈ {formatETB(p.price)} ETB
                      </div>
                    )}
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E8431A', fontSize: 13, marginBottom: 12 }}>
                      <MapPin size={13} />{p.location || p.subcity || 'Ethiopia'}
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                      {p.bedrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><BedDouble size={13} />{p.bedrooms} bd</span>}
                      {p.bathrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Bath size={13} />{p.bathrooms} ba</span>}
                      {p.area && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Maximize2 size={13} />{p.area}m²</span>}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/property/${p.id}`}
                        style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        View Details <ArrowRight size={14} />
                      </Link>
                      {p.owner_whatsapp && (
                        <a href={`https://wa.me/${p.owner_whatsapp.replace(/\D/g, '')}?text=Hi, I found your property on ጎጆ and I'm interested: ${typeof window !== 'undefined' ? window.location.origin : ''}/property/${p.id}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ padding: '10px 14px', borderRadius: 8, background: '#25D366', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Phone size={14} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA for owners */}
      <div style={{ background: '#1a1a2e', padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12 }}>
          Have a property to list for diaspora investors?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 28 }}>
          Enable USD pricing, video tours, and managed rental options to attract international buyers
        </p>
        <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          List Your Property <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

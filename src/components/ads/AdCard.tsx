'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useLang } from '@/context/LangContext';
import { ArrowRight, Megaphone } from 'lucide-react';

type Ad = {
  id: string;
  business_name: string;
  headline: string;
  tagline: string;
  description: string;
  logo_url: string;
  banner_url: string;
  cta_text: string;
  cta_url: string;
  category: string;
  package: string;
};

type AdCardProps = {
  placement: 'homepage' | 'property_detail' | 'commercial';
  maxAds?: number;
  style?: React.CSSProperties;
};

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  construction: { color: '#c2410c', bg: '#fff7ed' },
  legal: { color: '#1d4ed8', bg: '#dbeafe' },
  moving: { color: '#065f46', bg: '#d1fae5' },
  banking: { color: '#92400e', bg: '#fef3c7' },
  interior: { color: '#9d174d', bg: '#fce7f3' },
  insurance: { color: '#5b21b6', bg: '#ede9fe' },
  hotel: { color: '#047857', bg: '#ecfdf5' },
  property_management: { color: '#15803d', bg: '#f0fdf4' },
  general: { color: '#374151', bg: '#f3f4f6' },
};

export function AdCard({ placement, maxAds = 3, style }: AdCardProps) {
  const { lang } = useLang();
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('advertisements')
      .select('*')
      .eq('status', 'active')
      .eq('payment_status', 'paid')
      .contains('placement', [placement])
      .gt('expires_at', new Date().toISOString())
      .order('package', { ascending: false })
      .limit(maxAds)
      .then(({ data }) => {
        if (data) setAds(data);
        // Track views
        data?.forEach(async (ad) => {
          await supabase.from('advertisements').update({ views: (ad.views || 0) + 1 }).eq('id', ad.id);
        });
      });
  }, [placement, maxAds]);

  if (ads.length === 0) return null;

  const handleClick = async (ad: Ad) => {
    const supabase = createBrowserClient();
    await supabase.from('advertisements').update({ clicks: (ad as any).clicks + 1 }).eq('id', ad.id);
    if (ad.cta_url) window.open(ad.cta_url, '_blank');
  };

  return (
    <div style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Megaphone size={13} color="#9ca3af" />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
          {lang === 'EN' ? 'Sponsored' : 'ማስታወቂያ'}
        </span>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {ads.map(ad => {
          const colors = CATEGORY_COLORS[ad.category] || CATEGORY_COLORS.general;
          return (
            <div key={ad.id}
              style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {/* Banner */}
              {ad.banner_url ? (
                <img src={ad.banner_url} alt={ad.business_name}
                  style={{ width: '100%', height: 120, objectFit: 'cover' }} />
              ) : (
                <div style={{ height: 80, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ad.logo_url ? (
                    <img src={ad.logo_url} alt={ad.business_name} style={{ height: 48, objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 17, fontWeight: 800, color: colors.color }}>{ad.business_name}</span>
                  )}
                </div>
              )}
              <div style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{ad.headline}</div>
                {ad.tagline && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{ad.tagline}</div>}
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 14 }}>{ad.description}</div>
                <button onClick={() => handleClick(ad)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, background: colors.color, color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {ad.cta_text || (lang === 'EN' ? 'Contact Us' : 'ያነጋግሩን')} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
        <div style={{ textAlign: 'center' as const }}>
          <a href="/advertise" style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'none' }}>
            {lang === 'EN' ? 'Advertise here' : 'እዚህ ያስተዋውቁ'}
          </a>
        </div>
      </div>
    </div>
  );
}

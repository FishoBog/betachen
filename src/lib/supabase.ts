import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyInfo } from '@/components/property/PropertyInfo';
import { ContactOwnerCard } from '@/components/property/ContactOwnerCard';
import { PropertyReviews } from '@/components/reviews/PropertyReviews';
import { ViewTracker } from '@/components/property/ViewTracker';
import { ListingActions } from '@/components/property/ListingActions';
import { typeLabel } from '@/lib/utils';
import type { Property } from '@/types';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export default async function PropertyDetailPage({ params: paramsPromise }: Props) {
  const { id } = await paramsPromise;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: property } = await supabase
    .from('properties')
    .select('*, property_images(*), profiles(*)')
    .eq('id', id)
    .single();

  if (!property) notFound();

  const typeColors: Record<string, { bg: string; color: string }> = {
    sale: { bg: '#dbeafe', color: '#1d4ed8' },
    long_rent: { bg: '#d1fae5', color: '#065f46' },
    short_rent: { bg: '#fef3c7', color: '#92400e' },
  };
  const tc = typeColors[property.type] ?? typeColors.sale;

  const { data: similarProperties } = await supabase
    .from('properties')
    .select('id, title, price, currency, type, location, bedrooms, property_images(*)')
    .eq('status', 'active')
    .eq('type', property.type)
    .neq('id', id)
    .limit(3);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <ViewTracker propertyId={id} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 20, flexWrap: 'wrap' as const }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={14} />
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Properties</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#111827', fontWeight: 500 }}>{property.title}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 24, background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' as const }}>
                <span style={{ background: tc.bg, color: tc.color, fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                  {typeLabel(property.type)}
                </span>
                {property.status === 'active' && (
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
                    ✓ Active Listing
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: '#111827', marginBottom: 8, lineHeight: 1.2 }}>{property.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14 }}>
                <MapPin size={15} color="#E8431A" />
                <span>{property.location || property.subcity || 'Ethiopia'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              {(property as any).price_negotiable ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '8px 16px' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>🤝 Price on Negotiation</span>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#006AFF' }}>
                    {property.price?.toLocaleString()} {property.currency}
                  </div>
                  {property.type !== 'sale' && (
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>per {property.type === 'short_rent' ? 'night' : 'month'}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'grid', gap: 24 }}>
            <PropertyGallery images={property.property_images ?? []} />
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb' }}>
              <PropertyInfo property={property as Property} />
            </div>
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb' }}>
              <PropertyReviews propertyId={id} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'grid', gap: 16 }}>
            <ContactOwnerCard property={property as Property} />
            <ListingActions propertyId={id} status={property.status} />
          </div>
        </div>

        {/* Similar properties */}
        {similarProperties && similarProperties.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Similar Properties</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {similarProperties.map((p: any) => (
                <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none', background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ height: 180, overflow: 'hidden', background: '#f3f4f6' }}>
                    {p.property_images?.[0] ? (
                      <img src={p.property_images[0].image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 40 }}>🏠</div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#006AFF', marginBottom: 4 }}>{p.price?.toLocaleString()} {p.currency}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 13 }}>
                      <MapPin size={13} color="#E8431A" />{p.location}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
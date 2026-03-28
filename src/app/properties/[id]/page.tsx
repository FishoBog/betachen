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

function BlurredMap({ lat, lng }: { lat: number; lng: number }) {
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${lng},${lat}&zoom=15&apiKey=bca9eb259d3744f38c08c0b0722cadee`;
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>📍 Approximate Location</div>
        <div style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '4px 10px', borderRadius: 20 }}>~500m radius shown</div>
      </div>
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src={mapUrl}
          alt="Property location map"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(4px)', transform: 'scale(1.1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '3px solid #E8431A', background: 'rgba(232,67,26,0.15)', boxShadow: '0 0 0 8px rgba(232,67,26,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 28 }}>🏠</div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', padding: '20px 16px 12px' }}>
          <div style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>
            📍 Exact address shared privately by owner after contact
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function PropertyDetailPage({ params: paramsPromise }: Props) {
  const { id } = await paramsPromise;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property || error) notFound();

  const { data: propertyImages } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', id);

  const { data: similarProperties } = await supabase
    .from('properties')
    .select('id, title, price, currency, type, location, bedrooms, price_negotiable')
    .eq('status', 'active')
    .eq('type', property.type)
    .neq('id', id)
    .limit(3);

  const typeColors: Record<string, { bg: string; color: string }> = {
    sale:       { bg: '#dbeafe', color: '#1d4ed8' },
    long_rent:  { bg: '#d1fae5', color: '#065f46' },
    short_rent: { bg: '#fef3c7', color: '#92400e' },
  };
  const tc = typeColors[property.type] ?? typeColors.sale;
  const propertyWithImages = JSON.parse(JSON.stringify({ ...property, property_images: propertyImages ?? [] }));
  const isNegotiable = property.price_negotiable;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <ViewTracker propertyId={id} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 16, flexWrap: 'wrap' as const }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={13} />
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Properties</Link>
          <ChevronRight size={13} />
          <span style={{ color: '#111827', fontWeight: 600 }}>{property.title}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 20, background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' as const }}>
                <span style={{ background: tc.bg, color: tc.color, fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                  {typeLabel(property.type)}
                </span>
                {property.status === 'active' && (
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
                    ✓ Active
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 900, color: '#111827', marginBottom: 8, lineHeight: 1.2 }}>
                {property.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14 }}>
                <MapPin size={14} color="#E8431A" />
                <span>{property.location || property.subcity || 'Ethiopia'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
              {isNegotiable ? (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 18px' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>🤝 Price on Negotiation</div>
                  <div style={{ fontSize: 12, color: '#78350f', marginTop: 2 }}>Contact owner to discuss</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: '#006AFF', lineHeight: 1 }}>
                    {property.price?.toLocaleString()} {property.currency}
                  </div>
                  {property.type !== 'sale' && (
                    <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
                      per {property.type === 'short_rent' ? 'night' : 'month'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 20, alignItems: 'start' }} className="property-grid">

          {/* Left column */}
          <div style={{ display: 'grid', gap: 20 }}>

            {/* Gallery */}
            {propertyImages && propertyImages.length > 0 ? (
              <PropertyGallery images={propertyWithImages.property_images} />
            ) : (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 24px', textAlign: 'center' as const }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No photos yet</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>The owner has not uploaded photos for this listing</div>
              </div>
            )}

            {/* Blurred map */}
            {property.latitude && property.longitude && (
              <BlurredMap lat={property.latitude} lng={property.longitude} />
            )}

            {/* Property info */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb' }}>
              <PropertyInfo property={propertyWithImages as unknown as Property} />
            </div>

            {/* Reviews */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb' }}>
              <PropertyReviews propertyId={id} />
            </div>
          </div>

          {/* Right column */}
          <div className="property-sidebar" style={{ display: 'grid', gap: 16 }}>
            <ContactOwnerCard property={propertyWithImages as unknown as Property} />
            <ListingActions propertyId={id} status={property.status} />

            {/* Location privacy note */}
            <div style={{ background: '#f0f6ff', borderRadius: 14, padding: '14px 16px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>📍 Location Privacy</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                Approximate area shown publicly. Exact address shared privately by the owner during direct conversation.
              </div>
            </div>

            {/* Quick summary */}
            <div style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Quick Summary</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {property.bedrooms ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Bedrooms</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{property.bedrooms}</span>
                  </div>
                ) : null}
                {property.bathrooms ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Bathrooms</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{property.bathrooms}</span>
                  </div>
                ) : null}
                {property.area_sqm ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Area</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{property.area_sqm} m²</span>
                  </div>
                ) : null}
                {(property as any).road_type ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Road</span>
                    <span style={{ fontWeight: 700, color: '#111827', textTransform: 'capitalize' as const }}>{(property as any).road_type}</span>
                  </div>
                ) : null}
                {(property as any).electricity_reliability ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Electricity</span>
                    <span style={{ fontWeight: 700, color: (property as any).electricity_reliability === '24hr' ? '#059669' : '#d97706' }}>
                      {(property as any).electricity_reliability === '24hr' ? '24hrs ✓' : 'Cuts'}
                    </span>
                  </div>
                ) : null}
                {(property as any).ground_water ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Ground Water</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>✓ Yes</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Similar properties */}
        {similarProperties && similarProperties.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>Similar Properties</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {similarProperties.map((p: any) => (
                <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none', background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', display: 'block' }}>
                  <div style={{ height: 160, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏠</div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: p.price_negotiable ? '#92400e' : '#006AFF', marginBottom: 4 }}>
                      {p.price_negotiable ? '🤝 Negotiable' : `${p.price?.toLocaleString()} ${p.currency}`}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 12 }}>
                      <MapPin size={12} color="#E8431A" />{p.location}
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

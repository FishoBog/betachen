import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyInfo } from '@/components/property/PropertyInfo';
import { ContactOwnerCard } from '@/components/property/ContactOwnerCard';
import { PropertyReviews } from '@/components/reviews/PropertyReviews';
import { ViewTracker } from '@/components/property/ViewTracker';
import { ListingActions } from '@/components/property/ListingActions';
import { AdCard } from '@/components/ads/AdCard';
import { typeLabel } from '@/lib/utils';
import type { Property } from '@/types';
import Link from 'next/link';
import { ChevronRight, MapPin, Bed, Bath, Maximize } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

function BlurredMap({ lat, lng }: { lat: number; lng: number }) {
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=600&center=lonlat:${lng},${lat}&zoom=15&apiKey=bca9eb259d3744f38c08c0b0722cadee`;
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={16} color="#E8431A" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Approximate Location</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Exact address shared after contact</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>~500m radius</div>
      </div>
      <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        <img src={mapUrl} alt="Property location map" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(0.5px)', transform: 'scale(1.02)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(232,67,26,0.4)', background: 'rgba(232,67,26,0.08)' }} />
              <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: '2px solid rgba(232,67,26,0.6)', background: 'rgba(232,67,26,0.12)' }} />
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <MapPin size={20} color="#E8431A" />
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '6px 16px' }}>
              <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>Exact location is private</span>
            </div>
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
    .select('id, title, price, currency, type, location, bedrooms, bathrooms, area_sqm, price_negotiable, images')
    .eq('status', 'active')
    .eq('type', property.type)
    .neq('id', id)
    .limit(3);

  const typeConfig: Record<string, { bg: string; color: string; label: string }> = {
    sale:       { bg: '#dbeafe', color: '#1d4ed8', label: 'For Sale' },
    long_rent:  { bg: '#d1fae5', color: '#065f46', label: 'For Rent' },
    short_rent: { bg: '#fef3c7', color: '#92400e', label: 'Short Stay' },
  };
  const tc = typeConfig[property.type] ?? typeConfig.sale;
  const propertyWithImages = JSON.parse(JSON.stringify({ ...property, property_images: propertyImages ?? [] }));
  const isNegotiable = property.price_negotiable;
  const p = property as any;

  // Format price nicely
  const formatPrice = (price: number, currency: string) => {
    if (price >= 1000000) return `${currency} ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${currency} ${(price / 1000).toFixed(0)}K`;
    return `${currency} ${price.toLocaleString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <ViewTracker propertyId={id} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af', marginBottom: 16, flexWrap: 'wrap' as const }}>
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Properties</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#374151', fontWeight: 600 }}>{property.title}</span>
        </div>

        {/* ── PROPERTY HEADER (Zillow style) ── */}
        <div style={{ marginBottom: 20, background: 'white', borderRadius: 16, padding: '24px 28px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          {/* Top row: type badge + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' as const }}>
            <span style={{ background: tc.bg, color: tc.color, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }}>
              {tc.label}
            </span>
            {property.status === 'active' && (
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 4, letterSpacing: '0.5px' }}>
                ACTIVE
              </span>
            )}
            {p.construction_stage && p.construction_stage !== 'completed' && (
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 4 }}>
                {p.construction_stage === 'land_only' ? 'LAND ONLY' : p.construction_stage === 'under_construction' ? 'UNDER CONSTRUCTION' : p.construction_stage.replace(/_/g, ' ').toUpperCase()}
              </span>
            )}
            {p.bank_loan_eligible && (
              <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 4 }}>
                BANK LOAN ELIGIBLE
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ marginBottom: 12 }}>
            {isNegotiable ? (
              <div style={{ fontSize: 28, fontWeight: 900, color: '#92400e' }}>Price on Negotiation</div>
            ) : (
              <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                {formatPrice(property.price, property.currency)}
                {property.type !== 'sale' && (
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#9ca3af', marginLeft: 6 }}>
                    /{property.type === 'short_rent' ? 'night' : 'month'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 800, color: '#111827', marginBottom: 8, lineHeight: 1.3 }}>
            {property.title}
          </h1>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
            <MapPin size={14} color="#E8431A" />
            <span>{[p.subcity, p.location, 'Ethiopia'].filter(Boolean).join(', ')}</span>
          </div>

          {/* Key stats bar */}
          <div style={{ display: 'flex', gap: 24, paddingTop: 16, borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' as const }}>
            {property.bedrooms != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bed size={16} color="#6b7280" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{property.bedrooms}</span>
                <span style={{ fontSize: 14, color: '#9ca3af' }}>bed{property.bedrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bath size={16} color="#6b7280" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{property.bathrooms}</span>
                <span style={{ fontSize: 14, color: '#9ca3af' }}>bath{property.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            {property.area_sqm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Maximize size={16} color="#6b7280" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{property.area_sqm}</span>
                <span style={{ fontSize: 14, color: '#9ca3af' }}>m²</span>
              </div>
            )}
            {p.plot_area_sqm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Maximize size={16} color="#6b7280" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{p.plot_area_sqm}</span>
                <span style={{ fontSize: 14, color: '#9ca3af' }}>m² plot</span>
              </div>
            )}
            {p.road_type && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: p.road_type === 'asphalt' ? '#059669' : '#111827' }}>
                  {p.road_type === 'asphalt' ? 'Asphalt Road' : p.road_type === 'cobblestone' ? 'Cobblestone' : 'Dirt Road'}
                </span>
              </div>
            )}
            {p.ground_water && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>Borehole Water</span>
              </div>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start', width: '100%' }} className="property-grid">

          {/* Left column */}
          <div style={{ display: 'grid', gap: 20 }}>

            {/* Gallery */}
            {propertyImages && propertyImages.length > 0 ? (
              <PropertyGallery images={propertyWithImages.property_images} />
            ) : (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '48px 24px', textAlign: 'center' as const }}>
                <MapPin size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No photos yet</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>The owner has not uploaded photos for this listing</div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <BlurredMap lat={property.latitude} lng={property.longitude} />
            )}

            {/* Property info */}
            <div style={{ background: 'white', borderRadius: 16, padding: '28px', border: '1px solid #e5e7eb' }}>
              <PropertyInfo property={propertyWithImages as unknown as Property} />
            </div>

            {/* Reviews */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb' }}>
              <PropertyReviews propertyId={id} />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="property-sidebar" style={{ display: 'grid', gap: 16 }}>
            <ContactOwnerCard property={propertyWithImages as unknown as Property} />
            <ListingActions propertyId={id} status={property.status} ownerId={property.owner_id} />

            {/* Location privacy */}
            <div style={{ background: '#f8faff', borderRadius: 12, padding: '14px 16px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>Location Privacy</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                Approximate area shown publicly. Exact address shared privately by the owner after direct contact.
              </div>
            </div>

            {/* Property summary card */}
            <div style={{ background: 'white', borderRadius: 12, padding: '18px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }}>Property Summary</div>
              <div style={{ display: 'grid', gap: 0 }}>
                {[
                  property.bedrooms != null && { label: 'Bedrooms', value: `${property.bedrooms}` },
                  property.bathrooms != null && { label: 'Bathrooms', value: `${property.bathrooms}` },
                  property.area_sqm && { label: 'Living Area', value: `${property.area_sqm} m²` },
                  p.plot_area_sqm && { label: 'Plot Area', value: `${p.plot_area_sqm} m²` },
                  p.road_type && { label: 'Road', value: p.road_type.charAt(0).toUpperCase() + p.road_type.slice(1) },
                  p.electricity_reliability && { label: 'Electricity', value: p.electricity_reliability === '24hr' ? '24hrs ✓' : 'Has power cuts' },
                  p.ground_water && { label: 'Water', value: 'Borehole ✓' },
                  p.bank_loan_eligible && { label: 'Bank Loan', value: 'Eligible ✓' },
                  p.construction_stage && { label: 'Stage', value: p.construction_stage.replace(/_/g, ' ') },
                ].filter(Boolean).map((item: any) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <AdCard placement="property_detail" maxAds={2} />
          </div>
        </div>

        {/* Similar properties */}
        {similarProperties && similarProperties.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>Similar Properties</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {similarProperties.map((sp: any) => (
                <Link key={sp.id} href={`/properties/${sp.id}`} style={{ textDecoration: 'none', background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', display: 'block', transition: 'box-shadow 0.2s' }}>
                  <div style={{ height: 180, background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', overflow: 'hidden', position: 'relative' }}>
                    {sp.images?.[0] ? (
                      <img src={sp.images[0]} alt={sp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={36} color="#d1d5db" />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <span style={{ background: typeConfig[sp.type]?.bg ?? '#dbeafe', color: typeConfig[sp.type]?.color ?? '#1d4ed8', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase' as const }}>
                        {typeConfig[sp.type]?.label ?? sp.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: sp.price_negotiable ? '#92400e' : '#111827', marginBottom: 4 }}>
                      {sp.price_negotiable ? 'Negotiable' : formatPrice(sp.price, sp.currency)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8, lineHeight: 1.3 }}>{sp.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af' }}>
                      {sp.bedrooms && <span>{sp.bedrooms} bed</span>}
                      {sp.bathrooms && <span>{sp.bathrooms} bath</span>}
                      {sp.area_sqm && <span>{sp.area_sqm} m²</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontSize: 12, marginTop: 6 }}>
                      <MapPin size={11} color="#E8431A" />{sp.location}
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

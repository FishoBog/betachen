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
import { StickyContactBar } from '@/components/property/StickyContactBar';
import { typeLabel } from '@/lib/utils';
import type { Property } from '@/types';
import Link from 'next/link';
import { ChevronRight, MapPin, Bed, Bath, Maximize, Layers } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

// Warm, considered palette shared with the rest of the redesigned surfaces.
const C = {
  ink: '#1a1830', body: '#4b4960', muted: '#8b8a9c',
  line: '#e7e5ee', lineSoft: '#f1f0f6', paper: '#f7f6fb', card: '#ffffff',
  blue: '#006AFF', terracotta: '#E8431A', green: '#059669',
};

function BlurredMap({ lat, lng }: { lat: number; lng: number }) {
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=600&center=lonlat:${lng},${lat}&zoom=15&apiKey=bca9eb259d3744f38c08c0b0722cadee`;
  return (
    <div style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={17} color={C.terracotta} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Approximate Location</div>
            <div style={{ fontSize: 11, color: C.muted }}>Exact address shared after contact</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.body, background: C.lineSoft, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>~500m radius</div>
      </div>
      <div style={{ position: 'relative', height: 360, overflow: 'hidden' }}>
        <img src={mapUrl} alt="Property location map" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(0.5px)', transform: 'scale(1.02)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(232,67,26,0.4)', background: 'rgba(232,67,26,0.08)' }} />
              <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: '2px solid rgba(232,67,26,0.6)', background: 'rgba(232,67,26,0.12)' }} />
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <MapPin size={20} color={C.terracotta} />
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

  // Photos are stored on the property's own `images` column (an array of URL
  // strings) — NOT in the separate `property_images` table (which is unused).
  // Normalize that into the { id, image_url } shape PropertyGallery expects,
  // tolerating either a real array or a JSON-encoded string array.
  const rawImages: any = (property as any).images;
  let imageUrls: string[] = [];
  if (Array.isArray(rawImages)) {
    imageUrls = rawImages.filter((u: any) => typeof u === 'string' && u.length > 0);
  } else if (typeof rawImages === 'string' && rawImages.trim()) {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) imageUrls = parsed.filter((u: any) => typeof u === 'string' && u.length > 0);
      else if (typeof parsed === 'string') imageUrls = [parsed];
    } catch {
      // Not JSON — treat the whole string as a single URL.
      imageUrls = [rawImages];
    }
  }
  const galleryImages = imageUrls.map((url, i) => ({ id: `${id}-${i}`, image_url: url }));

  const isNegotiable = property.price_negotiable;
  const p = property as any;

  const formatPrice = (price: number, currency: string) => {
    if (price >= 1000000) return `${currency} ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${currency} ${(price / 1000).toFixed(0)}K`;
    return `${currency} ${price.toLocaleString()}`;
  };

  // Phone for the optional Call/WhatsApp buttons. The listing form's phone is
  // stored on the `owner_whatsapp` column (see /api/listings/create). Falls back
  // to a couple of alternates just in case, then null (bar shows Message Owner only).
  const ownerPhone: string | null = p.owner_whatsapp ?? p.owner_phone ?? p.phone ?? null;

  const priceLabel = isNegotiable ? 'Negotiable' : formatPrice(property.price, property.currency);
  const priceSub = (!isNegotiable && property.type !== 'sale')
    ? (property.type === 'short_rent' ? 'per night' : 'per month')
    : undefined;

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>
      <Navbar />
      <ViewTracker propertyId={id} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 120px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted, marginBottom: 16, flexWrap: 'wrap' as const }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Properties</Link>
          <ChevronRight size={12} />
          <span style={{ color: C.body, fontWeight: 600 }}>{property.title}</span>
        </div>

        {/* ── HEADER ── big price, stat strip, title, location (pisos hierarchy) */}
        <div style={{ marginBottom: 20, background: C.card, borderRadius: 18, padding: '26px 30px', border: `1px solid ${C.line}`, boxShadow: '0 1px 2px rgba(26,24,48,0.04), 0 8px 24px rgba(26,24,48,0.04)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' as const }}>
            <span style={{ background: tc.bg, color: tc.color, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }}>
              {tc.label}
            </span>
            {property.status === 'active' && (
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6, letterSpacing: '0.5px' }}>
                ACTIVE
              </span>
            )}
            {p.construction_stage && p.construction_stage !== 'completed' && (
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6 }}>
                {p.construction_stage === 'land_only' ? 'LAND ONLY' : p.construction_stage === 'under_construction' ? 'UNDER CONSTRUCTION' : p.construction_stage.replace(/_/g, ' ').toUpperCase()}
              </span>
            )}
            {p.bank_loan_eligible && (
              <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6 }}>
                BANK LOAN ELIGIBLE
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ marginBottom: 10 }}>
            {isNegotiable ? (
              <div style={{ fontSize: 30, fontWeight: 900, color: '#92400e', letterSpacing: '-0.02em' }}>Price on Negotiation</div>
            ) : (
              <div style={{ fontSize: 36, fontWeight: 900, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {formatPrice(property.price, property.currency)}
                {property.type !== 'sale' && (
                  <span style={{ fontSize: 16, fontWeight: 500, color: C.muted, marginLeft: 8 }}>
                    /{property.type === 'short_rent' ? 'night' : 'month'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(19px, 2.5vw, 25px)', fontWeight: 800, color: C.ink, marginBottom: 8, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
            {property.title}
          </h1>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.body, fontSize: 14.5, marginBottom: 18 }}>
            <MapPin size={15} color={C.terracotta} />
            <span>{[p.subcity, p.location, 'Ethiopia'].filter(Boolean).join(', ')}</span>
          </div>

          {/* Stat strip — icon chips */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 18, borderTop: `1px solid ${C.lineSoft}`, flexWrap: 'wrap' as const }}>
            {property.bedrooms != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#eaf2ff', borderRadius: 12, padding: '8px 14px' }}>
                <Bed size={18} color={C.blue} />
                <span><span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{property.bedrooms}</span> <span style={{ fontSize: 13.5, color: C.body }}>bed{property.bedrooms !== 1 ? 's' : ''}</span></span>
              </div>
            )}
            {property.bathrooms != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#e0f7fb', borderRadius: 12, padding: '8px 14px' }}>
                <Bath size={18} color="#0891b2" />
                <span><span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{property.bathrooms}</span> <span style={{ fontSize: 13.5, color: C.body }}>bath{property.bathrooms !== 1 ? 's' : ''}</span></span>
              </div>
            )}
            {property.area_sqm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#f0eafe', borderRadius: 12, padding: '8px 14px' }}>
                <Maximize size={18} color="#7c3aed" />
                <span><span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{property.area_sqm}</span> <span style={{ fontSize: 13.5, color: C.body }}>m²</span></span>
              </div>
            )}
            {p.floor != null && p.floor !== '' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff4e0', borderRadius: 12, padding: '8px 14px' }}>
                <Layers size={18} color="#d97706" />
                <span><span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{p.floor}</span> <span style={{ fontSize: 13.5, color: C.body }}>floor</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Main layout: single column on mobile, 2-col on desktop (see <style>) */}
        <div className="property-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start', width: '100%' }}>

          {/* Left column */}
          <div style={{ display: 'grid', gap: 20 }}>

            {/* Gallery */}
            {galleryImages.length > 0 ? (
              <PropertyGallery images={galleryImages} />
            ) : (
              <div style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.line}`, padding: '48px 24px', textAlign: 'center' as const }}>
                <MapPin size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: C.body, marginBottom: 4 }}>No photos yet</div>
                <div style={{ fontSize: 13, color: C.muted }}>The owner has not uploaded photos for this listing</div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <BlurredMap lat={property.latitude} lng={property.longitude} />
            )}

            {/* Property info (existing component) */}
            <div style={{ background: 'white', borderRadius: 18, padding: '28px', border: `1px solid ${C.line}` }}>
              <PropertyInfo property={propertyWithImages as unknown as Property} />
            </div>

            {/* Reviews */}
            <div style={{ background: 'white', borderRadius: 18, padding: '24px', border: `1px solid ${C.line}` }}>
              <PropertyReviews propertyId={id} />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="property-sidebar" style={{ display: 'grid', gap: 16 }}>
            {/* Anchor target for the sticky bar's "Message Owner" */}
            <div id="contact-owner" style={{ borderRadius: 20 }}>
              <ContactOwnerCard property={propertyWithImages as unknown as Property} />
            </div>
            <ListingActions propertyId={id} status={property.status} ownerId={property.owner_id} />

            {/* Location privacy */}
            <div style={{ background: '#f8faff', borderRadius: 14, padding: '14px 16px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>Location Privacy</div>
              <div style={{ fontSize: 12, color: C.body, lineHeight: 1.6 }}>
                Approximate area shown publicly. Exact address shared privately by the owner after direct contact.
              </div>
            </div>

            {/* Property summary card */}
            <div style={{ background: 'white', borderRadius: 14, padding: '18px', border: `1px solid ${C.line}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 14, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Property Summary</div>
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
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{item.value}</span>
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
            <h2 style={{ fontSize: 21, fontWeight: 800, color: C.ink, marginBottom: 16, letterSpacing: '-0.01em' }}>Similar Properties</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {similarProperties.map((sp: any) => (
                <Link key={sp.id} href={`/properties/${sp.id}`} style={{ textDecoration: 'none', background: 'white', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}`, display: 'block', transition: 'box-shadow 0.2s' }}>
                  <div style={{ height: 180, background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', overflow: 'hidden', position: 'relative' }}>
                    {sp.images?.[0] ? (
                      <img src={sp.images[0]} alt={sp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={36} color="#d1d5db" />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <span style={{ background: typeConfig[sp.type]?.bg ?? '#dbeafe', color: typeConfig[sp.type]?.color ?? '#1d4ed8', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase' as const }}>
                        {typeConfig[sp.type]?.label ?? sp.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: sp.price_negotiable ? '#92400e' : C.ink, marginBottom: 4 }}>
                      {sp.price_negotiable ? 'Negotiable' : formatPrice(sp.price, sp.currency)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.body, marginBottom: 8, lineHeight: 1.3 }}>{sp.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.muted }}>
                      {sp.bedrooms && <span>{sp.bedrooms} bed</span>}
                      {sp.bathrooms && <span>{sp.bathrooms} bath</span>}
                      {sp.area_sqm && <span>{sp.area_sqm} m²</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 12, marginTop: 6 }}>
                      <MapPin size={11} color={C.terracotta} />{sp.location}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sticky bottom contact bar — Message Owner always; Call/WhatsApp when a
          phone exists on the listing. Defers to ContactOwnerCard for messaging. */}
      <StickyContactBar phone={ownerPhone} priceLabel={priceLabel} subLabel={priceSub} />

      {/* Responsive: collapse to single column on mobile (matches the phone
          screenshots), 2-column from 900px up. Scoped class selectors. */}
      <style>{`
        @media (max-width: 900px) {
          .property-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

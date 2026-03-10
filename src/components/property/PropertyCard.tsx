// src/components/property/PropertyCard.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Bath, Maximize2, MapPin, Clock, AlertTriangle, GitCompare, Heart } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { am } from '@/i18n/am';
import { formatPrice, daysUntilExpiry, typeLabel, cn } from '@/lib/utils';
import type { Property } from '@/types';

function addToCompare(id: string) {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem('gojo_compare') ?? '[]');
    if (!saved.includes(id)) {
      const next = [...saved, id].slice(0, 3);
      localStorage.setItem('gojo_compare', JSON.stringify(next));
    }
    window.location.href = '/compare';
  } catch {}
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    sale:       'bg-[#0A2342] text-white',
    long_rent:  'bg-[#00A699] text-white',
    short_rent: 'bg-[#E8431A] text-white',
  };
  return (
    <span className={cn('text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md', styles[type] ?? 'bg-gray-700 text-white')}>
      {typeLabel(type)}
    </span>
  );
}

function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
  const days = daysUntilExpiry(expiresAt);
  if (days === null) return null;
  if (days < 0) return (
    <span className="badge-expired flex items-center gap-1 text-xs px-2.5 py-1 rounded-full">
      ⏰ {am.status.expired}
    </span>
  );
  if (days <= 3) return (
    <span className="badge-expiring flex items-center gap-1 text-xs px-2.5 py-1 rounded-full animate-pulse">
      <AlertTriangle className="w-3 h-3" />
      {days} {am.status.daysLeft}
    </span>
  );
  return null;
}

interface Props { property: Property; showExpiry?: boolean; }

export function PropertyCard({ property, showExpiry = false }: Props) {
  const mainImage = property.property_images?.find(i => i.is_main)?.image_url
    ?? property.property_images?.[0]?.image_url;

  return (
    <Link href={`/property/${property.id}`}
      className="card block group overflow-hidden">

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100" style={{ height: '210px' }}>
        {mainImage ? (
          <Image
            src={mainImage}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🏠</div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Type badge — bottom left */}
        <div className="absolute bottom-3 left-3">
          <TypeBadge type={property.type} />
        </div>

        {/* Actions — top right */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <FavoriteButton propertyId={property.id} size="sm" />
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); addToCompare(property.id); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            title="ያወዳድሩ">
            <GitCompare className="w-3.5 h-3.5 text-gray-600" />
          </button>
          {showExpiry && <ExpiryBadge expiresAt={property.expires_at} />}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">

        {/* Price — Zillow-style prominent */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
              {formatPrice(property.price, property.currency)}
            </span>
            {property.type !== 'sale' && (
              <span className="text-xs text-gray-400 ml-1"
                style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>
                /{property.type === 'short_rent' ? am.property.perNight : am.property.perMonth}
              </span>
            )}
          </div>

          {/* Star rating if present */}
          {(property as any).avg_rating && (
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-sm">★</span>
              <span className="text-xs text-gray-500 font-medium">
                {Number((property as any).avg_rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Specs row — Redfin style */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2.5">
          {property.bedrooms && (
            <span className="flex items-center gap-1 font-medium">
              <BedDouble className="w-4 h-4 text-gray-400" />
              {property.bedrooms} <span className="text-gray-400 font-normal" style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>{am.property.bedroom}</span>
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1 font-medium">
              <Bath className="w-4 h-4 text-gray-400" />
              {property.bathrooms}
            </span>
          )}
          {property.area_sqm && (
            <span className="flex items-center gap-1 font-medium">
              <Maximize2 className="w-4 h-4 text-gray-400" />
              {property.area_sqm} <span className="text-gray-400 font-normal">{am.property.sqm}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1.5"
          style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--coral)' }} />
          <span style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>
            {property.location_name}
          </span>
        </div>
      </div>
    </Link>
  );
}

import { BedDouble, Bath, Maximize2, MapPin, Calendar, Building } from 'lucide-react';
import type { Property } from '@/types';
import { AMENITIES_KEYS } from '@/types';

const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking', wifi: 'WiFi', generator: 'Generator', water_tank: 'Water Tank',
  security: 'Security', cctv: 'CCTV', gym: 'Gym', pool: 'Pool',
  elevator: 'Elevator', furnished: 'Furnished', ac: 'A/C', solar: 'Solar',
};

export function PropertyInfo({ property }: { property: Property }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {property.bedrooms && <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4" />{property.bedrooms} Bedrooms</span>}
        {property.bathrooms && <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" />{property.bathrooms} Bathrooms</span>}
        {property.area_sqm && <span className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4" />{property.area_sqm} sqm</span>}
        {property.floor && <span className="flex items-center gap-1.5"><Building className="w-4 h-4" />Floor {property.floor}</span>}
        {property.year_built && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Built {property.year_built}</span>}
        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{property.location_name}</span>
      </div>
      {property.description && (
        <div>
          <h3 className="font-bold text-lg mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">{property.description}</p>
        </div>
      )}
      {property.amenities?.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map(a => (
              <span key={a} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {AMENITY_LABELS[a] ?? a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

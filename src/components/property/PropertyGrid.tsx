'use client';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { PropertyCard } from './PropertyCard';
import { Loader2 } from 'lucide-react';

export function PropertyGrid() {
  const { properties, loading, total } = usePropertySearch();

  if (loading) return (
    <div className="flex flex-col items-center py-20 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin mb-3" />
      <span>Loading properties...</span>
    </div>
  );

  if (properties.length === 0) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🏚️</div>
      <p className="text-gray-500 text-lg">No properties found</p>
    </div>
  );

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{total} properties found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}

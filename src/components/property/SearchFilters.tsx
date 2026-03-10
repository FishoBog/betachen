'use client';
import { Search, X } from 'lucide-react';
import { usePropertySearch } from '@/hooks/usePropertySearch';

export function SearchFilters() {
  const { filters, updateFilter, resetFilters } = usePropertySearch();
  const hasActive = filters.query || filters.type !== 'all' || filters.location || filters.minPrice || filters.maxPrice || filters.bedrooms;

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          value={filters.query}
          onChange={e => updateFilter('query', e.target.value)}
          placeholder="Search by title, location..."
          className="input-field pl-12"
        />
        {filters.query && (
          <button onClick={() => updateFilter('query', '')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select value={filters.type} onChange={e => updateFilter('type', e.target.value as any)} className="input-field">
          <option value="all">All Types</option>
          <option value="sale">For Sale</option>
          <option value="long_rent">For Rent</option>
          <option value="short_rent">Short Stay</option>
        </select>
        <select value={filters.location} onChange={e => updateFilter('location', e.target.value)} className="input-field">
          <option value="">All Areas</option>
          <option value="Bole">Bole</option>
          <option value="Kirkos">Kirkos</option>
          <option value="Yeka">Yeka</option>
          <option value="Nifas Silk">Nifas Silk</option>
          <option value="Akaki">Akaki</option>
          <option value="Lideta">Lideta</option>
          <option value="Gulele">Gulele</option>
          <option value="Kolfe">Kolfe</option>
          <option value="Arada">Arada</option>
          <option value="Addis Ketema">Addis Ketema</option>
          <option value="Lemi Kura">Lemi Kura</option>
        </select>
        <select value={filters.bedrooms ?? ''} onChange={e => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : null)} className="input-field">
          <option value="">Any Bedrooms</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ beds</option>)}
        </select>
        <input
          type="number"
          value={filters.maxPrice ?? ''}
          onChange={e => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
          placeholder="Max Price"
          className="input-field"
        />
      </div>
      {hasActive && (
        <button onClick={resetFilters} className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline">
          Clear filters
        </button>
      )}
    </div>
  );
}

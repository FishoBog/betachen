'use client';
import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { Property } from '@/types';

export interface Filters {
  query: string;
  type: 'all' | 'sale' | 'long_rent' | 'short_rent';
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
}

const DEFAULT_FILTERS: Filters = {
  query: '', type: 'all', location: '', minPrice: null, maxPrice: null, bedrooms: null,
};

export function usePropertySearch() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  useEffect(() => {
    const supabase = createBrowserClient();
    let q = supabase
      .from('properties')
      .select('*, property_images(*)', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filters.query) q = q.ilike('title', `%${filters.query}%`);
    if (filters.type !== 'all') q = q.eq('type', filters.type);
    if (filters.location) q = q.ilike('location_name', `%${filters.location}%`);
    if (filters.minPrice) q = q.gte('price', filters.minPrice);
    if (filters.maxPrice) q = q.lte('price', filters.maxPrice);
    if (filters.bedrooms) q = q.gte('bedrooms', filters.bedrooms);

    setLoading(true);
    q.then(({ data, count }) => {
      setProperties((data as Property[]) ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    });
  }, [filters]);

  return { filters, updateFilter, resetFilters, properties, loading, total };
}

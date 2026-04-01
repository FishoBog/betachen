'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { PropertyCard } from '@/components/property/PropertyCard';
import type { Property } from '@/types';
export default function ComparePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('BETACHEN_compare') ?? '[]');
      if (!ids.length) return;
      createBrowserClient().from('properties').select('*, property_images(*)').in('id', ids)
        .then(({ data }) => setProperties((data as Property[]) ?? []));
    } catch {}
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Compare Properties</h1>
        {properties.length === 0 ? <p className="text-gray-500 text-center py-20">Add properties to compare from the listing cards.</p>
          : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{properties.map(p => <PropertyCard key={p.id} property={p} />)}</div>}
      </main>
    </div>
  );
}

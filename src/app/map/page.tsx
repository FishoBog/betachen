'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyMap } from '@/components/map/PropertyMap';
import { createBrowserClient } from '@/lib/supabase';

export default function MapPage() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    // Note: `properties` has no `city` column (only `location` and `subcity`),
    // so we select `location` and let the map derive the city from it for the
    // centroid fallback. Filtering on status 'active' (the public/approved value).
    createBrowserClient()
      .from('properties')
      .select('id,title,price,currency,latitude,longitude,type,location,subcity')
      .eq('status', 'active')
      .then(({ data }) => setProperties(data ?? []));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Map View</h1>
        <PropertyMap properties={properties} />
      </main>
    </div>
  );
}

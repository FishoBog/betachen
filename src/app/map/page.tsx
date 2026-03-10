'use client';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyMap } from '@/components/map/PropertyMap';
import { createBrowserClient } from '@/lib/supabase';
import type { Property } from '@/types';

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  useEffect(() => {
    createBrowserClient().from('properties').select('id,title,price,currency,latitude,longitude,type,location_name').eq('status','published').not('latitude','is',null)
      .then(({ data }) => setProperties((data as Property[]) ?? []));
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

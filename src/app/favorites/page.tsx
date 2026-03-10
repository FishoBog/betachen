'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Loader2 } from 'lucide-react';
import type { Property } from '@/types';

export default function FavoritesPage() {
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase.from('favorites').select('property_id, properties(*, property_images(*))').eq('user_id', user.id)
      .then(({ data }) => {
        setProperties((data ?? []).map((f: any) => f.properties).filter(Boolean) as Property[]);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Saved Properties</h1>
        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          : properties.length === 0 ? <p className="text-gray-500 text-center py-20">No saved properties yet.</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{properties.map(p => <PropertyCard key={p.id} property={p} />)}</div>}
      </main>
    </div>
  );
}

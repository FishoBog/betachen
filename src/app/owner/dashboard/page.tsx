'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PlusCircle } from 'lucide-react';
import type { Property } from '@/types';
export default function OwnerDashboard() {
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    createBrowserClient().from('properties').select('*, property_images(*)').eq('owner_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setProperties((data as Property[]) ?? []); setLoading(false); });
  }, [user]);
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>My Listings</h1>
          <Link href="/owner/listings/new" className="btn-accent flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Listing
          </Link>
        </div>
        {loading ? <p className="text-gray-500">Loading...</p>
          : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">No listings yet.</p>
              <Link href="/owner/listings/new" className="btn-primary">Post Your First Listing</Link>
            </div>
          ) : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p.id} property={p} showExpiry />)}
          </div>}
      </main>
    </div>
  );
}

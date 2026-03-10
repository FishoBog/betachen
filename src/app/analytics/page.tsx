'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { Eye, Heart, MessageSquare, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useUser();
  const [stats, setStats] = useState({ views: 0, favorites: 0, messages: 0, listings: 0 });

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    Promise.all([
      supabase.from('properties').select('id', { count: 'exact' }).eq('owner_id', user.id),
      supabase.from('property_views').select('id', { count: 'exact' }).eq('owner_id', user.id),
    ]).then(([listings, views]) => {
      setStats(p => ({ ...p, listings: listings.count ?? 0, views: views.count ?? 0 }));
    });
  }, [user]);

  const cards = [
    { icon: TrendingUp, label: 'Listings', value: stats.listings },
    { icon: Eye, label: 'Total Views', value: stats.views },
    { icon: Heart, label: 'Saved', value: stats.favorites },
    { icon: MessageSquare, label: 'Messages', value: stats.messages },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Analytics</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-5 text-center">
              <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--coral)' }} />
              <div className="text-3xl font-bold" style={{ color: 'var(--navy)' }}>{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

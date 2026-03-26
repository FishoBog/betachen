'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Trash2, RefreshCw } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';

interface Props { propertyId: string; status: string; }

export function ListingActions({ propertyId, status }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const deleteListing = async () => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    setLoading(true);
    await supabase.from('properties').delete().eq('id', propertyId);
    router.push('/owner/dashboard');
  };

  if (!user) return null;

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '16px 20px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
        Owner Actions
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <a href={`/owner/listings/${propertyId}/renew`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, background: '#006AFF', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          <RefreshCw size={14} /> Renew
        </a>
        <button onClick={deleteListing} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, border: '1px solid #fecaca', cursor: 'pointer' }}>
          <Trash2 size={14} /> {loading ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
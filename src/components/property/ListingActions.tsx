'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, CheckCircle } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';

interface Props { propertyId: string; status: string; }

export function ListingActions({ propertyId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const markSold = async () => {
    setLoading(true);
    await supabase.from('properties').update({ status: 'sold' }).eq('id', propertyId);
    router.refresh();
    setLoading(false);
  };

  const deleteListing = async () => {
    if (!confirm('Delete this listing?')) return;
    setLoading(true);
    await supabase.from('properties').delete().eq('id', propertyId);
    router.push('/owner/dashboard');
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => router.push(`/property/${propertyId}/edit`)}
        className="btn-secondary flex items-center gap-2 text-sm">
        <Edit className="w-4 h-4" /> Edit
      </button>
      {status === 'published' && (
        <button onClick={markSold} disabled={loading}
          className="btn-secondary flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" /> Mark Sold
        </button>
      )}
      <button onClick={deleteListing} disabled={loading}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </div>
  );
}

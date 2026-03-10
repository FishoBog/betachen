'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MessageSquare, Phone } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import type { Property } from '@/types';

export function ContactOwnerCard({ property }: { property: Property }) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    if (!isSignedIn) { router.push('/sign-in'); return; }
    setLoading(true);
    const supabase = createBrowserClient();
    const { data: existing } = await supabase.from('chats')
      .select('id').eq('property_id', property.id).eq('buyer_id', user.id).single();
    if (existing) { router.push(`/messages/${existing.id}`); return; }
    const { data } = await supabase.from('chats')
      .insert({ property_id: property.id, buyer_id: user.id, owner_id: property.owner_id })
      .select('id').single();
    if (data) router.push(`/messages/${data.id}`);
    setLoading(false);
  };

  return (
    <div className="card p-5 sticky top-24">
      <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--navy)' }}>Contact Owner</h3>
      <div className="text-2xl font-bold mb-4" style={{ color: 'var(--navy)' }}>
        {property.price.toLocaleString()} {property.currency}
        {property.type !== 'sale' && <span className="text-sm font-normal text-gray-400">/{property.type === 'short_rent' ? 'night' : 'month'}</span>}
      </div>
      <button onClick={startChat} disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4" />
        {loading ? 'Opening chat...' : 'Message Owner'}
      </button>
      {property.profiles?.phone && (
        <a href={`tel:${property.profiles.phone}`}
          className="w-full btn-secondary flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          Call Owner
        </a>
      )}
    </div>
  );
}

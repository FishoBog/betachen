'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';

export function useFavorites() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase.from('favorites').select('property_id').eq('user_id', user.id)
      .then(({ data }) => setFavorites((data ?? []).map((f: any) => f.property_id)));
  }, [user]);

  const toggle = async (propertyId: string) => {
    if (!user) return;
    const supabase = createBrowserClient();
    if (favorites.includes(propertyId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
      setFavorites(prev => prev.filter(id => id !== propertyId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId });
      setFavorites(prev => [...prev, propertyId]);
    }
  };

  return { favorites, toggle, isFavorite: (id: string) => favorites.includes(id) };
}

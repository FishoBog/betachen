'use client';
import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';

export function ViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('property_views').insert({ property_id: propertyId }).then(() => {});
  }, [propertyId]);
  return null;
}

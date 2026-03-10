'use client';
import { Heart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface Props { propertyId: string; size?: 'sm' | 'md'; }

export function FavoriteButton({ propertyId, size = 'md' }: Props) {
  const { isSignedIn } = useUser();
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(propertyId);

  if (!isSignedIn) return null;

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(propertyId); }}
      className={cn(
        'rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow transition-colors hover:bg-white',
        size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
      )}>
      <Heart className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5', active ? 'fill-red-500 text-red-500' : 'text-gray-500')} />
    </button>
  );
}

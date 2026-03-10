'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Star } from 'lucide-react';
import type { Review } from '@/types';

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const { isSignedIn, user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.from('reviews').select('*, profiles(full_name, avatar_url)')
      .eq('property_id', propertyId).order('created_at', { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) ?? []));
  }, [propertyId]);

  const submit = async () => {
    if (!user || !comment.trim()) return;
    setLoading(true);
    const { data } = await supabase.from('reviews')
      .insert({ property_id: propertyId, reviewer_id: user.id, rating, comment })
      .select('*, profiles(full_name)').single();
    if (data) setReviews(p => [data as Review, ...p]);
    setComment(''); setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-xl">Reviews ({reviews.length})</h3>
      {isSignedIn && (
        <div className="card p-5 space-y-3">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}>
                <Star className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea className="input-field" rows={3} placeholder="Write your review..."
            value={comment} onChange={e => setComment(e.target.value)} />
          <button onClick={submit} disabled={loading} className="btn-primary">Submit Review</button>
        </div>
      )}
      {reviews.map(r => (
        <div key={r.id} className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{(r as any).profiles?.full_name ?? 'Anonymous'}</span>
          </div>
          {r.comment && <p className="text-gray-700 text-sm">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}

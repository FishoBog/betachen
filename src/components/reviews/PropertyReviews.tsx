'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Star } from 'lucide-react';
import type { Review } from '@/types';
import { useLang } from '@/context/LangContext';

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const { isSignedIn, user } = useUser();
  const { lang } = useLang();
  const am = lang === 'AM';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) ?? []));
  }, [propertyId]);

  const submit = async () => {
    if (!user || !comment.trim()) return;
    setLoading(true);
    const { data } = await supabase.from('reviews')
      .insert({ property_id: propertyId, reviewer_id: user.id, rating, comment })
      .select('*, profiles(full_name)').single();
    if (data) setReviews(p => [data as Review, ...p]);
    setComment('');
    setLoading(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ display: 'grid', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
            ⭐ {am ? 'ግምገማዎች' : 'Reviews'}
          </span>
          <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
            {reviews.length}
          </span>
        </div>
        {avgRating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex' }}>
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={16} fill={n <= Math.round(Number(avgRating)) ? '#f59e0b' : 'none'} color={n <= Math.round(Number(avgRating)) ? '#f59e0b' : '#d1d5db'} />
              ))}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{avgRating}</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      {isSignedIn ? (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
            {am ? 'ግምገማ ፃፍ' : 'Write a review'}
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <Star size={28} fill={(hover || rating) >= n ? '#f59e0b' : 'none'} color={(hover || rating) >= n ? '#f59e0b' : '#d1d5db'} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={am ? 'ስለ ይህ ንብረት ምን ያስባሉ?' : 'Share your experience with this property...'}
            rows={3}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, background: 'white', boxSizing: 'border-box' as const }}
          />
          <button
            onClick={submit}
            disabled={loading || !comment.trim()}
            style={{ marginTop: 10, padding: '10px 24px', background: loading || !comment.trim() ? '#9ca3af' : '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: loading || !comment.trim() ? 'not-allowed' : 'pointer' }}>
            {loading ? (am ? 'በመላክ...' : 'Submitting...') : (am ? 'ላክ' : 'Submit Review')}
          </button>
        </div>
      ) : (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: '16px 20px', border: '1px solid #e5e7eb', textAlign: 'center' as const, color: '#6b7280', fontSize: 14 }}>
          {am ? 'ግምገማ ለመፃፍ ይግቡ' : 'Sign in to write a review'}
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center' as const, padding: '24px 0', color: '#9ca3af', fontSize: 14 }}>
          {am ? 'እስካሁን ምንም ግምገማ የለም' : 'No reviews yet — be the first!'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: '16px 18px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8431A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                    {((r as any).profiles?.full_name?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                    {(r as any).profiles?.full_name ?? 'Anonymous'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={14} fill={n <= r.rating ? '#f59e0b' : 'none'} color={n <= r.rating ? '#f59e0b' : '#d1d5db'} />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
              )}
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                {new Date(r.created_at).toLocaleDateString('en-ET', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
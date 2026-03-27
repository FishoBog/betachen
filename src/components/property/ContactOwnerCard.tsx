'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MessageSquare, Share2, CheckCircle, Tag } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import type { Property } from '@/types';

export function ContactOwnerCard({ property }: { property: Property }) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestMsg, setGuestMsg] = useState('');
  const [guestSent, setGuestSent] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const isNegotiable = (property as any).price_negotiable;
  const whatsappNumber = (property as any).owner_whatsapp;
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in your property "${property.title}" listed on ጎጆ Homes. ${typeof window !== 'undefined' ? window.location.href : ''}`);

  const handleMessageClick = async () => {
    if (!isSignedIn) {
      setShowGuestForm(true);
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: existing } = await supabase
        .from('chats')
        .select('id')
        .eq('property_id', property.id)
        .eq('buyer_id', user!.id)
        .single();
      if (existing) {
        router.push(`/messages/${existing.id}`);
        return;
      }
      const { data } = await supabase
        .from('chats')
        .insert({ property_id: property.id, buyer_id: user!.id, owner_id: property.owner_id })
        .select('id')
        .single();
      if (data) router.push(`/messages/${data.id}`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const sendGuestInquiry = async () => {
    if (!guestMsg.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/listings/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          guestName: guestName || 'Anonymous',
          guestPhone,
          message: guestMsg,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    setGuestSent(true);
    setLoading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this property on ጎጆ Homes: ${property.title}`;
    if (navigator.share) {
      await navigator.share({ title: property.title, text, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

      {/* Price */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
        {isNegotiable ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px' }}>
            <Tag size={16} color="#d97706" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#92400e' }}>Price on Negotiation</div>
              <div style={{ fontSize: 12, color: '#78350f' }}>Contact owner to discuss price</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#006AFF', lineHeight: 1 }}>
              {property.price?.toLocaleString()} {property.currency}
            </div>
            {property.type !== 'sale' && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                per {property.type === 'short_rent' ? 'night' : 'month'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner info */}
      {(property as any).profiles && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: '#f9fafb', borderRadius: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8431A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>🏠</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Property Owner</span>
              {(property as any).profiles?.is_verified && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                  <CheckCircle size={11} /> Verified
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Listed on ጎጆ Homes</div>
          </div>
        </div>
      )}

      {/* Guest inquiry form */}
      {showGuestForm && !guestSent && (
        <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginBottom: 12 }}>
            📨 Send inquiry to owner
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Your name (optional)"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }}
            />
            <input
              value={guestPhone}
              onChange={e => setGuestPhone(e.target.value)}
              placeholder="Your phone number (optional)"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }}
            />
            <textarea
              value={guestMsg}
              onChange={e => setGuestMsg(e.target.value)}
              placeholder="Hi, I'm interested in this property..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={sendGuestInquiry}
                disabled={loading || !guestMsg.trim()}
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: !guestMsg.trim() ? '#9ca3af' : '#006AFF', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: !guestMsg.trim() ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending...' : 'Send Inquiry'}
              </button>
              <button
                onClick={() => setShowGuestForm(false)}
                style={{ padding: '10px 14px', borderRadius: 8, background: 'white', color: '#6b7280', fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' as const }}>
              Or <button onClick={() => router.push('/sign-in')} style={{ background: 'none', border: 'none', color: '#006AFF', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>sign in</button> for full messaging
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {guestSent && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '14px', marginBottom: 16, textAlign: 'center' as const }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Inquiry sent!</div>
          <div style={{ fontSize: 12, color: '#047857', marginTop: 4 }}>The owner will contact you shortly.</div>
        </div>
      )}

      {/* Action buttons — always show unless guest form is open */}
      {!showGuestForm && !guestSent && (
        <div style={{ display: 'grid', gap: 10 }}>
          <button
            onClick={handleMessageClick}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <MessageSquare size={18} />
            {loading ? 'Opening...' : isNegotiable ? 'Message to Negotiate' : 'Message Owner'}
          </button>

          {whatsappNumber && (
            
              {whatsappNumber && (
            <button
              onClick={() => window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`, '_blank')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#25D366', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', width: '100%' }}>
              💬 WhatsApp Owner
            </button>
          )}

          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: shared ? '#ecfdf5' : '#f9fafb', color: shared ? '#059669' : '#6b7280', fontSize: 14, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            {shared ? <><CheckCircle size={16} /> Link Copied!</> : <><Share2 size={16} /> Share Property</>}
          </button>
        </div>
      )}
    </div>
  );
}
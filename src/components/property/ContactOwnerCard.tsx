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

  const startChat = async () => {
    if (!isSignedIn) {
      setShowGuestForm(true);
      return;
    }
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
      setGuestSent(true);
    } catch {}
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

      {guestSent && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '14px', marginBottom: 16, textAlign: 'center' as const }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Inquiry sent!</div>
          <div style={{ fontSize: 12, color: '#047857', marginTop: 4 }}>The owner will contact you shortly.</div>
        </div>
      )}

      {/* Action buttons */}
      {!showGuestForm && (
        <div style={{ display: 'grid', gap: 10 }}>
          <button
            onClick={startChat}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <MessageSquare size={18} />
            {loading ? 'Opening...' : isNegotiable ? 'Message to Negotiate' : 'Message Owner'}
          </button>

          {whatsappNumber && (
            
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#25D366', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Owner
            </a>
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
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MessageSquare, Share2, CheckCircle, Tag, Send, X } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import type { Property } from '@/types';

export function ContactOwnerCard({ property }: { property: Property }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shared, setShared] = useState(false);
  const isNegotiable = (property as any).price_negotiable;
  const whatsappNumber = (property as any).owner_whatsapp;
  const whatsappMsg = encodeURIComponent(`Hi, I am interested in your property "${property.title}" listed on Betachen.`);

  const handleMessageClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    setShowCompose(true);
    setMessage(`Hi, I am interested in your property "${property.title}". `);
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    try {
      const supabase = createBrowserClient();
      await supabase.from('messages').insert({
        property_id: property.id,
        sender_clerk_id: user.id,
        receiver_clerk_id: property.owner_id,
        content: message.trim(),
        is_read: false,
      });
      setSent(true);
      setShowCompose(false);
      setMessage('');
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, text: `Check out this property: ${property.title}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const openWhatsApp = () => {
    if (!whatsappNumber) return;
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`, '_blank');
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

      {/* Sent confirmation */}
      {sent && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '14px', textAlign: 'center' as const, marginBottom: 12 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Message sent!</div>
          <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>The owner will contact you shortly.</div>
          <button onClick={() => router.push('/messages')} style={{ marginTop: 10, padding: '8px 16px', background: '#006AFF', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            View Messages
          </button>
        </div>
      )}

      {/* Message compose box */}
      {showCompose && (
        <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>Message to Owner</div>
            <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={16} />
            </button>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message to the owner..."
            rows={4}
            autoFocus
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #dbeafe', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, background: 'white' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', borderRadius: 8, background: !message.trim() ? '#9ca3af' : '#006AFF', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: !message.trim() ? 'not-allowed' : 'pointer' }}>
              <Send size={15} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            <button onClick={() => setShowCompose(false)} style={{ padding: '11px 14px', borderRadius: 8, background: 'white', color: '#6b7280', fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!showCompose && !sent && (
        <div style={{ display: 'grid', gap: 10 }}>
          <button
            onClick={handleMessageClick}
            disabled={!isLoaded}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: !isLoaded ? '#9ca3af' : '#006AFF', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: !isLoaded ? 'wait' : 'pointer', width: '100%' }}>
            <MessageSquare size={18} />
            {!isLoaded ? 'Loading...' : isNegotiable ? 'Message to Negotiate' : 'Message Owner'}
          </button>

          {whatsappNumber && (
            <button onClick={openWhatsApp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#25D366', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', width: '100%' }}>
              💬 WhatsApp Owner
            </button>
          )}

          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: shared ? '#ecfdf5' : '#f9fafb', color: shared ? '#059669' : '#6b7280', fontSize: 14, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer', width: '100%' }}>
            {shared ? <><CheckCircle size={16} /> Link Copied!</> : <><Share2 size={16} /> Share Property</>}
          </button>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MessageSquare, Share2, CheckCircle, Tag, Send, X, User, Phone } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import type { Property } from '@/types';

export function ContactOwnerCard({ property }: { property: Property }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shared, setShared] = useState(false);

  const isNegotiable = (property as any).price_negotiable;

  const openCompose = () => {
    setShowCompose(true);
    setMessage(`Hi, I am interested in your property "${property.title}". `);
  };

  // ── Logged-in user send ──
  const handleSendLoggedIn = async () => {
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
    } catch (e) { console.error(e); }
    setSending(false);
  };

  // ── Guest send ──
  const handleSendGuest = async () => {
    if (!message.trim() || !guestName.trim() || !guestContact.trim()) return;
    setSending(true);
    try {
      const supabase = createBrowserClient();
      // Store as a message with guest info in the content
      await supabase.from('messages').insert({
        property_id: property.id,
        sender_clerk_id: null,
        receiver_clerk_id: property.owner_id,
        content: message.trim(),
        is_read: false,
        guest_name: guestName.trim(),
        guest_contact: guestContact.trim(),
      });
      setSent(true);
      setShowCompose(false);
      setMessage('');
      setGuestName('');
      setGuestContact('');
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #dbeafe', borderRadius: 8,
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
    background: 'white', boxSizing: 'border-box',
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

      {/* Success */}
      {sent && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '16px', textAlign: 'center' as const, marginBottom: 12 }}>
          <CheckCircle size={28} color="#059669" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#065f46' }}>Message sent!</div>
          <div style={{ fontSize: 13, color: '#047857', marginTop: 4, lineHeight: 1.5 }}>
            The owner will be in touch with you soon.
          </div>
          {isSignedIn && (
            <button onClick={() => router.push('/messages')} style={{ marginTop: 12, padding: '8px 18px', background: '#006AFF', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              View Messages
            </button>
          )}
        </div>
      )}

      {/* Compose box */}
      {showCompose && !sent && (
        <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 14, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>
              <MessageSquare size={14} style={{ display: 'inline', marginRight: 6 }} />
              Message Owner
            </div>
            <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {/* Guest fields — only shown when not signed in */}
            {!isSignedIn && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <User size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Your name"
                      style={{ ...inputStyle, paddingLeft: 28 }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Phone size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      value={guestContact}
                      onChange={e => setGuestContact(e.target.value)}
                      placeholder="Phone or email"
                      style={{ ...inputStyle, paddingLeft: 28 }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', background: '#eff6ff', borderRadius: 6, padding: '6px 10px' }}>
                  Your contact will only be shared with the property owner — never made public.
                </div>
              </>
            )}

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              autoFocus={isSignedIn}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={isSignedIn ? handleSendLoggedIn : handleSendGuest}
                disabled={sending || !message.trim() || (!isSignedIn && (!guestName.trim() || !guestContact.trim()))}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '11px', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  background: (sending || !message.trim() || (!isSignedIn && (!guestName.trim() || !guestContact.trim()))) ? '#9ca3af' : '#006AFF',
                  color: 'white',
                }}>
                <Send size={15} />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
              <button onClick={() => setShowCompose(false)} style={{ padding: '11px 14px', borderRadius: 8, background: 'white', color: '#6b7280', fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!showCompose && !sent && (
        <div style={{ display: 'grid', gap: 10 }}>
          <button
            onClick={openCompose}
            disabled={!isLoaded}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: !isLoaded ? '#9ca3af' : '#006AFF', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: !isLoaded ? 'wait' : 'pointer', width: '100%' }}>
            <MessageSquare size={18} />
            {isNegotiable ? 'Message to Negotiate' : 'Message Owner'}
          </button>

          {/* Guest nudge — soft, not a blocker */}
          {isLoaded && !isSignedIn && (
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' as const, lineHeight: 1.5 }}>
              No account needed to send a message.{' '}
              <button onClick={() => router.push('/sign-in')} style={{ background: 'none', border: 'none', color: '#006AFF', fontWeight: 600, cursor: 'pointer', fontSize: 12, padding: 0 }}>
                Sign in
              </button>
              {' '}to track all your messages.
            </div>
          )}

          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: shared ? '#ecfdf5' : '#f9fafb', color: shared ? '#059669' : '#6b7280', fontSize: 14, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer', width: '100%' }}>
            {shared ? <><CheckCircle size={16} /> Link Copied!</> : <><Share2 size={16} /> Share Property</>}
          </button>
        </div>
      )}
    </div>
  );
}

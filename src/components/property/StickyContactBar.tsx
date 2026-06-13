'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { useLang } from '@/context/LangContext';

// ─────────────────────────────────────────────────────────────────────────
// StickyContactBar
// A bottom-pinned action bar (Call / Contact / WhatsApp), like pisos.com.
// Appears once the user scrolls past the header so it doesn't crowd the
// first view. Mobile-first: this is where most Betachen visitors are.
//
// Phone/email are optional — each button only renders if its value exists,
// so a listing with no phone simply shows fewer actions rather than dead
// buttons. WhatsApp reuses the phone number (Ethiopian numbers, normalised).
// ─────────────────────────────────────────────────────────────────────────

interface Props {
  phone?: string | null;
  email?: string | null;
  priceLabel: string;
}

// Normalise an Ethiopian number for wa.me: strip spaces/dashes, turn a
// leading 0 into the +251 country code, drop a leading +.
function waNumber(raw: string): string {
  let n = raw.replace(/[\s\-()]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('0')) n = '251' + n.slice(1);
  return n;
}

export function StickyContactBar({ phone, email, priceLabel }: Props) {
  const { lang } = useLang();
  const en = lang === 'EN';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hasPhone = !!(phone && phone.trim());
  const hasEmail = !!(email && email.trim());
  if (!hasPhone && !hasEmail) return null;

  const btnBase: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px 12px', borderRadius: 12, fontSize: 15, fontWeight: 700,
    textDecoration: 'none', border: 'none', cursor: 'pointer',
  };

  return (
    <div
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e7e5ee', boxShadow: '0 -4px 24px rgba(26,24,48,0.10)',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'none', minWidth: 120, flexShrink: 0 }} className="sticky-price">
          <div style={{ fontSize: 11, color: '#8b8a9c', fontWeight: 600 }}>{en ? 'Price' : 'ዋጋ'}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#1a1830', lineHeight: 1.1 }}>{priceLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flex: 1 }}>
          {hasPhone && (
            <a href={`tel:${phone}`} style={{ ...btnBase, background: '#E8431A', color: 'white', boxShadow: '0 4px 14px rgba(232,67,26,0.30)' }}>
              <Phone size={18} /> {en ? 'Call' : 'ይደውሉ'}
            </a>
          )}
          {hasEmail && (
            <a href={`mailto:${email}`} style={{ ...btnBase, background: 'white', color: '#E8431A', border: '1.5px solid #E8431A' }}>
              <Mail size={18} /> {en ? 'Contact' : 'ያግኙ'}
            </a>
          )}
          {hasPhone && (
            <a href={`https://wa.me/${waNumber(phone!)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, background: '#25D366', color: 'white', maxWidth: 64, flex: '0 0 auto', padding: '13px 18px', boxShadow: '0 4px 14px rgba(37,211,102,0.30)' }} aria-label="WhatsApp">
              <MessageCircle size={20} />
            </a>
          )}
        </div>
      </div>
      <style>{`@media (min-width: 768px) { .sticky-price { display: block !important; } }`}</style>
    </div>
  );
}

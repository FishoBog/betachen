'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, MessageCircle } from 'lucide-react';
import { useLang } from '@/context/LangContext';

// ─────────────────────────────────────────────────────────────────────────
// StickyContactBar
// Bottom-pinned action bar (pisos.com style) that appears once the user
// scrolls past the header. Built for Betachen's actual contact model:
//
//  • "Message Owner" is ALWAYS shown — it's the platform's primary, private
//    contact path (routes through the in-app messages table). Tapping it
//    scrolls to and focuses the existing ContactOwnerCard via #contact-owner.
//  • Call / WhatsApp appear ONLY when a phone number is present on the
//    listing. Most listings won't have one (the form field is optional), so
//    they gracefully show just "Message Owner".
//
// This component sends NO messages itself — it defers entirely to the proven
// ContactOwnerCard logic, so nothing about message-sending changes.
// ─────────────────────────────────────────────────────────────────────────

interface Props {
  phone?: string | null;
  priceLabel: string;
  subLabel?: string;
}

// Normalise an Ethiopian number for wa.me: strip formatting, turn a leading
// 0 into +251, drop a leading +.
function waNumber(raw: string): string {
  let n = raw.replace(/[\s\-()]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('0')) n = '251' + n.slice(1);
  return n;
}

export function StickyContactBar({ phone, priceLabel, subLabel }: Props) {
  const { lang } = useLang();
  const en = lang === 'EN';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 340);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hasPhone = !!(phone && phone.trim());

  // Scroll to the existing ContactOwnerCard and nudge it open.
  const goToContact = () => {
    const el = document.getElementById('contact-owner');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const btn = el.querySelector('button');
      // Soft highlight so the user sees where they landed.
      el.style.transition = 'box-shadow 0.3s';
      el.style.boxShadow = '0 0 0 3px rgba(232,67,26,0.35)';
      setTimeout(() => { el.style.boxShadow = ''; }, 1400);
    }
  };

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 12px', borderRadius: 13, fontSize: 15, fontWeight: 700,
    textDecoration: 'none', border: 'none', cursor: 'pointer', lineHeight: 1,
  };

  return (
    <div
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e7e5ee', boxShadow: '0 -4px 24px rgba(26,24,48,0.10)',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ minWidth: 110, flexShrink: 0 }} className="sticky-price">
          {subLabel && <div style={{ fontSize: 11, color: '#8b8a9c', fontWeight: 600 }}>{subLabel}</div>}
          <div style={{ fontSize: 19, fontWeight: 900, color: '#1a1830', lineHeight: 1.1 }}>{priceLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flex: 1 }}>
          <button onClick={goToContact} style={{ ...btnBase, flex: 1, background: '#E8431A', color: 'white', boxShadow: '0 4px 14px rgba(232,67,26,0.30)' }}>
            <MessageSquare size={18} /> {en ? 'Message Owner' : 'ባለቤቱን ያግኙ'}
          </button>
          {hasPhone && (
            <a href={`tel:${phone}`} style={{ ...btnBase, flex: '0 0 auto', width: 52, padding: '14px 0', background: 'white', color: '#E8431A', border: '1.5px solid #E8431A' }} aria-label={en ? 'Call' : 'ይደውሉ'}>
              <Phone size={19} />
            </a>
          )}
          {hasPhone && (
            <a href={`https://wa.me/${waNumber(phone!)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, flex: '0 0 auto', width: 52, padding: '14px 0', background: '#25D366', color: 'white', boxShadow: '0 4px 14px rgba(37,211,102,0.30)' }} aria-label="WhatsApp">
              <MessageCircle size={20} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, MessageCircle } from 'lucide-react';
import { useLang } from '@/context/LangContext';

// Bottom-pinned action bar (pisos.com style) for Betachen's contact model.
// "Message Owner" is always shown (primary, private, in-app). Call/WhatsApp
// appear only when a phone number exists on the listing. Defers all messaging
// to the existing ContactOwnerCard (targets #contact-owner). Sends nothing.
//
// Buttons use a "3D lip" treatment: a darker bottom-border reads as physical
// thickness; hover lifts, active presses down. No drop shadows (crisp render).

interface Props {
  phone?: string | null;
  priceLabel: string;
  subLabel?: string;
}

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

  const goToContact = () => {
    const el = document.getElementById('contact-owner');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'box-shadow 0.3s';
      el.style.boxShadow = '0 0 0 3px rgba(232,67,26,0.35)';
      setTimeout(() => { el.style.boxShadow = ''; }, 1400);
    }
  };

  return (
    <>
      <style>{`
        .bc-btn { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 15px; line-height: 1; border: none; cursor: pointer; text-decoration: none; border-radius: 13px; transition: transform 0.08s ease, filter 0.12s ease; }
        .bc-btn:hover { transform: translateY(-1px); filter: brightness(1.04); }
        .bc-btn:active { transform: translateY(2px); }
        .bc-msg { padding: 15px 14px; background: #E8431A; color: #fff; border-bottom: 4px solid #a8300f; }
        .bc-msg:active { border-bottom-width: 1px; }
        .bc-call { padding: 15px 0; background: #006AFF; color: #fff; border-bottom: 4px solid #0047b3; }
        .bc-call:active { border-bottom-width: 1px; }
        .bc-wa { padding: 15px 0; background: #25D366; color: #fff; border-bottom: 4px solid #128c3f; }
        .bc-wa:active { border-bottom-width: 1px; }
        /* Proportional widths: message 2 parts, call & whatsapp 1 each — a
           balanced trio rather than one giant bar. Message fills alone if no phone. */
        .bc-actions { display: flex; gap: 10px; flex: 1; min-width: 0; }
        .bc-actions .bc-msg { flex: 2; min-width: 0; overflow: hidden; }
        .bc-actions .bc-msg .bc-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bc-actions .bc-call { flex: 1; min-width: 48px; }
        .bc-actions .bc-wa { flex: 1; min-width: 48px; }
        /* On narrow phones, drop the price so the three buttons always fit and
           never push Call/WhatsApp off-screen. */
        @media (max-width: 560px) {
          .sticky-price { display: none !important; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
          transform: visible ? 'translateY(0)' : 'translateY(130%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid #e7e5ee', boxShadow: '0 -4px 24px rgba(26,24,48,0.10)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ minWidth: 104, flexShrink: 0 }} className="sticky-price">
            {subLabel && <div style={{ fontSize: 11, color: '#8b8a9c', fontWeight: 600 }}>{subLabel}</div>}
            <div style={{ fontSize: 19, fontWeight: 900, color: '#1a1830', lineHeight: 1.1 }}>{priceLabel}</div>
          </div>
          <div className="bc-actions">
            <button onClick={goToContact} className="bc-btn bc-msg">
              <MessageSquare size={18} /> <span className="bc-label">{en ? 'Message Owner' : 'ባለቤቱን ያግኙ'}</span>
            </button>
            {hasPhone && (
              <a href={`tel:${phone}`} className="bc-btn bc-call" aria-label={en ? 'Call' : 'ይደውሉ'}>
                <Phone size={19} />
              </a>
            )}
            {hasPhone && (
              <a href={`https://wa.me/${waNumber(phone!)}`} target="_blank" rel="noopener noreferrer" className="bc-btn bc-wa" aria-label="WhatsApp">
                <MessageCircle size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

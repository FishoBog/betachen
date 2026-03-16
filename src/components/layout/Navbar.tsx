'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { PlusCircle, Heart, Bell, Menu, X, FileText, Shield, Send } from 'lucide-react';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';

export function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  const links = [
    { href: '/', label: lang === 'EN' ? 'Buy' : 'ግዛ', authOnly: false, external: false },
    { href: '/?type=long_rent', label: lang === 'EN' ? 'Rent' : 'ተከራይ', authOnly: false, external: false },
    { href: '/map', label: lang === 'EN' ? 'Map' : 'ካርታ', authOnly: false, external: false },
    { href: '/market', label: lang === 'EN' ? '📊 Market' : '📊 ገበያ', authOnly: false, external: false },
    { href: '/diaspora', label: lang === 'EN' ? '🌍 Diaspora' : '🌍 ዲያስፖራ', authOnly: false, external: false },
    { href: 'https://t.me/GojoEthiopiaBot', label: '✈️ Telegram', authOnly: false, external: true },
    { href: '/contracts', label: lang === 'EN' ? 'Contracts' : 'ውሎች', authOnly: true, external: false },
    { href: '/owner/dashboard', label: lang === 'EN' ? 'Listings' : 'ዝርዝሮች', authOnly: true, external: false },
    { href: '/messages', label: lang === 'EN' ? 'Messages' : 'መልዕክቶች', authOnly: true, external: false },
  ];

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8431A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 800 }}>ጎ</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: '#006AFF', letterSpacing: '-0.5px' }}>ጎጆ</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
          {links.map(link => {
            if (link.authOnly && !isSignedIn) return null;
            const active = pathname === link.href;
            return link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                padding: '8px 10px', borderRadius: 8, fontSize: 13,
                fontWeight: 500, color: '#0088cc',
                background: 'transparent',
                textDecoration: 'none', whiteSpace: 'nowrap' as const,
                transition: 'all 0.15s'
              }}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} style={{
                padding: '8px 10px', borderRadius: 8, fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? '#E8431A' : '#374151',
                background: active ? '#fef2ee' : 'transparent',
                textDecoration: 'none', whiteSpace: 'nowrap' as const,
                transition: 'all 0.15s'
              }}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Language switcher */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['EN', 'AM'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: lang === l ? 'white' : 'transparent',
                color: lang === l ? '#006AFF' : '#6b7280',
                boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                letterSpacing: '0.3px'
              }}>
                {l === 'EN' ? 'EN' : 'አማ'}
              </button>
            ))}
          </div>

          {isSignedIn ? (
            <>
              <Link href="/favorites" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Favorites">
                <Heart size={20} />
              </Link>
              <Link href="/alerts" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Alerts">
                <Bell size={20} />
              </Link>
              <Link href="/contracts/new" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="New Contract">
                <FileText size={20} />
              </Link>
              <Link href="/owner/verify" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Get Verified">
                <Shield size={20} />
              </Link>
              <a href="https://t.me/GojoEthiopiaBot" target="_blank" rel="noopener noreferrer"
                style={{ padding: 8, borderRadius: 8, color: '#0088cc', display: 'flex', textDecoration: 'none' }} title="Telegram Bot">
                <Send size={20} />
              </a>
              <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                <PlusCircle size={15} />
                {t.navPostListing}
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #d1d5db', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t.navSignIn}
                </button>
              </SignInButton>
              <Link href="/sign-up" style={{ padding: '9px 16px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                {t.navJoin}
              </Link>
            </>
          )}

          <button onClick={() => setMenuOpen(o => !o)} style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 24px 16px', background: 'white' }}>
          {/* Mobile language switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['EN', 'AM'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                border: `2px solid ${lang === l ? '#006AFF' : '#e5e7eb'}`,
                background: lang === l ? '#006AFF' : 'white',
                color: lang === l ? 'white' : '#6b7280',
                cursor: 'pointer'
              }}>
                {l === 'EN' ? 'English' : 'አማርኛ'}
              </button>
            ))}
          </div>

          {links.map(link => {
            if (link.authOnly && !isSignedIn) return null;
            return link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#0088cc', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                {link.label}
              </Link>
            );
          })}

          {isSignedIn && (
            <>
              <Link href="/owner/verify" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Shield size={16} />
                {lang === 'EN' ? 'Get Verified' : 'ተረጋግጥ'}
              </Link>
              <Link href="/contracts/new" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <FileText size={16} />
                {lang === 'EN' ? 'New Contract' : 'አዲስ ውል'}
              </Link>
              <a href="https://t.me/GojoEthiopiaBot" target="_blank" rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#0088cc', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Send size={16} />
                {lang === 'EN' ? 'Telegram Bot' : 'ቴሌግራም ቦት'}
              </a>
              <Link href="/owner/listings/new" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '12px 16px', borderRadius: 10, background: '#E8431A', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', justifyContent: 'center' }}>
                <PlusCircle size={18} />
                {t.navPostListing}
              </Link>
            </>
          )}

          {!isSignedIn && (
            <SignInButton mode="modal">
              <button style={{ marginTop: 12, width: '100%', padding: 11, borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {t.navSignIn}
              </button>
            </SignInButton>
          )}
        </div>
      )}
    </header>
  );
}

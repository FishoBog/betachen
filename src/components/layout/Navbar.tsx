'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { PlusCircle, Heart, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'አማ'>('EN');

  const links = [
    { href: '/', label: lang === 'EN' ? 'Buy' : 'ግዛ', authOnly: false },
    { href: '/?type=long_rent', label: lang === 'EN' ? 'Rent' : 'ተከራይ', authOnly: false },
    { href: '/map', label: lang === 'EN' ? 'Map' : 'ካርታ', authOnly: false },
    { href: '/compare', label: lang === 'EN' ? 'Compare' : 'አወዳድር', authOnly: false },
    { href: '/owner/dashboard', label: lang === 'EN' ? 'My Listings' : 'ማስታወቂያዎቼ', authOnly: true },
    { href: '/messages', label: lang === 'EN' ? 'Messages' : 'መልዕክቶች', authOnly: true },
  ];

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8431A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 800 }}>ጎ</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: '#006AFF', letterSpacing: '-0.5px' }}>ጎጆ</span>
          <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Ethiopia</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(link => {
            if (link.authOnly && !isSignedIn) return null;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? '#E8431A' : '#374151',
                background: active ? '#fef2ee' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s'
              }}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Language switcher */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['EN', 'አማ'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: lang === l ? 'white' : 'transparent',
                color: lang === l ? '#006AFF' : '#6b7280',
                boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>{l}</button>
            ))}
          </div>

          {isSignedIn ? (
            <>
              <Link href="/favorites" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }}>
                <Heart size={20} />
              </Link>
              <Link href="/alerts" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }}>
                <Bell size={20} />
              </Link>
              <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                <PlusCircle size={16} />
                {lang === 'EN' ? 'Post Listing' : 'ዝርዝር ለጥፍ'}
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #d1d5db', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {lang === 'EN' ? 'Sign In' : 'ግባ'}
                </button>
              </SignInButton>
              <Link href="/sign-up" style={{ padding: '9px 18px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                {lang === 'EN' ? 'Join Free' : 'ተመዝገብ'}
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
          {links.map(link => {
            if (link.authOnly && !isSignedIn) return null;
            return (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                {link.label}
              </Link>
            );
          })}
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button style={{ marginTop: 12, width: '100%', padding: 11, borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {lang === 'EN' ? 'Sign In' : 'ግባ'}
              </button>
            </SignInButton>
          )}
        </div>
      )}
    </header>
  );
}

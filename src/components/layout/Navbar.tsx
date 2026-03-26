'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { PlusCircle, Heart, Bell, Menu, X, FileText, Shield, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';

const LOGO_URL = 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/gojo-logo-circle.svg';

export function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const links = [
    { href: '/',             label: lang === 'EN' ? '🏠 Buy'       : '🏠 ግዛ',        authOnly: false, external: false },
    { href: '/?type=long_rent', label: lang === 'EN' ? '🔑 Rent'   : '🔑 ተከራይ',     authOnly: false, external: false },
    { href: '/map',          label: lang === 'EN' ? '🗺️ Map'        : '🗺️ ካርታ',      authOnly: false, external: false },
    { href: '/market',       label: lang === 'EN' ? '📊 Market'    : '📊 ገበያ',       authOnly: false, external: false },
    { href: '/diaspora',     label: lang === 'EN' ? '🌍 Diaspora'  : '🌍 ዲያስፖራ',   authOnly: false, external: false },
    { href: 'https://t.me/GojoEthiopiaBot', label: '✈️ Telegram',  authOnly: false, external: true  },
    { href: '/contracts',    label: lang === 'EN' ? '📄 Contracts' : '📄 ውሎች',      authOnly: true,  external: false },
    { href: '/owner/dashboard', label: lang === 'EN' ? '📋 Listings' : '📋 ዝርዝሮች', authOnly: true,  external: false },
    { href: '/messages',     label: lang === 'EN' ? '💬 Messages'  : '💬 መልዕክቶች',  authOnly: true,  external: false },
  ];

  const navLinkStyle = (active: boolean, external?: boolean) => ({
    padding: '7px 11px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: external ? '#0088cc' : active ? '#E8431A' : '#374151',
    background: active ? '#fef2ee' : 'transparent',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '-0.1px',
  });

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img src={LOGO_URL} alt="ጎጆ Homes" style={{ height: 46, width: 'auto' }} />
        </Link>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'center' }}>
            {links.map(link => {
              if (link.authOnly && !isSignedIn) return null;
              const active = pathname === link.href;
              return link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={navLinkStyle(false, true)}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} style={navLinkStyle(active)}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* Language switcher */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['EN', 'AM'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '5px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: lang === l ? 'white' : 'transparent', color: lang === l ? '#006AFF' : '#6b7280', boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                {l === 'EN' ? 'EN' : 'አማ'}
              </button>
            ))}
          </div>

          {/* Desktop auth */}
          {!isMobile && isSignedIn && (
            <>
              <Link href="/favorites" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Favorites"><Heart size={20} /></Link>
              <Link href="/alerts" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Alerts"><Bell size={20} /></Link>
              <Link href="/contracts/new" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="New Contract"><FileText size={20} /></Link>
              <Link href="/owner/verify" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Get Verified"><Shield size={20} /></Link>
              <a href="https://t.me/GojoEthiopiaBot" target="_blank" rel="noopener noreferrer" style={{ padding: 8, borderRadius: 8, color: '#0088cc', display: 'flex', textDecoration: 'none' }} title="Telegram"><Send size={20} /></a>
              <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                <PlusCircle size={14} />{t.navPostListing}
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          )}

          {!isMobile && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t.navSignIn}
                </button>
              </SignInButton>
              <Link href="/sign-up" style={{ padding: '9px 14px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                {t.navJoin}
              </Link>
            </>
          )}

          {/* Mobile */}
          {isMobile && !isSignedIn && (
            <SignInButton mode="modal">
              <button style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #d1d5db', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t.navSignIn}
              </button>
            </SignInButton>
          )}

          {isMobile && isSignedIn && (
            <>
              <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                <PlusCircle size={14} /> Post
              </Link>
              <UserButton afterSignOutUrl="/" />
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
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['EN', 'AM'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: `2px solid ${lang === l ? '#006AFF' : '#e5e7eb'}`, background: lang === l ? '#006AFF' : 'white', color: lang === l ? 'white' : '#6b7280', cursor: 'pointer' }}>
                {l === 'EN' ? 'English' : 'አማርኛ'}
              </button>
            ))}
          </div>

          {links.map(link => {
            if (link.authOnly && !isSignedIn) return null;
            return link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#0088cc', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                {link.label}
              </Link>
            );
          })}

          {isSignedIn && (
            <>
              <Link href="/favorites" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Heart size={16} />{lang === 'EN' ? 'Favorites' : 'ተወዳጆች'}
              </Link>
              <Link href="/alerts" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Bell size={16} />{lang === 'EN' ? 'Alerts' : 'ማንቂያዎች'}
              </Link>
              <Link href="/owner/verify" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Shield size={16} />{lang === 'EN' ? 'Get Verified' : 'ተረጋግጥ'}
              </Link>
              <Link href="/contracts/new" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <FileText size={16} />{lang === 'EN' ? 'New Contract' : 'አዲስ ውል'}
              </Link>
              <a href="https://t.me/GojoEthiopiaBot" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#0088cc', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Send size={16} />{lang === 'EN' ? 'Telegram Bot' : 'ቴሌግራም ቦት'}
              </a>
              <Link href="/owner/listings/new" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '12px 16px', borderRadius: 10, background: '#E8431A', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', justifyContent: 'center' }}>
                <PlusCircle size={18} />{t.navPostListing}
              </Link>
            </>
          )}

          {!isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button style={{ marginTop: 12, width: '100%', padding: 12, borderRadius: 8, background: 'white', border: '1.5px solid #d1d5db', color: '#374151', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  {t.navSignIn}
                </button>
              </SignInButton>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} style={{ display: 'block', marginTop: 8, padding: '12px 16px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const }}>
                {t.navJoin}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
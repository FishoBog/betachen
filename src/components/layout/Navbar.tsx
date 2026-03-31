'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { PlusCircle, Heart, Bell, Menu, X, FileText, Shield, Send, Home, Key, Map, TrendingUp, Globe, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';

const LOGO_URL = 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/gojo-logo-circle.svg';

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const links = [
    { href: '/',                label: lang === 'EN' ? 'Buy'      : 'ግዛ',      icon: Home,       authOnly: false, external: false },
    { href: '/?type=long_rent', label: lang === 'EN' ? 'Rent'     : 'ተከራይ',   icon: Key,        authOnly: false, external: false },
    { href: '/map',             label: lang === 'EN' ? 'Map'       : 'ካርታ',    icon: Map,        authOnly: false, external: false },
    { href: '/market',          label: lang === 'EN' ? 'Market'   : 'ገበያ',     icon: TrendingUp, authOnly: false, external: false },
    { href: '/diaspora',        label: lang === 'EN' ? 'Diaspora' : 'ዲያስፖራ', icon: Globe,      authOnly: false, external: false },
    { href: '/owner/commercial/new', label: lang === 'EN' ? 'Commercial' : 'የንግድ ቤቶች', icon: Building2, authOnly: false, external: false },
    { href: 'https://t.me/GojoEthiopiaBot', label: 'Telegram',     icon: Send,       authOnly: false, external: true  },
    { href: '/contracts',       label: lang === 'EN' ? 'Contracts': 'ውሎች',    icon: FileText,   authOnly: true,  external: false },
    { href: '/owner/dashboard', label: lang === 'EN' ? 'Listings' : 'ዝርዝሮች', icon: Home,       authOnly: true,  external: false },
    { href: '/messages',        label: lang === 'EN' ? 'Messages' : 'መልዕክቶች', icon: Send,       authOnly: true,  external: false },
  ];

  const navLinkStyle = (active: boolean, external?: boolean) => ({
    padding: '9px 14px',
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: 700,
    color: external ? '#0088cc' : active ? '#E8431A' : '#4B5563',
    background: active ? '#fef2ee' : 'transparent',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.1px',
    display: 'flex',
    alignItems: 'center',
    border: active ? '1.5px solid #fcd9cc' : '1.5px solid transparent',
    transition: 'all 0.15s',
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
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {links.map(link => {
              if (link.authOnly && !isSignedIn) return null;
              const active = pathname === link.href;
              const Icon = link.icon;
              const content = (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={15} color={active ? '#E8431A' : link.external ? '#0088cc' : '#6B7280'} strokeWidth={2.2} />
                  <span style={{ fontSize: 14, fontWeight: active ? 700 : 600, color: active ? '#E8431A' : link.external ? '#0088cc' : '#374151' }}>
                    {link.label}
                  </span>
                </span>
              );
              return link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={navLinkStyle(false, true)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f9ff'; (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                  {content}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  style={navLinkStyle(active)}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; } }}>
                  {content}
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

          {/* Post Listing — always visible on desktop */}
          {!isMobile && (
            <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
              <PlusCircle size={14} />{t.navPostListing}
            </Link>
          )}

          {/* Desktop auth */}
          {!isMobile && isLoaded && isSignedIn && (
            <>
              <Link href="/favorites" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Favorites"><Heart size={20} /></Link>
              <Link href="/alerts" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Alerts"><Bell size={20} /></Link>
              <Link href="/contracts/new" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="New Contract"><FileText size={20} /></Link>
              <Link href="/owner/verify" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }} title="Get Verified"><Shield size={20} /></Link>
              <a href="https://t.me/GojoEthiopiaBot" target="_blank" rel="noopener noreferrer" style={{ padding: 8, borderRadius: 8, color: '#0088cc', display: 'flex', textDecoration: 'none' }} title="Telegram"><Send size={20} /></a>
              <UserButton afterSignOutUrl="/" />
            </>
          )}

          {!isMobile && isLoaded && !isSignedIn && (
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

          {/* Mobile Post Listing — always visible */}
          {isMobile && (
            <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
              <PlusCircle size={14} /> Post
            </Link>
          )}

          {/* Mobile auth */}
          {isMobile && isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #d1d5db', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t.navSignIn}
              </button>
            </SignInButton>
          )}

          {isMobile && isLoaded && isSignedIn && (
            <UserButton afterSignOutUrl="/" />
          )}

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && isMobile && (
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
            const Icon = link.icon;
            return link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#0088cc', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Icon size={16} />{link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Icon size={16} />{link.label}
              </Link>
            );
          })}

          {isLoaded && isSignedIn && (
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

          {isLoaded && !isSignedIn && (
            <>
              <Link href="/owner/listings/new" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '12px 16px', borderRadius: 10, background: '#E8431A', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', justifyContent: 'center' }}>
                <PlusCircle size={18} />{t.navPostListing}
              </Link>
              <SignInButton mode="modal">
                <button style={{ marginTop: 8, width: '100%', padding: 12, borderRadius: 8, background: 'white', border: '1.5px solid #d1d5db', color: '#374151', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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

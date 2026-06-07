'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton, SignOutButton } from '@clerk/nextjs';
import { PlusCircle, Heart, Menu, X, FileText, Shield, Send, Home, Key, Map, TrendingUp, Globe, Building2, Megaphone, ListChecks, LogOut, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';

const LOGO_URL = 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/betachen-logo.svg';

export function Navbar() {
  const { isSignedIn, isLoaded, user } = useUser();
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
    { href: '/',                              label: lang === 'EN' ? 'Buy'        : 'ግዛ',         icon: Home,      authOnly: false, external: false },
    { href: '/?type=long_rent',               label: lang === 'EN' ? 'Rent'       : 'ተከራይ',      icon: Key,       authOnly: false, external: false },
    { href: '/?commercial=true',              label: lang === 'EN' ? 'Commercial' : 'የንግድ ቤቶች', icon: Building2, authOnly: false, external: false },
    { href: '/map',                           label: lang === 'EN' ? 'Map'        : 'ካርታ',       icon: Map,       authOnly: false, external: false },
    { href: '/market',                        label: lang === 'EN' ? 'Market'     : 'ገበያ',        icon: TrendingUp,authOnly: false, external: false },
    { href: '/diaspora',                      label: lang === 'EN' ? 'Diaspora'   : 'ዲያስፖራ',    icon: Globe,     authOnly: false, external: false },
    { href: '/advertise',                     label: lang === 'EN' ? 'Advertise'  : 'ያስተዋውቁ',   icon: Megaphone, authOnly: false, external: false },
    { href: '/how-to-post',                   label: lang === 'EN' ? 'How to Post': 'እንዴት መለጠፍ', icon: ListChecks,authOnly: false, external: false },
    { href: 'https://t.me/BETACHENEthiopiaBot', label: 'Telegram',                icon: Send,      authOnly: false, external: true  },
    { href: '/owner/dashboard',               label: lang === 'EN' ? 'Listings'   : 'ዝርዝሮች',    icon: Home,      authOnly: true,  external: false },
    { href: '/messages',                      label: lang === 'EN' ? 'Messages'   : 'መልዕክቶች',   icon: Send,      authOnly: true,  external: false },
  ];

  const navLinkStyle = (active: boolean, external?: boolean) => ({
    padding: '9px 12px', borderRadius: 10, fontSize: 15, fontWeight: 700,
    color: external ? '#0088cc' : active ? '#E8431A' : '#4B5563',
    background: active ? '#fef2ee' : 'transparent',
    textDecoration: 'none', whiteSpace: 'nowrap' as const, letterSpacing: '0.1px',
    display: 'flex', alignItems: 'center',
    border: active ? '1.5px solid #fcd9cc' : '1.5px solid transparent',
    transition: 'all 0.15s',
  });

  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Account';

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ width: '100%', margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>

        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img src={LOGO_URL} alt="ቤታችን" style={{ height: 48, width: 'auto' }} />
        </Link>

        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'space-between', margin: '0 20px' }}>
            {links.map(link => {
              if (link.authOnly && !isSignedIn) return null;
              const active = pathname === link.href;
              const Icon = link.icon;
              const content = (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={19} color={active ? '#E8431A' : link.external ? '#0088cc' : '#6B7280'} strokeWidth={2.2} />
                  <span style={{ fontSize: 18, fontWeight: active ? 700 : 600, color: active ? '#E8431A' : link.external ? '#0088cc' : '#374151' }}>
                    {link.label}
                  </span>
                </span>
              );
              return link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                  style={navLinkStyle(false, true)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f9ff'; (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                  {content}
                </a>
              ) : (
                <Link key={link.href} href={link.href} style={navLinkStyle(active)}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; } }}>
                  {content}
                </Link>
              );
            })}
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['EN', 'AM'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '5px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: lang === l ? 'white' : 'transparent', color: lang === l ? '#006AFF' : '#6b7280', boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                {l === 'EN' ? 'EN' : 'አማ'}
              </button>
            ))}
          </div>

          {/* ── DESKTOP AUTH ── */}
          {!isMobile && (
            <>
              {isSignedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                    <PlusCircle size={14} />{t.navPostListing}
                  </Link>
                  <Link href="/favorites" title="Favorites" style={{ padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', textDecoration: 'none' }}>
                    <Heart size={20} />
                  </Link>
                  {/* User email pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 20, background: '#f0f6ff', border: '1.5px solid #dbeafe' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#006AFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {displayName}
                    </span>
                  </div>
                  {/* Explicit Sign Out button */}
                  <SignOutButton>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                      <LogOut size={14} /> {lang === 'EN' ? 'Sign Out' : 'ውጣ'}
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                    <PlusCircle size={14} />{t.navPostListing}
                  </Link>
                  <SignInButton mode="modal">
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1.5px solid #d1d5db', background: 'white', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                      <LogIn size={14} /> {t.navSignIn}
                    </button>
                  </SignInButton>
                  <Link href="/sign-up" style={{ padding: '9px 16px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                    {t.navJoin}
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ── MOBILE RIGHT SIDE ── */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                <PlusCircle size={14} /> Post
              </Link>
              <button onClick={() => setMenuOpen(o => !o)} style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && isMobile && (
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 24px 16px', background: 'white' }}>
          {/* Login state banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: isSignedIn ? '#f0f6ff' : '#f9fafb', border: `1px solid ${isSignedIn ? '#dbeafe' : '#e5e7eb'}`, marginBottom: 16 }}>
            {isSignedIn ? (
              <>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#006AFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{lang === 'EN' ? 'Signed in' : 'ገብተዋል'}</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{lang === 'EN' ? 'Browsing as Guest' : 'እንደ እንግዳ'}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{lang === 'EN' ? 'Sign in to unlock all features' : 'ሁሉንም ለመጠቀም ይግቡ'}</div>
                </div>
              </>
            )}
          </div>

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
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: pathname === link.href ? '#E8431A' : '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Icon size={16} color={pathname === link.href ? '#E8431A' : '#6b7280'} />{link.label}
              </Link>
            );
          })}

          {isSignedIn ? (
            <>
              <Link href="/favorites" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                <Heart size={16} color="#6b7280" />{lang === 'EN' ? 'Favorites' : 'ተወዳጆች'}
              </Link>
              <Link href="/owner/listings/new" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '12px 16px', borderRadius: 10, background: '#E8431A', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', justifyContent: 'center' }}>
                <PlusCircle size={18} />{t.navPostListing}
              </Link>
              <SignOutButton>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  <LogOut size={18} /> {lang === 'EN' ? 'Sign Out' : 'ውጣ'}
                </button>
              </SignOutButton>
            </>
          ) : (
            <>
              <Link href="/owner/listings/new" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '12px 16px', borderRadius: 10, background: '#E8431A', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', justifyContent: 'center' }}>
                <PlusCircle size={18} />{t.navPostListing}
              </Link>
              <SignInButton mode="modal">
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, width: '100%', padding: 12, borderRadius: 8, background: 'white', border: '1.5px solid #d1d5db', color: '#374151', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  <LogIn size={18} /> {t.navSignIn}
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

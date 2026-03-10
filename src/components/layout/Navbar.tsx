// src/components/layout/Navbar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { Home, PlusCircle, MessageSquare, LayoutDashboard, Map, Heart, Bell, BarChart2, GitCompare, Settings, Menu, X } from 'lucide-react';
import { am } from '@/i18n/am';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (href: string, icon: React.ElementType, label: string, authOnly = false) => {
    if (authOnly && !isSignedIn) return null;
    const Icon = icon;
    const active = pathname === href;
    return (
      <Link href={href}
        onClick={() => setMenuOpen(false)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          active
            ? 'text-white font-semibold'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        )}
        style={active ? { background: 'var(--coral)', fontFamily: 'var(--font-noto-ethiopic)' } : { fontFamily: 'var(--font-noto-ethiopic)' }}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ background: 'var(--navy)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ background: 'var(--coral)', fontFamily: 'var(--font-noto-ethiopic)' }}>ጎ</div>
          <span className="font-bold text-white text-xl hidden sm:block"
            style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>ጎጆ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLink('/', Home, am.nav.home)}
          {navLink('/map', Map, 'ካርታ')}
          {navLink('/compare', GitCompare, 'አወዳድር')}
          {navLink('/favorites', Heart, 'የተቀመጡ', true)}
          {navLink('/alerts', Bell, 'ማስታወቂያ', true)}
          {navLink('/owner/dashboard', LayoutDashboard, am.nav.myListings, true)}
          {navLink('/messages', MessageSquare, am.nav.messages, true)}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link href="/owner/listings/new"
                className="hidden md:flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--coral)', fontFamily: 'var(--font-noto-ethiopic)' }}>
                <PlusCircle className="w-4 h-4" />
                {am.nav.postListing}
              </Link>
              <Link href="/settings"
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors hidden md:flex">
                <Settings className="w-5 h-5" />
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--coral)', fontFamily: 'var(--font-noto-ethiopic)' }}>
                {am.nav.signIn}
              </button>
            </SignInButton>
          )}
          <button
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--navy)' }}>
          {navLink('/', Home, am.nav.home)}
          {navLink('/map', Map, 'ካርታ')}
          {navLink('/compare', GitCompare, 'አወዳድር')}
          {navLink('/favorites', Heart, 'የተቀመጡ', true)}
          {navLink('/alerts', Bell, 'ማስታወቂያ', true)}
          {navLink('/owner/dashboard', LayoutDashboard, am.nav.myListings, true)}
          {navLink('/messages', MessageSquare, am.nav.messages, true)}
          {navLink('/settings', Settings, 'ቅንብሮች', true)}
          {isSignedIn && (
            <Link href="/owner/listings/new"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-semibold mt-2"
              style={{ background: 'var(--coral)', fontFamily: 'var(--font-noto-ethiopic)' }}>
              <PlusCircle className="w-4 h-4" />
              {am.nav.postListing}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

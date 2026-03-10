// src/app/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { SearchFilters } from '@/components/property/SearchFilters';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { am } from '@/i18n/am';
import Link from 'next/link';
import { MapPin, TrendingUp, Shield, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)' }}>
      <Navbar />

      {/* Hero — Redfin-style full-width with search overlay */}
      <section className="relative overflow-hidden" style={{ background: 'var(--navy)', minHeight: '420px' }}>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #E8431A 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #00A699 0%, transparent 50%)`
          }} />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">

          {/* Brand mark */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'var(--coral)' }}>
              <span style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>ጎ</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>
              ጎጆ
            </h1>
          </div>

          <p className="text-white/70 text-lg md:text-xl mb-3 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>
            {am.brand.tagline}
          </p>
          <p className="text-white/50 text-sm mb-10">
            Addis Ababa's trusted real estate marketplace
          </p>

          {/* Listing type tabs — Zillow style */}
          <div className="inline-flex rounded-xl p-1 mb-8" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {[
              { label: am.search.forSale, emoji: '🏠', color: 'var(--navy)' },
              { label: am.search.longRent, emoji: '🔑', color: 'var(--teal)' },
              { label: am.search.shortRent, emoji: '📅', color: 'var(--coral)' },
            ].map(({ label, emoji, color }) => (
              <span key={label}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-default"
                style={{ fontFamily: 'var(--font-noto-ethiopic)' }}>
                {emoji} {label}
              </span>
            ))}
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-8 text-white/60 text-sm">
            {[
              { icon: MapPin, label: 'Addis Ababa' },
              { icon: Shield, label: 'Verified listings' },
              { icon: TrendingUp, label: 'Updated daily' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Search pulled up — Zillow overlapping style */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2DDD5] p-5 mb-8">
          <SearchFilters />
        </div>
      </div>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--navy)', fontFamily: 'var(--font-noto-ethiopic)' }}>
              {am.search.results}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Addis Ababa, Ethiopia</p>
          </div>
          <Link href="/map"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-[#E2DDD5] hover:border-[#0A2342] transition-colors"
            style={{ color: 'var(--navy)' }}>
            <MapPin className="w-4 h-4" />
            Map View
          </Link>
        </div>

        <PropertyGrid />
      </main>
    </div>
  );
}

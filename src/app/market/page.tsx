'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { TrendingUp, TrendingDown, BarChart2, Home, ArrowRight, MapPin, RefreshCw } from 'lucide-react';

type SubcityStats = {
  subcity: string;
  type: string;
  listing_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  active_count: number;
  sold_count: number;
  rented_count: number;
};

type SummaryStats = {
  total: number;
  active: number;
  sold: number;
  rented: number;
  pending: number;
  avgSalePrice: number;
  avgRentPrice: number;
  topSubcity: string;
  totalValue: number;
};

function formatETB(n: number) {
  if (!n) return 'N/A';
  if (n >= 1000000) return `ETB ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `ETB ${(n / 1000).toFixed(0)}K`;
  return `ETB ${n.toLocaleString()}`;
}

function BarChart({ data, maxValue, color }: { data: { label: string; value: number; count: number }[]; maxValue: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(item => (
        <div key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.label || 'Unknown'}</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{formatETB(item.value)} • {item.count} listings</span>
          </div>
          <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, background: color, borderRadius: 5, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketPage() {
  const [stats, setStats] = useState<SubcityStats[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sale' | 'long_rent' | 'short_rent'>('sale');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createBrowserClient();

    // Get all properties for stats
    const { data: properties } = await supabase
      .from('properties')
      .select('subcity, type, price, status, created_at, location')
      .gt('price', 0);

    if (!properties) { setLoading(false); return; }

    // Calculate summary
    const total = properties.length;
    const active = properties.filter(p => p.status === 'active').length;
    const sold = properties.filter(p => p.status === 'sold').length;
    const rented = properties.filter(p => p.status === 'rented').length;
    const pending = properties.filter(p => p.status === 'pending_review').length;

    const saleProps = properties.filter(p => p.type === 'sale' && p.price > 0);
    const rentProps = properties.filter(p => p.type === 'long_rent' && p.price > 0);

    const avgSalePrice = saleProps.length > 0
      ? saleProps.reduce((sum, p) => sum + p.price, 0) / saleProps.length : 0;
    const avgRentPrice = rentProps.length > 0
      ? rentProps.reduce((sum, p) => sum + p.price, 0) / rentProps.length : 0;

    const totalValue = saleProps.reduce((sum, p) => sum + p.price, 0);

    // Top subcity
    const subcityCounts: Record<string, number> = {};
    properties.forEach(p => {
      const key = p.subcity || p.location || 'Unknown';
      subcityCounts[key] = (subcityCounts[key] || 0) + 1;
    });
    const topSubcity = Object.entries(subcityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    setSummary({ total, active, sold, rented, pending, avgSalePrice, avgRentPrice, topSubcity, totalValue });

    // Calculate subcity stats
    const subcityMap: Record<string, { prices: number[]; count: number; type: string }> = {};
    properties.forEach(p => {
      const key = `${p.subcity || p.location || 'Unknown'}_${p.type}`;
      if (!subcityMap[key]) subcityMap[key] = { prices: [], count: 0, type: p.type };
      subcityMap[key].prices.push(p.price);
      subcityMap[key].count++;
    });

    const statsData: SubcityStats[] = Object.entries(subcityMap).map(([key, val]) => {
      const [subcity] = key.split('_');
      const avg = val.prices.reduce((s, p) => s + p, 0) / val.prices.length;
      return {
        subcity,
        type: val.type,
        listing_count: val.count,
        avg_price: avg,
        min_price: Math.min(...val.prices),
        max_price: Math.max(...val.prices),
        active_count: 0,
        sold_count: 0,
        rented_count: 0,
      };
    });

    setStats(statsData);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  const filteredStats = stats
    .filter(s => s.type === activeTab && s.subcity && s.subcity !== 'Unknown')
    .sort((a, b) => b.avg_price - a.avg_price)
    .slice(0, 10);

  const maxPrice = filteredStats.length > 0 ? Math.max(...filteredStats.map(s => s.avg_price)) : 1;

  const barData = filteredStats.map(s => ({
    label: s.subcity.split('/')[1]?.trim() || s.subcity,
    value: s.avg_price,
    count: s.listing_count,
  }));

  const tabColors = { sale: '#006AFF', long_rent: '#059669', short_rent: '#d97706' };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #006AFF, #0047CC)', padding: '48px 24px 52px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                <BarChart2 size={14} color="white" />
                <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>LIVE MARKET DATA</span>
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-1px' }}>
                Ethiopia Real Estate<br />Market Trends
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
                Live data from ቤታችን listings across all Ethiopian cities
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw size={14} /> Refresh Data
              </button>
              {lastUpdated && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Updated: {lastUpdated}</div>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <BarChart2 size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>Loading market data...</div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            {summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Total Listings', value: summary.total.toLocaleString(), icon: '🏠', color: '#006AFF', bg: '#dbeafe', sub: 'All time' },
                  { label: 'Active Now', value: summary.active.toLocaleString(), icon: '✅', color: '#059669', bg: '#d1fae5', sub: 'Live listings' },
                  { label: 'Sold', value: summary.sold.toLocaleString(), icon: '🤝', color: '#7c3aed', bg: '#ede9fe', sub: 'Completed sales' },
                  { label: 'Rented', value: summary.rented.toLocaleString(), icon: '🔑', color: '#d97706', bg: '#fef3c7', sub: 'Occupied rentals' },
                  { label: 'Avg Sale Price', value: formatETB(summary.avgSalePrice), icon: '💰', color: '#E8431A', bg: '#fef2ee', sub: 'Per property' },
                  { label: 'Avg Rent/mo', value: formatETB(summary.avgRentPrice), icon: '📅', color: '#0891b2', bg: '#cffafe', sub: 'Monthly rate' },
                  { label: 'Top Area', value: summary.topSubcity.split('/')[0]?.trim() || summary.topSubcity, icon: '📍', color: '#374151', bg: '#f3f4f6', sub: 'Most listings' },
                  { label: 'Total Value', value: formatETB(summary.totalValue), icon: '📊', color: '#065f46', bg: '#d1fae5', sub: 'Sale listings' },
                ].map(card => (
                  <div key={card.label} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        {card.icon}
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: card.color, marginBottom: 2, letterSpacing: '-0.5px' }}>{card.value}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 2 }}>{card.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{card.sub}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Price by subcity chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

              {/* Bar chart */}
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 2 }}>
                      Average Price by Area
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      Top 10 areas by average listing price
                    </div>
                  </div>
                  {/* Tab switcher */}
                  <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, gap: 4 }}>
                    {([['sale', 'For Sale'], ['long_rent', 'For Rent'], ['short_rent', 'Short Stay']] as const).map(([val, label]) => (
                      <button key={val} onClick={() => setActiveTab(val)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        background: activeTab === val ? 'white' : 'transparent',
                        color: activeTab === val ? tabColors[val] : '#6b7280',
                        boxShadow: activeTab === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}>{label}</button>
                    ))}
                  </div>
                </div>

                {barData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                    <BarChart2 size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                    <div style={{ fontSize: 14 }}>No data yet for this category</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Data will appear as listings are added</div>
                  </div>
                ) : (
                  <BarChart data={barData} maxValue={maxPrice} color={tabColors[activeTab]} />
                )}
              </div>

              {/* Type distribution */}
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Listing Types</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Distribution of all listings</div>

                {summary && (() => {
                  const saleCount = stats.filter(s => s.type === 'sale').reduce((sum, s) => sum + s.listing_count, 0);
                  const rentCount = stats.filter(s => s.type === 'long_rent').reduce((sum, s) => sum + s.listing_count, 0);
                  const shortCount = stats.filter(s => s.type === 'short_rent').reduce((sum, s) => sum + s.listing_count, 0);
                  const total = saleCount + rentCount + shortCount || 1;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        { label: 'For Sale', count: saleCount, color: '#006AFF', bg: '#dbeafe', emoji: '🏠' },
                        { label: 'For Rent', count: rentCount, color: '#059669', bg: '#d1fae5', emoji: '🔑' },
                        { label: 'Short Stay', count: shortCount, color: '#d97706', bg: '#fef3c7', emoji: '🛏️' },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{item.emoji}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.label}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.count}</span>
                              <span style={{ fontSize: 11, color: '#9ca3af', background: item.bg, padding: '2px 8px', borderRadius: 10 }}>
                                {((item.count / total) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(item.count / total) * 100}%`, background: item.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      ))}

                      {/* Donut visualization */}
                      <div style={{ marginTop: 12, padding: '16px', background: '#f9fafb', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#111827' }}>{total}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>TOTAL LISTINGS</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Price ranges table */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Price Ranges by Area</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Min, average, and max prices for {activeTab === 'sale' ? 'sale' : activeTab === 'long_rent' ? 'rental' : 'short stay'} properties</div>

              {filteredStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
                  No data yet — will populate as listings are added
                </div>
              ) : (
                <div style={{ overflowX: 'auto' as const }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                        {['Area', 'Listings', 'Min Price', 'Avg Price', 'Max Price', 'Value Range'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats.map((s, i) => (
                        <tr key={s.subcity} style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <MapPin size={12} color="#E8431A" />
                              {s.subcity.split('/')[1]?.trim() || s.subcity}
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontSize: 13, color: '#374151' }}>
                            <span style={{ background: '#f0f6ff', color: '#006AFF', padding: '3px 10px', borderRadius: 10, fontWeight: 700 }}>{s.listing_count}</span>
                          </td>
                          <td style={{ padding: '12px', fontSize: 13, color: '#059669', fontWeight: 600 }}>{formatETB(s.min_price)}</td>
                          <td style={{ padding: '12px', fontSize: 14, fontWeight: 800, color: tabColors[activeTab] }}>{formatETB(s.avg_price)}</td>
                          <td style={{ padding: '12px', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{formatETB(s.max_price)}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                              <span style={{ color: '#059669' }}>{formatETB(s.min_price)}</span>
                              <span>→</span>
                              <span style={{ color: '#dc2626' }}>{formatETB(s.max_price)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Market insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                {
                  title: '📈 Market Opportunity',
                  color: '#059669', bg: '#f0fdf4', border: '#bbf7d0',
                  content: summary && summary.total > 0
                    ? `${summary.active} active listings available now across Ethiopia. Average sale price is ${formatETB(summary.avgSalePrice)}.`
                    : 'Start listing properties to see market insights here.'
                },
                {
                  title: '🏆 Most Active Area',
                  color: '#006AFF', bg: '#f0f6ff', border: '#dbeafe',
                  content: summary
                    ? `${summary.topSubcity} has the highest number of listings, making it the most active real estate market on ቤታችን.`
                    : 'Data will appear as listings are added.'
                },
                {
                  title: '💡 Investment Insight',
                  color: '#d97706', bg: '#fffbeb', border: '#fde68a',
                  content: summary && summary.avgRentPrice > 0
                    ? `Average rental yield: ETB ${formatETB(summary.avgRentPrice)}/month. Long-term rentals make up a significant portion of listings.`
                    : 'Rental yield data will appear as more listings are added.'
                },
              ].map(insight => (
                <div key={insight.title} style={{ background: insight.bg, borderRadius: 14, border: `1px solid ${insight.border}`, padding: '20px 24px' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: insight.color, marginBottom: 10 }}>{insight.title}</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{insight.content}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
                  Want to be part of this market?
                </div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  List your property on ቤታችን and reach thousands of buyers and renters across Ethiopia
                </div>
              </div>
              <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#E8431A', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                Post a Listing <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

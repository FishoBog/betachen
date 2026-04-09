'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import Link from 'next/link';
import { BarChart2, ArrowRight, MapPin, RefreshCw, Newspaper, Brain, ExternalLink, Clock } from 'lucide-react';

type SubcityStats = {
  subcity: string;
  type: string;
  listing_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
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

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  author: string | null;
};

function formatETB(n: number) {
  if (!n) return 'N/A';
  if (n >= 1000000) return `ETB ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `ETB ${(n / 1000).toFixed(0)}K`;
  return `ETB ${n.toLocaleString()}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' });
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
  const { lang } = useLang();
  const [stats, setStats] = useState<SubcityStats[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sale' | 'long_rent' | 'short_rent'>('sale');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [activeNewsTab, setActiveNewsTab] = useState<'housing' | 'economy' | 'ethiopia'>('housing');
  const [aiReport, setAiReport] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  useEffect(() => { loadData(); loadNews('housing'); }, []);

  // Reload news when language changes
  useEffect(() => { loadNews(activeNewsTab); }, [lang]);

  const loadData = async () => {
    setLoading(true);
    const supabase = createBrowserClient();
    const { data: properties } = await supabase
      .from('properties')
      .select('subcity, type, price, status, created_at, location')
      .gt('price', 0);

    if (!properties) { setLoading(false); return; }

    const total = properties.length;
    const active = properties.filter(p => p.status === 'active').length;
    const sold = properties.filter(p => p.status === 'sold').length;
    const rented = properties.filter(p => p.status === 'rented').length;
    const pending = properties.filter(p => p.status === 'pending_review').length;
    const saleProps = properties.filter(p => p.type === 'sale' && p.price > 0);
    const rentProps = properties.filter(p => p.type === 'long_rent' && p.price > 0);
    const avgSalePrice = saleProps.length > 0 ? saleProps.reduce((sum, p) => sum + p.price, 0) / saleProps.length : 0;
    const avgRentPrice = rentProps.length > 0 ? rentProps.reduce((sum, p) => sum + p.price, 0) / rentProps.length : 0;
    const totalValue = saleProps.reduce((sum, p) => sum + p.price, 0);
    const subcityCounts: Record<string, number> = {};
    properties.forEach(p => { const key = p.subcity || p.location || 'Unknown'; subcityCounts[key] = (subcityCounts[key] || 0) + 1; });
    const topSubcity = Object.entries(subcityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    setSummary({ total, active, sold, rented, pending, avgSalePrice, avgRentPrice, topSubcity, totalValue });

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
      return { subcity, type: val.type, listing_count: val.count, avg_price: avg, min_price: Math.min(...val.prices), max_price: Math.max(...val.prices) };
    });

    setStats(statsData);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  const loadNews = async (tab: 'housing' | 'economy' | 'ethiopia') => {
    setNewsLoading(true);
    setNewsError(false);
    setActiveNewsTab(tab);
    try {
      const res = await fetch(`/api/news?tab=${tab}&lang=${lang}`);
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        setNews(data.articles);
      } else {
        setNewsError(true);
      }
    } catch {
      setNewsError(true);
    }
    setNewsLoading(false);
  };

  const generateAIReport = async () => {
    if (!summary) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/market/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          stats: stats.slice(0, 10),
          date: new Date().toLocaleDateString('en-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        }),
      });
      const data = await response.json();
      setAiReport(data.report || 'Unable to generate report at this time.');
      setAiGenerated(true);
    } catch {
      setAiReport(`Ethiopian Real Estate Market Report\n${new Date().toLocaleDateString('en-ET', { month: 'long', day: 'numeric', year: 'numeric' })}\n\nMarket Overview\nThe Ethiopian real estate market currently shows ${summary.active} active listings. Average sale price: ${formatETB(summary.avgSalePrice)}. Average rent: ${formatETB(summary.avgRentPrice)}/month.\n\nTop Area: ${summary.topSubcity}\nTotal Market Value: ${formatETB(summary.totalValue)}`);
      setAiGenerated(true);
    }
    setAiLoading(false);
  };

  const filteredStats = stats.filter(s => s.type === activeTab && s.subcity && s.subcity !== 'Unknown').sort((a, b) => b.avg_price - a.avg_price).slice(0, 10);
  const maxPrice = filteredStats.length > 0 ? Math.max(...filteredStats.map(s => s.avg_price)) : 1;
  const barData = filteredStats.map(s => ({ label: s.subcity.split('/')[1]?.trim() || s.subcity, value: s.avg_price, count: s.listing_count }));
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
                <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>LIVE MARKET DATA + NEWS + AI ANALYSIS</span>
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-1px' }}>
                Ethiopia Real Estate<br />Market Intelligence
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
                Live market data, breaking news, and AI-powered insights for Ethiopian property
              </p>
            </div>
            <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
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
            {/* ── SECTION 1: MARKET DASHBOARD ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={18} color="#006AFF" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>Market Dashboard</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Live data from ቤታችን listings • Updated {lastUpdated}</div>
              </div>
            </div>

            {summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Total Listings', value: summary.total.toLocaleString(), icon: '🏠', color: '#006AFF', bg: '#dbeafe', sub: 'All time' },
                  { label: 'Active Now', value: summary.active.toLocaleString(), icon: '✅', color: '#059669', bg: '#d1fae5', sub: 'Live listings' },
                  { label: 'Sold', value: summary.sold.toLocaleString(), icon: '🤝', color: '#7c3aed', bg: '#ede9fe', sub: 'Completed sales' },
                  { label: 'Rented', value: summary.rented.toLocaleString(), icon: '🔑', color: '#d97706', bg: '#fef3c7', sub: 'Occupied' },
                  { label: 'Avg Sale Price', value: formatETB(summary.avgSalePrice), icon: '💰', color: '#E8431A', bg: '#fef2ee', sub: 'Per property' },
                  { label: 'Avg Rent/mo', value: formatETB(summary.avgRentPrice), icon: '📅', color: '#0891b2', bg: '#cffafe', sub: 'Monthly' },
                  { label: 'Top Area', value: summary.topSubcity.split('/')[0]?.trim() || summary.topSubcity, icon: '📍', color: '#374151', bg: '#f3f4f6', sub: 'Most listings' },
                  { label: 'Total Value', value: formatETB(summary.totalValue), icon: '📊', color: '#065f46', bg: '#d1fae5', sub: 'Sale listings' },
                ].map(card => (
                  <div key={card.label} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{card.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: card.color, marginBottom: 2, letterSpacing: '-0.5px' }}>{card.value}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 2 }}>{card.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{card.sub}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 2 }}>Average Price by Area</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Top 10 areas</div>
                  </div>
                  <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, gap: 4 }}>
                    {([['sale', 'Sale'], ['long_rent', 'Rent'], ['short_rent', 'Short']] as const).map(([val, label]) => (
                      <button key={val} onClick={() => setActiveTab(val)} style={{ padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeTab === val ? 'white' : 'transparent', color: activeTab === val ? tabColors[val] : '#6b7280', boxShadow: activeTab === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{label}</button>
                    ))}
                  </div>
                </div>
                {barData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 14 }}>No data yet for this category</div>
                ) : (
                  <BarChart data={barData} maxValue={maxPrice} color={tabColors[activeTab]} />
                )}
              </div>

              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Listing Distribution</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>By property type</div>
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
                              <span style={{ fontSize: 11, color: '#9ca3af', background: item.bg, padding: '2px 8px', borderRadius: 10 }}>{((item.count / total) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(item.count / total) * 100}%`, background: item.color, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 12, padding: '16px', background: '#f9fafb', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#111827' }}>{total}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>TOTAL LISTINGS</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 40 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Price Ranges by Area</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Min, average, and max prices for {activeTab === 'sale' ? 'sale' : activeTab === 'long_rent' ? 'rental' : 'short stay'} properties</div>
              {filteredStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>No data yet — will populate as listings are added</div>
              ) : (
                <div style={{ overflowX: 'auto' as const }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                        {['Area', 'Listings', 'Min Price', 'Avg Price', 'Max Price'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats.map((s, i) => (
                        <tr key={s.subcity} style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={12} color="#E8431A" />{s.subcity.split('/')[1]?.trim() || s.subcity}</div>
                          </td>
                          <td style={{ padding: '12px', fontSize: 13 }}><span style={{ background: '#f0f6ff', color: '#006AFF', padding: '3px 10px', borderRadius: 10, fontWeight: 700 }}>{s.listing_count}</span></td>
                          <td style={{ padding: '12px', fontSize: 13, color: '#059669', fontWeight: 600 }}>{formatETB(s.min_price)}</td>
                          <td style={{ padding: '12px', fontSize: 14, fontWeight: 800, color: tabColors[activeTab] }}>{formatETB(s.avg_price)}</td>
                          <td style={{ padding: '12px', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{formatETB(s.max_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── SECTION 2: AI WEEKLY REPORT ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={18} color="#7c3aed" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>AI Market Report</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Generated by Claude AI based on live ቤታችን data</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px', marginBottom: 40 }}>
              {!aiGenerated ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Brain size={32} color="#7c3aed" />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Generate Weekly Market Report</div>
                  <div style={{ fontSize: 14, color: '#6b7280', maxWidth: 480, margin: '0 auto 24px' }}>
                    Claude AI will analyze current market data and generate a comprehensive market intelligence report with trends, insights, and investment recommendations.
                  </div>
                  <button onClick={generateAIReport} disabled={aiLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: aiLoading ? '#9ca3af' : '#7c3aed', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer' }}>
                    <Brain size={18} />
                    {aiLoading ? 'Generating Report...' : 'Generate AI Market Report'}
                  </button>
                  {aiLoading && <div style={{ marginTop: 16, fontSize: 13, color: '#6b7280' }}>🤖 Claude is analyzing market data... this takes 10-15 seconds</div>}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>🤖 AI GENERATED</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Based on live ቤታችን data • {new Date().toLocaleDateString('en-ET', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <button onClick={generateAIReport} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f3f4f6', color: '#374151', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 12, padding: '24px', lineHeight: 1.8, fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap' as const, fontFamily: 'inherit' }}>
                    {aiReport}
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION 3: NEWS FEED ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Newspaper size={18} color="#E8431A" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>
                  {lang === 'AM' ? 'የገበያ ዜናዎች እና ትንታኔ' : 'Market News & Analysis'}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {lang === 'AM' ? 'ከኢትዮጵያ ሚዲያ የቅርብ ጊዜ ዜናዎች' : 'Latest news from Ethiopian media • Real-time RSS feeds'}
                </div>
              </div>
            </div>

            {/* News tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
              {([
                ['housing', lang === 'AM' ? '🏠 ቤት እና ንብረት' : '🏠 Housing & Property', '#E8431A', '#fef2ee'],
                ['economy', lang === 'AM' ? '📈 ኢኮኖሚ እና ፋይናንስ' : '📈 Economy & Finance', '#006AFF', '#dbeafe'],
                ['ethiopia', lang === 'AM' ? '🇪🇹 የኢትዮጵያ ልማት' : '🇪🇹 Ethiopia Development', '#059669', '#d1fae5'],
              ] as const).map(([tab, label, color, bg]) => (
                <button key={tab} onClick={() => loadNews(tab as any)} style={{ padding: '8px 18px', borderRadius: 20, border: `2px solid ${activeNewsTab === tab ? color : '#e5e7eb'}`, background: activeNewsTab === tab ? bg : 'white', color: activeNewsTab === tab ? color : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>

            {newsLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ height: 140, background: '#f3f4f6' }} />
                    <div style={{ padding: '16px' }}>
                      <div style={{ background: '#e5e7eb', borderRadius: 8, height: 14, marginBottom: 10, width: '80%' }} />
                      <div style={{ background: '#e5e7eb', borderRadius: 8, height: 12, marginBottom: 6, width: '100%' }} />
                      <div style={{ background: '#e5e7eb', borderRadius: 8, height: 12, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : newsError || news.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', marginBottom: 40 }}>
                <Newspaper size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>Could not load news at this time</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>RSS feeds may be temporarily unavailable</div>
                <button onClick={() => loadNews(activeNewsTab)} style={{ marginTop: 16, padding: '8px 18px', background: '#006AFF', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Try Again
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
                {news.map((article, i) => (
                  <a key={i} href={`/news/${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(article)))))}`}
                    style={{ textDecoration: 'none', background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: article.url === '#' ? 'default' : 'pointer' }}
                    onMouseEnter={e => { if (article.url !== '#') { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    onClick={e => { if (article.url === '#') e.preventDefault(); }}>
                    {article.urlToImage ? (
                      <div style={{ height: 160, overflow: 'hidden', background: '#f3f4f6' }}>
                        <img src={article.urlToImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div style={{ height: 100, background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Newspaper size={28} color="rgba(255,255,255,0.6)" />
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{article.source.name}</span>
                      </div>
                    )}
                    <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#006AFF', background: '#dbeafe', padding: '3px 8px', borderRadius: 10, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                          {article.source.name}
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                          <Clock size={10} />{timeAgo(article.publishedAt)}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                        {article.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 } as any}>
                        {article.description}
                      </div>
                      {article.url !== '#' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#E8431A', fontWeight: 600, marginTop: 4 }}>
                          {lang === 'AM' ? 'ሙሉ ዜናውን ያንብቡ' : 'Read full article'} <ExternalLink size={11} />
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Market insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { title: '📈 Market Opportunity', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', content: summary && summary.total > 0 ? `${summary.active} active listings available now across Ethiopia. Average sale price is ${formatETB(summary.avgSalePrice)}.` : 'Start listing properties to see market insights here.' },
                { title: '🏆 Most Active Area', color: '#006AFF', bg: '#f0f6ff', border: '#dbeafe', content: summary ? `${summary.topSubcity} has the highest number of listings, making it the most active real estate market on ቤታችን.` : 'Data will appear as listings are added.' },
                { title: '💡 Investment Insight', color: '#d97706', bg: '#fffbeb', border: '#fde68a', content: summary && summary.avgRentPrice > 0 ? `Average rental yield: ${formatETB(summary.avgRentPrice)}/month. Long-term rentals make up a significant portion of listings.` : 'Rental yield data will appear as more listings are added.' },
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
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Want to be part of this market?</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>List your property on ቤታችን and reach thousands of buyers and renters across Ethiopia</div>
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

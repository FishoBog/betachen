'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { ExternalLink, ArrowLeft, Clock, Globe, Home, MapPin, Brain } from 'lucide-react';
import Link from 'next/link';

function formatETB(n: number) {
  if (!n) return 'Negotiable';
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
  return new Date(dateStr).toLocaleDateString('en-ET', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const encoded = params.id as string;
      const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
      const decoded = JSON.parse(jsonStr);
      setArticle(decoded);
      loadRelatedProperties();
      // Translate if language is AM
      if (lang === 'AM') translateArticle(decoded);
    } catch {
      router.push('/market');
    }
    setLoading(false);
  }, [params.id]);

  const loadRelatedProperties = async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('properties')
      .select('id, title, price, currency, type, location, images, price_negotiable')
      .eq('status', 'active')
      .limit(3);
    setRelatedProperties(data ?? []);
  };

  const generateAISummary = async () => {
    if (!article) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/news/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          source: article.source?.name,
        }),
      });
      const data = await response.json();
      setAiSummary(data.analysis || 'Unable to generate analysis.');
    } catch {
      setAiSummary('Unable to generate analysis at this time.');
    }
    setAiLoading(false);
  };

  if (loading || !article) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>Loading article...</div>
      </div>
    );
  }

  const typeColors: Record<string, { bg: string; color: string; label: string }> = {
    sale: { bg: '#dbeafe', color: '#1d4ed8', label: 'For Sale' },
    long_rent: { bg: '#d1fae5', color: '#065f46', label: 'For Rent' },
    short_rent: { bg: '#fef3c7', color: '#92400e', label: 'Short Stay' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* Back button */}
        <button onClick={() => router.push('/market')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={16} /> Back to Market
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

          {/* Main article */}
          <div>
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              {article.urlToImage ? (
                <div style={{ height: 280, overflow: 'hidden', background: '#f3f4f6' }}>
                  <img src={article.urlToImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                </div>
              ) : (
                <div style={{ height: 160, background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Globe size={40} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{article.source?.name}</span>
                </div>
              )}

              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#006AFF', background: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                    {article.source?.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {timeAgo(article.publishedAt)}
                  </span>
                  {article.author && (
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>By {article.author}</span>
                  )}
                </div>

                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1.3, marginBottom: 16 }}>
                  {article.title}
                </h1>

                <div style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, marginBottom: 24, padding: '20px', background: '#f9fafb', borderRadius: 12, borderLeft: '4px solid #006AFF' }}>
                  {article.description}
                </div>

                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  Read Full Article at {article.source?.name} <ExternalLink size={15} />
                </a>
              </div>
            </div>

            {/* AI Analysis */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} color="#7c3aed" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>AI Market Analysis</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>What this means for Ethiopian real estate</div>
                </div>
              </div>

              {!aiSummary ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                    Get an AI-powered analysis of how this news affects the Ethiopian property market
                  </div>
                  <button onClick={generateAISummary} disabled={aiLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: aiLoading ? '#9ca3af' : '#7c3aed', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer' }}>
                    <Brain size={16} />
                    {aiLoading ? 'Analyzing...' : 'Generate Market Analysis'}
                  </button>
                  {aiLoading && <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>🤖 Claude is analyzing this article...</div>}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, background: '#f9fafb', borderRadius: 12, padding: '20px' }}>
  {aiSummary.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h3 key={i} style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8, marginTop: 16 }}>{line.replace('## ', '')}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} style={{ fontSize: 17, fontWeight: 900, color: '#111827', marginBottom: 10, marginTop: 4 }}>{line.replace('# ', '')}</h2>;
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    return <p key={i} style={{ margin: '0 0 8px', color: '#374151' }}>{line}</p>;
  })}
</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 4 }}>🏠 Related Properties</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>Active listings on ቤታችን</div>

              {relatedProperties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>No active listings yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {relatedProperties.map(p => {
                    const tc = typeColors[p.type] ?? typeColors.sale;
                    return (
                      <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden', display: 'block' }}>
                        {p.images?.[0] ? (
                          <div style={{ height: 100, overflow: 'hidden', background: '#f3f4f6' }}>
                            <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ height: 80, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Home size={28} color="#93c5fd" />
                          </div>
                        )}
                        <div style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: tc.color, background: tc.bg, padding: '2px 8px', borderRadius: 10 }}>{tc.label}</span>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 6, marginBottom: 4, lineHeight: 1.3 }}>{p.title}</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#006AFF' }}>{p.price_negotiable ? 'Negotiable' : formatETB(p.price)}</div>
                          {p.location && (
                            <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                              <MapPin size={10} color="#E8431A" />{p.location}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, background: '#f9fafb', color: '#006AFF', fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid #dbeafe' }}>
                    View All Listings →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


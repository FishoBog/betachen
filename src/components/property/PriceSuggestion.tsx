'use client';
import { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

type Estimate = {
  suggested_price: number;
  price_range_min: number;
  price_range_max: number;
  confidence: 'high' | 'medium' | 'low';
  currency: string;
  unit: string;
  reasoning: string;
  reasoning_am: string;
  factors_positive: string[];
  factors_negative: string[];
  market_insight: string;
  comparable_count: number;
};

type Props = {
  propertyData: any;
  imageUrls?: string[];
  onUsePrice?: (price: number) => void;
};

const CONFIDENCE_COLORS = {
  high: { color: '#059669', bg: '#d1fae5', label: 'High Confidence' },
  medium: { color: '#d97706', bg: '#fef3c7', label: 'Medium Confidence' },
  low: { color: '#dc2626', bg: '#fef2f2', label: 'Low Confidence' },
};

function formatETB(n: number) {
  if (n >= 1000000) return `ETB ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `ETB ${(n / 1000).toFixed(0)}K`;
  return `ETB ${n.toLocaleString()}`;
}

export function PriceSuggestion({ propertyData, imageUrls = [], onUsePrice }: Props) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState('');
  const [showAmharic, setShowAmharic] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getSuggestion = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/listings/price-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyData, imageUrls })
      });
      const data = await res.json();
      if (data.success) {
        setEstimate(data.estimate);
        setShowDetails(true);
      } else {
        setError(data.error || 'Could not generate estimate');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const unitLabel = estimate?.unit === 'per_month' ? '/month' : estimate?.unit === 'per_night' ? '/night' : '';
  const conf = estimate ? CONFIDENCE_COLORS[estimate.confidence] : null;

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '2px solid #e0e7ff', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #006AFF, #0047CC)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>AI Price Suggestion</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
              {imageUrls.length > 0 ? `Analyzes your ${imageUrls.length} photo(s) + location + market data` : 'Analyzes location, size, amenities + market data'}
            </div>
          </div>
        </div>
        {!estimate && (
          <button onClick={getSuggestion} disabled={loading}
            style={{ padding: '10px 20px', borderRadius: 10, background: loading ? 'rgba(255,255,255,0.2)' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' as const }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Get AI Estimate</>}
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <Loader2 size={32} color="#006AFF" style={{ marginBottom: 12, animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Analyzing your property...</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Checking {estimate?.comparable_count || 'local'} comparable properties
            {imageUrls.length > 0 && ', reviewing photos'}, evaluating location & amenities
          </div>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '20px 24px', display: 'flex', gap: 10, alignItems: 'center', color: '#dc2626', fontSize: 14 }}>
          <AlertCircle size={18} />
          {error}
          <button onClick={getSuggestion} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Results */}
      {estimate && !loading && (
        <div style={{ padding: '24px' }}>

          {/* Main price */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Price</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: '#006AFF', letterSpacing: '-1px' }}>
              {formatETB(estimate.suggested_price)}
              <span style={{ fontSize: 18, fontWeight: 500, color: '#6b7280' }}>{unitLabel}</span>
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              Range: <strong style={{ color: '#374151' }}>{formatETB(estimate.price_range_min)}</strong> — <strong style={{ color: '#374151' }}>{formatETB(estimate.price_range_max)}</strong>{unitLabel}
            </div>
          </div>

          {/* Confidence + comparables */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
            {conf && (
              <div style={{ padding: '5px 14px', borderRadius: 20, background: conf.bg, color: conf.color, fontSize: 12, fontWeight: 700 }}>
                {estimate.confidence === 'high' ? '🎯' : estimate.confidence === 'medium' ? '📊' : '⚠️'} {conf.label}
              </div>
            )}
            {estimate.comparable_count > 0 && (
              <div style={{ padding: '5px 14px', borderRadius: 20, background: '#f0f6ff', color: '#006AFF', fontSize: 12, fontWeight: 700 }}>
                📍 {estimate.comparable_count} comparable{estimate.comparable_count !== 1 ? 's' : ''} found
              </div>
            )}
            {imageUrls.length > 0 && (
              <div style={{ padding: '5px 14px', borderRadius: 20, background: '#f0fdf4', color: '#059669', fontSize: 12, fontWeight: 700 }}>
                📷 Photos analyzed
              </div>
            )}
          </div>

          {/* Use this price button */}
          {onUsePrice && (
            <button onClick={() => onUsePrice(estimate.suggested_price)}
              style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#E8431A', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ✓ Use This Price — {formatETB(estimate.suggested_price)}{unitLabel}
            </button>
          )}

          {/* Toggle details */}
          <button onClick={() => setShowDetails(d => !d)}
            style={{ width: '100%', padding: '10px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: showDetails ? 16 : 0 }}>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showDetails ? 'Hide' : 'Show'} Analysis Details
          </button>

          {showDetails && (
            <div style={{ display: 'grid', gap: 14 }}>

              {/* Language toggle */}
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2, width: 'fit-content' }}>
                {[false, true].map(isAm => (
                  <button key={String(isAm)} onClick={() => setShowAmharic(isAm)}
                    style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: showAmharic === isAm ? 'white' : 'transparent', color: showAmharic === isAm ? '#006AFF' : '#6b7280', boxShadow: showAmharic === isAm ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                    {isAm ? 'አማርኛ' : 'English'}
                  </button>
                ))}
              </div>

              {/* Reasoning */}
              <div style={{ padding: '14px 16px', background: '#f8faff', borderRadius: 10, border: '1px solid #e8f0fe' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#006AFF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analysis</div>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                  {showAmharic ? estimate.reasoning_am : estimate.reasoning}
                </div>
              </div>

              {/* Factors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={13} /> Value Boosters
                  </div>
                  {estimate.factors_positive.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#065f46', marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span>✓</span><span>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '14px 16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingDown size={13} /> Value Reducers
                  </div>
                  {estimate.factors_negative.length > 0 ? estimate.factors_negative.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#991b1b', marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span>⚠</span><span>{f}</span>
                    </div>
                  )) : (
                    <div style={{ fontSize: 12, color: '#991b1b' }}>None identified</div>
                  )}
                </div>
              </div>

              {/* Market insight */}
              <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', fontSize: 13, color: '#92400e' }}>
                <span style={{ fontWeight: 700 }}>📊 Market Insight: </span>{estimate.market_insight}
              </div>

              {/* Recalculate */}
              <button onClick={getSuggestion}
                style={{ padding: '10px', borderRadius: 8, background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Sparkles size={14} color="#006AFF" /> Recalculate Estimate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Not yet triggered */}
      {!estimate && !loading && !error && (
        <div style={{ padding: '20px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
          Click <strong style={{ color: '#006AFF' }}>Get AI Estimate</strong> to analyze your property and get a suggested price range based on location, size, amenities{imageUrls.length > 0 ? ', and your uploaded photos' : ''}.
        </div>
      )}
    </div>
  );
}

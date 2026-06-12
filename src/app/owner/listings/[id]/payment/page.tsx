'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

export default function ListingRenewPage() {
  const { user } = useUser();
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    fetch(`/api/listings/get?id=${propertyId}`)
      .then(res => res.json())
      .then(data => { if (data.property) setProperty(data.property); })
      .catch(() => {});
  }, [propertyId]);

  const handleRenew = async () => {
    if (!property) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/listings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          ownerClerkId: user?.id || property.owner_id || null,
          ownerEmail: user?.primaryEmailAddress?.emailAddress || property.owner_email,
          ownerName: user?.fullName || user?.firstName || property.owner_name || 'Owner',
          type: 'renewal',
          discountCode: promoCode.trim() || null,
        }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Payment service returned an unexpected response. Please try again.');
      }
      if (data.error) throw new Error(data.error);
      // Free renewal (100% promo) → straight to success, no Chapa
      if (data.freeListing && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : JSON.stringify(err));
      setLoading(false);
    }
  };

  if (!property) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>Loading...</div>
    </div>
  );

  const hasPromo = promoCode.trim().length > 0;

  // Compute the new expiry the owner will get: 3 months from current expiry if
  // still in the future, otherwise 3 months from today. Mirrors the API logic.
  const base = property.expires_at && new Date(property.expires_at) > new Date()
    ? new Date(property.expires_at) : new Date();
  const newExpiry = new Date(base);
  newExpiry.setMonth(newExpiry.getMonth() + 3);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const currentExpiryLabel = property.expires_at ? fmt(new Date(property.expires_at)) : '—';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Renew Your Listing</h1>
          <p style={{ fontSize: 15, color: '#6b7280' }}>Keep your property active on ቤታችን Homes for another 3 months</p>
        </div>

        {/* Property summary */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Your Listing</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{property.title}</div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{property.location}</div>
        </div>

        {/* Expiry change */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>Current expiry</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>{currentExpiryLabel}</div>
          </div>
          <div style={{ fontSize: 20, color: '#9ca3af' }}>→</div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>New expiry</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>{fmt(newExpiry)}</div>
          </div>
        </div>

        {/* Payment details */}
        <div style={{ background: 'white', borderRadius: 16, border: '2px solid #006AFF', padding: '24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Renewal Fee</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {hasPromo && <span style={{ fontSize: 16, fontWeight: 700, color: '#9ca3af', textDecoration: 'line-through' }}>ETB 300</span>}
              <div style={{ fontSize: 28, fontWeight: 900, color: hasPromo ? '#059669' : '#006AFF' }}>{hasPromo ? 'FREE' : 'ETB 300'}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              '✓ 3 more months active',
              '✓ Stays live immediately after payment',
              '✓ Keeps all your views and details',
            ].map(item => (
              <div key={item} style={{ fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ── PROMO CODE ── */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 24px', marginBottom: 20 }}>
          {!showPromo ? (
            <button onClick={() => setShowPromo(true)} style={{ background: 'none', border: 'none', color: '#006AFF', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              Have a promo code?
            </button>
          ) : (
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>Promo Code</label>
              <input
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="BETA-XXXX-XXXX"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 16, fontFamily: 'monospace', letterSpacing: 1, color: '#111827', outline: 'none', boxSizing: 'border-box' as const }}
              />
              {hasPromo && (
                <div style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginTop: 8 }}>
                  ✓ Code will be applied — if valid, your renewal is free.
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleRenew}
          disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: 12, background: loading ? '#9ca3af' : hasPromo ? '#059669' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? 'Processing...' : hasPromo ? '🎟️ Apply Code & Renew Free' : '💳 Pay ETB 300 & Renew'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
          {hasPromo ? 'Your promo code gives 3 months free' : 'Secure payment powered by Chapa • You will be redirected to complete payment'}
        </div>
      </div>
    </div>
  );
}

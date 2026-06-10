'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

export default function ListingPaymentPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [promoCode, setPromoCode] = useState('');
  const [showPromo, setShowPromo] = useState(false);

  // Load the property by id REGARDLESS of sign-in state. Guests (email-verified,
  // no Clerk account) must be able to reach and pay for the listing they just
  // created, so this no longer gates on `user`. We only look up a profile /
  // verification status when there actually is a signed-in user.
  useEffect(() => {
    if (!propertyId) return;
    const supabase = createBrowserClient();

    supabase.from('properties').select('*').eq('id', propertyId).single()
      .then(({ data }) => setProperty(data));

    if (user) {
      supabase.from('profiles').select('verification_status')
        .eq('clerk_id', user.id).single()
        .then(({ data }) => setVerificationStatus(data?.verification_status ?? 'unverified'));
    } else {
      // Guests have no profile row; treat as unverified (ID verification happens
      // after payment, exactly as the notice on this page describes).
      setVerificationStatus('unverified');
    }
  }, [user, propertyId]);

  const handlePay = async () => {
    if (!property) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/listings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          // For guests these come from the property row (owner_email / owner_name
          // were saved at creation). For signed-in users we prefer the live
          // Clerk values, falling back to the stored ones.
          ownerClerkId: user?.id || property.owner_id || null,
          ownerEmail: user?.primaryEmailAddress?.emailAddress || property.owner_email,
          ownerName: user?.fullName || user?.firstName || property.owner_name || 'Owner',
          type: 'new',
          discountCode: promoCode.trim() || null,
        }),
      });
      // Guard against the route returning HTML (e.g. an auth redirect) instead
      // of JSON, which would otherwise throw an opaque "Unexpected token" error.
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Payment service returned an unexpected response. Please try again.');
      }
      if (data.error) throw new Error(data.error);
      // Free listing (100% promo) → go straight to success, no Chapa
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

  // Only wait on `property`. We no longer block on Clerk's isLoaded, because a
  // guest will never have a user and that previously caused an infinite "Loading".
  if (!property) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>Loading...</div>
    </div>
  );

  const hasPromo = promoCode.trim().length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Complete Your Listing</h1>
          <p style={{ fontSize: 15, color: '#6b7280' }}>One payment to publish your property on ቤታችን Homes</p>
        </div>

        {/* Property summary */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Your Listing</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{property.title}</div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{property.location}</div>
        </div>

        {/* Payment details */}
        <div style={{ background: 'white', borderRadius: 16, border: '2px solid #006AFF', padding: '24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Listing Fee</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {hasPromo && <span style={{ fontSize: 16, fontWeight: 700, color: '#9ca3af', textDecoration: 'line-through' }}>ETB 500</span>}
              <div style={{ fontSize: 28, fontWeight: 900, color: hasPromo ? '#059669' : '#006AFF' }}>{hasPromo ? 'FREE' : 'ETB 500'}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              '✓ 3 months active listing',
              '✓ Reviewed by admin within 24 hours',
              '✓ Visible to all buyers on ቤታችን Homes',
              '✓ Renewable after expiry for ETB 300',
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
                  ✓ Code will be applied — if valid, your listing is free for 3 months.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification notice */}
        {verificationStatus !== 'verified' && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>🛡️ ID Verification Required After Payment</div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
              After completing payment, you will need to verify your identity. Your listing will go live once verified and approved by admin.
            </div>
          </div>
        )}

        {/* What happens next */}
        <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>📋 What happens next?</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { n: '1', t: hasPromo ? 'Apply your promo code' : 'Pay listing fee via Chapa' },
              { n: '2', t: verificationStatus === 'verified' ? 'Admin reviews your listing within 24hrs' : 'Verify your identity (one-time)' },
              { n: '3', t: verificationStatus === 'verified' ? 'Listing goes LIVE on ቤታችን Homes ✅' : 'Admin reviews your listing within 24hrs' },
              { n: '4', t: verificationStatus === 'verified' ? '' : 'Listing goes LIVE on ቤታችን Homes ✅' },
            ].filter(s => s.t).map(({ n, t }) => (
              <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#006AFF', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: 12, background: loading ? '#9ca3af' : hasPromo ? '#059669' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? 'Processing...' : hasPromo ? '🎟️ Apply Code & Publish Free' : '💳 Pay ETB 500 & Publish'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
          {hasPromo ? 'Your promo code gives 3 months free' : 'Secure payment powered by Chapa • You will be redirected to complete payment'}
        </div>
      </div>
    </div>
  );
}

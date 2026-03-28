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

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase.from('properties').select('*').eq('id', propertyId).single()
      .then(({ data }) => setProperty(data));
    supabase.from('profiles').select('verification_status')
      .eq('clerk_id', user.id).single()
      .then(({ data }) => setVerificationStatus(data?.verification_status ?? 'unverified'));
  }, [user, propertyId]);

  const handlePay = async () => {
    if (!user || !property) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/listings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          ownerClerkId: user.id,
          ownerEmail: user.primaryEmailAddress?.emailAddress,
          ownerName: user.fullName || user.firstName || 'Owner',
          type: 'new',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : JSON.stringify(err));
      setLoading(false);
    }
  };

  if (!isLoaded || !property) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Complete Your Listing</h1>
          <p style={{ fontSize: 15, color: '#6b7280' }}>One payment to publish your property on ጎጆ Homes</p>
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
            <div style={{ fontSize: 28, fontWeight: 900, color: '#006AFF' }}>ETB 500</div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              '✓ 3 months active listing',
              '✓ Reviewed by admin within 24 hours',
              '✓ Visible to all buyers on ጎጆ Homes',
              '✓ Renewable after expiry for ETB 300',
            ].map(item => (
              <div key={item} style={{ fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                {item}
              </div>
            ))}
          </div>
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
              { n: '1', t: 'Pay listing fee via Chapa' },
              { n: '2', t: verificationStatus === 'verified' ? 'Admin reviews your listing within 24hrs' : 'Verify your identity (one-time)' },
              { n: '3', t: verificationStatus === 'verified' ? 'Listing goes LIVE on ጎጆ Homes ✅' : 'Admin reviews your listing within 24hrs' },
              { n: '4', t: verificationStatus === 'verified' ? '' : 'Listing goes LIVE on ጎጆ Homes ✅' },
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
          style={{ width: '100%', padding: '16px', borderRadius: 12, background: loading ? '#9ca3af' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? 'Redirecting to Chapa...' : '💳 Pay ETB 500 & Publish'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
          Secure payment powered by Chapa • You will be redirected to complete payment
        </div>
      </div>
    </div>
  );
}

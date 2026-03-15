'use client';
import { useState, useEffect, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function RenewListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('properties').select('*').eq('id', id).single()
      .then(({ data }) => { setProperty(data); setLoading(false); });
  }, [id]);

  const handleRenew = async () => {
    if (!user || !property) return;
    setPaying(true);
    setError('');
    try {
      const res = await fetch('/api/listings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: id,
          ownerClerkId: user.id,
          ownerEmail: user.primaryEmailAddress?.emailAddress,
          ownerName: user.fullName || 'Owner',
          type: 'renewal'
        })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Payment failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading...</div></div>;
  if (!property) return <div><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Listing not found</div></div>;

  const expiresAt = property.expires_at ? new Date(property.expires_at) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const newExpiry = new Date();
  newExpiry.setMonth(newExpiry.getMonth() + 3);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: daysLeft <= 0 ? '#fef2f2' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {daysLeft <= 0 ? <AlertCircle size={24} color="#dc2626" /> : <Clock size={24} color="#d97706" />}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Renew Your Listing</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{property.title}</div>
            </div>
          </div>

          {/* Status banner */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: daysLeft <= 0 ? '#fef2f2' : daysLeft <= 7 ? '#fffbeb' : '#f0f6ff', border: `1px solid ${daysLeft <= 0 ? '#fecaca' : daysLeft <= 7 ? '#fde68a' : '#dbeafe'}`, marginBottom: 24 }}>
            {daysLeft <= 0 ? (
              <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>❌ Your listing has expired and is no longer visible</div>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
                ⏰ Your listing expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> on {expiresAt?.toLocaleDateString('en-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
          </div>

          {/* Renewal details */}
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px', marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Renewal Details</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Renewal period</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>3 months</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Active until</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{newExpiry.toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Original listing fee</span>
              <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>ETB 500</span>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Renewal fee (60% discount)</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#006AFF' }}>ETB 300</span>
            </div>
          </div>

          {/* Payment methods */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Accepted payment methods:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {['Telebirr', 'CBE Birr', 'Visa/MC', 'Bank Transfer'].map(m => (
                <span key={m} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', background: '#f3f4f6', borderRadius: 12, color: '#374151' }}>{m}</span>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button onClick={handleRenew} disabled={paying}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: paying ? '#9ca3af' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={18} />
            {paying ? 'Redirecting to payment...' : 'Renew for ETB 300 — 3 more months'}
          </button>
        </div>

        {/* What happens note */}
        <div style={{ background: '#f0f6ff', borderRadius: 12, border: '1px solid #dbeafe', padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>✅ After renewal:</div>
          <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.7 }}>
            • Your listing stays active for 3 more months<br />
            • Listing goes back to <strong>active</strong> status immediately after payment<br />
            • You'll receive reminder emails at 30, 7, and 1 day before next expiry<br />
            • You can renew unlimited times at ETB 300 each time
          </div>
        </div>
      </div>
    </div>
  );
}

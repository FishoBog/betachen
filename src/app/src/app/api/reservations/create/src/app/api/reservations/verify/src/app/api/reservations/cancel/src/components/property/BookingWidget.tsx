'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Calendar, CreditCard, Shield, AlertCircle } from 'lucide-react';

type Props = {
  propertyId: string;
  pricePerNight: number;
  title: string;
};

export function BookingWidget({ propertyId, pricePerNight, title }: Props) {
  const { user, isSignedIn } = useUser();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalAmount = nights * pricePerNight;
  const depositAmount = totalAmount * 0.25;
  const remainingAmount = totalAmount * 0.75;

  const handleBook = async () => {
    if (!isSignedIn) { setError('Please sign in to make a reservation'); return; }
    if (!checkIn || !checkOut) { setError('Please select check-in and check-out dates'); return; }
    if (nights <= 0) { setError('Check-out must be after check-in'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          guestClerkId: user!.id,
          guestEmail: user!.primaryEmailAddress?.emailAddress,
          guestName: user!.fullName || 'Guest',
          checkIn,
          checkOut,
          pricePerNight
        })
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Booking failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#006AFF', marginBottom: 4 }}>
        ETB {pricePerNight.toLocaleString()}
        <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>/night</span>
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>25% deposit required at booking</div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>CHECK-IN</label>
          <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>CHECK-OUT</label>
          <input type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* Price breakdown */}
      {nights > 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151', marginBottom: 8 }}>
            <span>ETB {pricePerNight.toLocaleString()} × {nights} nights</span>
            <span>ETB {totalAmount.toLocaleString()}</span>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#E8431A', marginBottom: 4 }}>
              <span>Due now (25% deposit)</span>
              <span>ETB {depositAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
              <span>Due at check-in (75%)</span>
              <span>ETB {remainingAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#dc2626' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* Book button */}
      <button onClick={handleBook} disabled={loading || !checkIn || !checkOut}
        style={{ width: '100%', padding: '14px', borderRadius: 10, background: loading || !checkIn || !checkOut ? '#9ca3af' : '#E8431A', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: loading || !checkIn || !checkOut ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s' }}>
        {loading ? 'Processing...' : `Reserve — Pay ETB ${depositAmount > 0 ? depositAmount.toLocaleString() : '...'}`}
      </button>

      {/* Accepted payments */}
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Accepted payment methods</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          {['Telebirr', 'CBE Birr', 'Visa/MC', 'Bank'].map(m => (
            <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', background: '#f3f4f6', borderRadius: 12, color: '#374151' }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Cancellation policy */}
      <div style={{ marginTop: 16, padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #dbeafe' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Shield size={15} color="#006AFF" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#006AFF', marginBottom: 4 }}>Cancellation Policy</div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
              ✅ Cancel 7+ days before → <strong>Full refund</strong><br />
              ⚠️ Cancel 3–7 days before → <strong>50% refund</strong><br />
              ❌ Cancel under 3 days → <strong>No refund</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

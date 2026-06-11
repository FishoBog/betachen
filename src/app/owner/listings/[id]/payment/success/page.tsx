'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

export default function PaymentSuccessPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [verificationStatus, setVerificationStatus] = useState('loading');

  // This page is reached by BOTH guests (email-verified, no account) and
  // signed-in owners, because Chapa's return_url sends everyone here after
  // payment. We must NOT force sign-in (that previously bounced paying guests).
  // For signed-in owners we look up their verification status; for guests we
  // show a confirmation + "create an account" path instead of the owner-only
  // dashboard/verify flow they can't use.
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Guest: no profile to look up. Show the guest confirmation branch.
      setVerificationStatus('guest');
      return;
    }

    fetch('/api/profile/me')
      .then(res => res.json())
      .then(({ profile }) => setVerificationStatus(profile?.verification_status ?? 'unverified'))
      .catch(() => setVerificationStatus('unverified'));
  }, [user, isLoaded]);

  if (!isLoaded || verificationStatus === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px', textAlign: 'center' as const }}>

        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Payment Successful!</h1>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>Your listing has been submitted for review.</p>

        {/* ── GUEST BRANCH ── */}
        {verificationStatus === 'guest' && (
          <div>
            <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 16, padding: '24px', marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
                Payment received — listing pending review
              </div>
              <div style={{ fontSize: 14, color: '#047857', lineHeight: 1.7 }}>
                Thank you! Your payment was successful and your listing has been submitted.
                Our team will review it within 24 hours. We will email you at the address you
                verified when your listing goes live.
              </div>
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e', marginBottom: 6 }}>
                🛡️ ID verification may be required
              </div>
              <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7 }}>
                For some listings, our team may ask you to verify your identity before going live.
                If so, we will include instructions in your email.
              </div>
            </div>
            <button
              onClick={() => router.push('/sign-up')}
              style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 12 }}>
              Create an account to manage your listing
            </button>
            <button
              onClick={() => router.push('/')}
              style={{ width: '100%', padding: '15px', borderRadius: 12, background: 'white', color: '#6b7280', fontWeight: 600, fontSize: 15, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
              Back to home
            </button>
          </div>
        )}

        {/* ── SIGNED-IN, NOT YET VERIFIED ── */}
        {verificationStatus !== 'verified' && verificationStatus !== 'guest' && (
          <div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 16, padding: '24px', marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#92400e', marginBottom: 8 }}>
                One Last Step — Verify Your Identity
              </div>
              <div style={{ fontSize: 14, color: '#78350f', lineHeight: 1.7 }}>
                To protect buyers and maintain trust on ቤታችን Homes, all property owners must verify their identity before their listing goes live. This is a one-time process.
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10, marginBottom: 24, textAlign: 'left' as const, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px' }}>
              {[
                '✓ Upload a National ID, Kebele ID, or Passport',
                '✓ Admin reviews within 24 hours',
                '✓ Your listing goes LIVE once approved',
                '✓ Documents are never shared publicly',
              ].map(item => (
                <div key={item} style={{ fontSize: 13, color: '#374151' }}>{item}</div>
              ))}
            </div>
            <button
              onClick={() => router.push(`/owner/verify?propertyId=${propertyId}`)}
              style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 12 }}>
              🛡️ Verify My Identity Now
            </button>
            <button
              onClick={() => router.push('/owner/dashboard')}
              style={{ width: '100%', padding: '15px', borderRadius: 12, background: 'white', color: '#6b7280', fontWeight: 600, fontSize: 15, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
              Do it later (listing won't go live until verified)
            </button>
          </div>
        )}

        {/* ── SIGNED-IN, VERIFIED ── */}
        {verificationStatus === 'verified' && (
          <div>
            <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 16, padding: '24px', marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
                You are verified! Listing under review.
              </div>
              <div style={{ fontSize: 14, color: '#047857', lineHeight: 1.7 }}>
                Your listing has been submitted and will be reviewed by our team within 24 hours. You will receive an email once it goes live.
              </div>
            </div>
            <button
              onClick={() => router.push('/owner/dashboard')}
              style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
              Go to My Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

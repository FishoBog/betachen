'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Shield, Upload, CheckCircle, Clock, X } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb',
  borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', background: 'white',
};

export default function VerifyPage() {
  const { user, isSignedIn } = useUser();
  const [status, setStatus] = useState<string>('unverified');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingBiz, setUploadingBiz] = useState(false);
  const [idUrl, setIdUrl] = useState('');
  const [bizUrl, setBizUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase.from('profiles').select('verification_status, is_verified')
      .eq('clerk_id', user.id).single()
      .then(({ data }) => {
        if (data) setStatus(data.verification_status || 'unverified');
        setFullName(user.fullName || '');
        setLoading(false);
      });
  }, [user]);

  const uploadDoc = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'id' | 'biz'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    type === 'id' ? setUploadingId(true) : setUploadingBiz(true);
    const supabase = createBrowserClient();
    const fileName = `verifications/${user.id}/${type}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('property-images').upload(fileName, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage
        .from('property-images').getPublicUrl(fileName);
      type === 'id' ? setIdUrl(data.publicUrl) : setBizUrl(data.publicUrl);
    }
    type === 'id' ? setUploadingId(false) : setUploadingBiz(false);
  };

  const handleSubmit = async () => {
    if (!user || !idUrl) { setError('Please upload your ID document'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/verify/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          fullName,
          idDocumentUrl: idUrl,
          businessLicenseUrl: bizUrl,
        })
      });
      const data = await res.json();
      if (data.success) { setDone(true); setStatus('pending'); }
      else setError(data.error);
    } catch { setError('Network error'); }
    finally { setSubmitting(false); }
  };

  if (!isSignedIn) return (
    <div><Navbar />
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Sign in to get verified</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={32} color="#006AFF" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 8 }}>
            Get Verified ✓
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6 }}>
            Verified owners get a blue badge on all their listings, appear higher in search results, and receive 3x more inquiries.
          </p>
        </div>

        {/* Status banners */}
        {status === 'verified' && (
          <div style={{ background: '#d1fae5', borderRadius: 14, padding: '20px 24px', textAlign: 'center', marginBottom: 24 }}>
            <CheckCircle size={36} color="#059669" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46' }}>
              ✅ You are Verified!
            </div>
            <div style={{ fontSize: 14, color: '#065f46', marginTop: 4 }}>
              Your blue verification badge appears on all your listings
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div style={{ background: '#fef3c7', borderRadius: 14, padding: '20px 24px', textAlign: 'center', marginBottom: 24 }}>
            <Clock size={36} color="#d97706" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>
              ⏳ Verification Under Review
            </div>
            <div style={{ fontSize: 14, color: '#92400e', marginTop: 4 }}>
              We review verification requests within 24 hours. You'll be notified by email.
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div style={{ background: '#fef2f2', borderRadius: 14, padding: '20px 24px', textAlign: 'center', marginBottom: 24 }}>
            <X size={36} color="#dc2626" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#991b1b' }}>
              Verification Rejected
            </div>
            <div style={{ fontSize: 14, color: '#991b1b', marginTop: 4 }}>
              Please resubmit with clearer documents
            </div>
          </div>
        )}

        {/* Benefits */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
            Benefits of Verification
          </div>
          {[
            ['✓', 'Blue verified badge on all your listings', '#059669'],
            ['✓', 'Priority placement in search results', '#059669'],
            ['✓', 'Higher trust = 3x more inquiries', '#059669'],
            ['✓', 'Unlock escrow payment feature', '#059669'],
            ['✓', 'Access to agent/broker profile page', '#059669'],
            ['✓', 'Free featured listing for 7 days on approval', '#059669'],
          ].map(([icon, text, color]) => (
            <div key={text} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <span style={{ color, fontWeight: 700, fontSize: 15 }}>{icon}</span>
              <span style={{ fontSize: 14, color: '#374151' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Form — only show if not verified/pending */}
        {(status === 'unverified' || status === 'rejected') && !done && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>
              Submit Verification Documents
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Full Name (as on ID) *
                </label>
                <input style={inputStyle} value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. አበበ ከበደ / Abebe Kebede" />
              </div>

              {/* ID Document */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  National ID / Kebele ID / Passport * (required)
                </label>
                {idUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <CheckCircle size={18} color="#059669" />
                    <span style={{ fontSize: 13, color: '#065f46', fontWeight: 600 }}>ID document uploaded ✓</span>
                    <button onClick={() => setIdUrl('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: '24px', textAlign: 'center', background: '#f9fafb' }}>
                      {uploadingId ? (
                        <div style={{ color: '#006AFF', fontSize: 14, fontWeight: 600 }}>Uploading...</div>
                      ) : (
                        <>
                          <Upload size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Upload ID Document</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>JPG, PNG or PDF • Max 5MB</div>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*,.pdf"
                      onChange={e => uploadDoc(e, 'id')} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Business License */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Business License / Trade Certificate (optional — for agents & companies)
                </label>
                {bizUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <CheckCircle size={18} color="#059669" />
                    <span style={{ fontSize: 13, color: '#065f46', fontWeight: 600 }}>Business license uploaded ✓</span>
                    <button onClick={() => setBizUrl('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: '24px', textAlign: 'center', background: '#f9fafb' }}>
                      {uploadingBiz ? (
                        <div style={{ color: '#006AFF', fontSize: 14, fontWeight: 600 }}>Uploading...</div>
                      ) : (
                        <>
                          <Upload size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Upload Business License</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>JPG, PNG or PDF • Max 5MB</div>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*,.pdf"
                      onChange={e => uploadDoc(e, 'biz')} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Privacy note */}
              <div style={{ padding: '12px 16px', background: '#f0f6ff', borderRadius: 8, border: '1px solid #dbeafe', fontSize: 12, color: '#1d4ed8' }}>
                🔒 Your documents are stored securely and only used for identity verification. They are never shared publicly.
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={submitting || !idUrl || !fullName}
                style={{ padding: '14px', borderRadius: 12, background: submitting || !idUrl || !fullName ? '#9ca3af' : '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: submitting || !idUrl || !fullName ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Shield size={18} />
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

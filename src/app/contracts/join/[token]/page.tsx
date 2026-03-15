'use client';
import { useState, useEffect, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowRight, CheckCircle } from 'lucide-react';

const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };
const labelStyle = { fontSize: 13, fontWeight: 600 as const, color: '#374151', display: 'block' as const, marginBottom: 6 };

export default function JoinContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { user } = useUser();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [info, setInfo] = useState({ full_name: '', id_number: '', address: '', phone: '' });

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('contracts').select('*').eq('tenant_invite_token', token).single()
      .then(({ data }) => { setContract(data); setLoading(false); });
  }, [token]);

  const handleSubmit = async () => {
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase.from('contracts').update({
      tenant_clerk_id: user?.id || null,
      tenant_full_name: info.full_name,
      tenant_id_number: info.id_number,
      tenant_address: info.address,
      tenant_phone: info.phone,
      status: 'negotiating',
    }).eq('tenant_invite_token', token);
    setSaving(false);
    setDone(true);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>Loading...</div>
    </div>
  );

  if (!contract) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Invalid or expired link</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 24px' }}>
        {done ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '48px 32px', textAlign: 'center' }}>
            <CheckCircle size={56} color="#059669" style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Details Submitted! ✅</h2>
            <p style={{ color: '#6b7280', marginBottom: 8, fontSize: 15 }}>
              The owner will review your details.
            </p>
            <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
              You will be notified when the contract is ready to sign.
            </p>
            <a href={`/contracts/${contract.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
              View Contract <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px' }}>

            {/* Contract type header */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E8431A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Contract Invitation
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
              {contract.type === 'short_rent' && 'አጭር ኪራይ ውል'}
              {contract.type === 'long_rent' && 'ረጅም ኪራይ ውል'}
              {contract.type === 'nda' && 'የምስጢር ስምምነት'}
              {contract.type === 'sale' && 'የሽያጭ ውል'}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: 4, fontSize: 14 }}>
              From: <strong>{contract.owner_full_name}</strong>
            </p>
            {contract.property_address && (
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
                Property: {contract.property_address}
              </p>
            )}

            {/* Proposed terms preview */}
            {(contract.monthly_rent || contract.sale_price) && (
              <div style={{ background: '#f0f6ff', borderRadius: 10, padding: '16px 18px', marginBottom: 28, border: '1px solid #dbeafe' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#006AFF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Proposed Terms
                </div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' as const }}>
                  {contract.monthly_rent && (
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Monthly Rent</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>ETB {contract.monthly_rent.toLocaleString()}</div>
                    </div>
                  )}
                  {contract.deposit_amount && (
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Deposit</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>ETB {contract.deposit_amount.toLocaleString()}</div>
                    </div>
                  )}
                  {contract.start_date && (
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Start Date</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{contract.start_date}</div>
                    </div>
                  )}
                  {contract.end_date && (
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>End Date</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{contract.end_date}</div>
                    </div>
                  )}
                  {contract.sale_price && (
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Sale Price</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>ETB {contract.sale_price.toLocaleString()}</div>
                    </div>
                  )}
                </div>
                {contract.special_conditions && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #dbeafe', fontSize: 13, color: '#374151' }}>
                    <span style={{ fontWeight: 600 }}>Special conditions: </span>{contract.special_conditions}
                  </div>
                )}
              </div>
            )}

            {/* Tenant info form */}
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>
              የእርስዎ መረጃ / Your Details (ወገን ለ — Party B)
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>ሙሉ ስም / Full Name *</label>
                <input
                  style={inputStyle}
                  value={info.full_name}
                  onChange={e => setInfo(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. ሰናይት አለሙ / Senait Alemu"
                />
              </div>
              <div>
                <label style={labelStyle}>መታወቂያ ቁጥር / ID Card Number *</label>
                <input
                  style={inputStyle}
                  value={info.id_number}
                  onChange={e => setInfo(p => ({ ...p, id_number: e.target.value }))}
                  placeholder="e.g. 1234567890"
                />
              </div>
              <div>
                <label style={labelStyle}>አድራሻ / Address *</label>
                <input
                  style={inputStyle}
                  value={info.address}
                  onChange={e => setInfo(p => ({ ...p, address: e.target.value }))}
                  placeholder="e.g. ኪርኮስ ክ/ከተማ፣ አዲስ አበባ"
                />
              </div>
              <div>
                <label style={labelStyle}>ስልክ ቁጥር / Phone Number *</label>
                <input
                  style={inputStyle}
                  value={info.phone}
                  onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. 0911234567"
                />
              </div>
            </div>

            {/* Notice */}
            <div style={{ marginTop: 20, padding: '12px 16px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: 13, color: '#92400e' }}>
              ⚠️ By submitting, you confirm the terms above. You can negotiate after submitting.
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !info.full_name || !info.id_number || !info.address || !info.phone}
              style={{
                marginTop: 20, width: '100%', padding: '14px', borderRadius: 10,
                background: saving || !info.full_name || !info.id_number || !info.address || !info.phone ? '#9ca3af' : '#E8431A',
                color: 'white', fontWeight: 700, fontSize: 15, border: 'none',
                cursor: saving || !info.full_name ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
              {saving ? 'Submitting...' : 'Submit My Details'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

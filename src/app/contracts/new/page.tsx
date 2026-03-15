'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { FileText, ArrowRight } from 'lucide-react';

const CONTRACT_TYPES = [
  { value: 'short_rent', amharic: 'አጭር ኪራይ ውል', english: 'Short-term Rental Agreement', desc: 'For stays under 6 months' },
  { value: 'long_rent', amharic: 'ረጅም ኪራይ ውል', english: 'Long-term Rental Agreement', desc: 'For stays 6 months and above' },
  { value: 'nda', amharic: 'የምስጢር ስምምነት', english: 'Non-Disclosure Agreement', desc: 'Protect confidential information' },
  { value: 'sale', amharic: 'የሽያጭ ውል', english: 'Property Sale Agreement', desc: 'For buying and selling property' },
];

const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

export default function NewContractPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('type') || '';

  const [step, setStep] = useState(defaultType ? 2 : 1);
  const [contractType, setContractType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [ownerInfo, setOwnerInfo] = useState({
    full_name: (user?.fullName) || '',
    id_number: '',
    address: '',
    phone: '',
  });

  const [terms, setTerms] = useState({
    property_address: '',
    monthly_rent: '',
    deposit_amount: '',
    start_date: '',
    end_date: '',
    payment_day: '1',
    special_conditions: '',
    sale_price: '',
    payment_schedule: '',
    confidential_info_description: '',
    nda_duration_years: '2',
  });

  const [tenantEmail, setTenantEmail] = useState('');

  const handleCreate = async () => {
    if (!isSignedIn || !user) return;
    setLoading(true);
    setError('');

    try {
      const supabase = createBrowserClient();
      const { data, error: err } = await supabase.from('contracts').insert({
        type: contractType,
        owner_clerk_id: user.id,
        owner_full_name: ownerInfo.full_name,
        owner_id_number: ownerInfo.id_number,
        owner_address: ownerInfo.address,
        owner_phone: ownerInfo.phone,
        tenant_email: tenantEmail,
        property_address: terms.property_address,
        monthly_rent: terms.monthly_rent ? parseFloat(terms.monthly_rent) : null,
        deposit_amount: terms.deposit_amount ? parseFloat(terms.deposit_amount) : null,
        start_date: terms.start_date || null,
        end_date: terms.end_date || null,
        payment_day: parseInt(terms.payment_day),
        special_conditions: terms.special_conditions,
        sale_price: terms.sale_price ? parseFloat(terms.sale_price) : null,
        payment_schedule: terms.payment_schedule,
        confidential_info_description: terms.confidential_info_description,
        nda_duration_years: parseInt(terms.nda_duration_years),
        owner_proposed_rent: terms.monthly_rent ? parseFloat(terms.monthly_rent) : null,
        status: tenantEmail ? 'pending_tenant' : 'draft',
      }).select().single();

      if (err) throw err;

      // Send invite email if tenant email provided
      if (tenantEmail) {
        await fetch('/api/contracts/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId: data.id, tenantEmail, ownerName: ownerInfo.full_name, contractType })
        });
      }

      router.push(`/contracts/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return (
    <div><Navbar />
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Please sign in to create contracts</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
          {['Select Type', 'Your Details', 'Terms', 'Invite Tenant'].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 4, borderRadius: 2, background: step > i + 1 ? '#006AFF' : step === i + 1 ? '#006AFF' : '#e5e7eb', marginBottom: 6 }} />
              <div style={{ fontSize: 11, color: step >= i + 1 ? '#006AFF' : '#9ca3af', fontWeight: step === i + 1 ? 700 : 400 }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px' }}>

          {/* STEP 1: Select type */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Select Contract Type</h2>
              <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14 }}>Choose the type of legal agreement to create</p>
              <div style={{ display: 'grid', gap: 12 }}>
                {CONTRACT_TYPES.map(ct => (
                  <div key={ct.value} onClick={() => setContractType(ct.value)}
                    style={{ padding: '18px 20px', borderRadius: 12, border: `2px solid ${contractType === ct.value ? '#006AFF' : '#e5e7eb'}`, background: contractType === ct.value ? '#f0f6ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}>
                    <FileText size={24} color={contractType === ct.value ? '#006AFF' : '#9ca3af'} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{ct.amharic}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{ct.english} • {ct.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => contractType && setStep(2)} disabled={!contractType}
                style={{ marginTop: 28, width: '100%', padding: '13px', borderRadius: 10, background: contractType ? '#006AFF' : '#e5e7eb', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: contractType ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Owner info */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>የባለቤት መረጃ / Your Details</h2>
              <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14 }}>This information will appear on the contract as Party A (ወገን ሀ)</p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>ሙሉ ስም / Full Name *</label>
                  <input style={inputStyle} value={ownerInfo.full_name} onChange={e => setOwnerInfo(p => ({ ...p, full_name: e.target.value }))} placeholder="e.g. አበበ ከበደ / Abebe Kebede" />
                </div>
                <div>
                  <label style={labelStyle}>መታወቂያ ቁጥር / ID Card Number *</label>
                  <input style={inputStyle} value={ownerInfo.id_number} onChange={e => setOwnerInfo(p => ({ ...p, id_number: e.target.value }))} placeholder="e.g. 1234567890" />
                </div>
                <div>
                  <label style={labelStyle}>አድራሻ / Address *</label>
                  <input style={inputStyle} value={ownerInfo.address} onChange={e => setOwnerInfo(p => ({ ...p, address: e.target.value }))} placeholder="e.g. ቦሌ ክ/ከተማ፣ አዲስ አበባ" />
                </div>
                <div>
                  <label style={labelStyle}>ስልክ ቁጥር / Phone Number *</label>
                  <input style={inputStyle} value={ownerInfo.phone} onChange={e => setOwnerInfo(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. 0911234567" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} disabled={!ownerInfo.full_name || !ownerInfo.id_number || !ownerInfo.address || !ownerInfo.phone}
                  style={{ flex: 2, padding: '13px', borderRadius: 10, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Terms */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>የውል ዝርዝር / Contract Terms</h2>
              <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14 }}>These are your proposed terms — the tenant can negotiate</p>
              <div style={{ display: 'grid', gap: 16 }}>
                {(contractType === 'short_rent' || contractType === 'long_rent') && (<>
                  <div>
                    <label style={labelStyle}>የቤቱ አድራሻ / Property Address *</label>
                    <input style={inputStyle} value={terms.property_address} onChange={e => setTerms(p => ({ ...p, property_address: e.target.value }))} placeholder="e.g. ቦሌ፣ ቤት ቁጥር 5" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>ወርሃዊ ኪራይ (ETB) / Monthly Rent *</label>
                      <input style={inputStyle} type="number" value={terms.monthly_rent} onChange={e => setTerms(p => ({ ...p, monthly_rent: e.target.value }))} placeholder="e.g. 15000" />
                    </div>
                    <div>
                      <label style={labelStyle}>ዋስትና (ETB) / Deposit *</label>
                      <input style={inputStyle} type="number" value={terms.deposit_amount} onChange={e => setTerms(p => ({ ...p, deposit_amount: e.target.value }))} placeholder="e.g. 30000" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>የጀምር ቀን / Start Date *</label>
                      <input style={inputStyle} type="date" value={terms.start_date} onChange={e => setTerms(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>የማለቂያ ቀን / End Date *</label>
                      <input style={inputStyle} type="date" value={terms.end_date} onChange={e => setTerms(p => ({ ...p, end_date: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>ኪራይ የሚከፈልበት ቀን / Payment Day (1-31)</label>
                    <input style={inputStyle} type="number" min="1" max="31" value={terms.payment_day} onChange={e => setTerms(p => ({ ...p, payment_day: e.target.value }))} />
                  </div>
                </>)}

                {contractType === 'sale' && (<>
                  <div>
                    <label style={labelStyle}>የቤቱ አድራሻ / Property Address *</label>
                    <input style={inputStyle} value={terms.property_address} onChange={e => setTerms(p => ({ ...p, property_address: e.target.value }))} placeholder="e.g. ቦሌ፣ ቤት ቁጥር 5" />
                  </div>
                  <div>
                    <label style={labelStyle}>የሽያጭ ዋጋ (ETB) / Sale Price *</label>
                    <input style={inputStyle} type="number" value={terms.sale_price} onChange={e => setTerms(p => ({ ...p, sale_price: e.target.value }))} placeholder="e.g. 5000000" />
                  </div>
                  <div>
                    <label style={labelStyle}>የክፍያ መርሃ ግብር / Payment Schedule</label>
                    <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' as const }} value={terms.payment_schedule} onChange={e => setTerms(p => ({ ...p, payment_schedule: e.target.value }))} placeholder="e.g. 50% upfront, 50% on handover" />
                  </div>
                </>)}

                {contractType === 'nda' && (<>
                  <div>
                    <label style={labelStyle}>ምስጢራዊ መረጃ ዝርዝር / Confidential Information Description *</label>
                    <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' as const }} value={terms.confidential_info_description} onChange={e => setTerms(p => ({ ...p, confidential_info_description: e.target.value }))} placeholder="Describe what information must remain confidential..." />
                  </div>
                  <div>
                    <label style={labelStyle}>የጊዜ ገደብ (ዓመታት) / Duration (Years)</label>
                    <input style={inputStyle} type="number" min="1" max="10" value={terms.nda_duration_years} onChange={e => setTerms(p => ({ ...p, nda_duration_years: e.target.value }))} />
                  </div>
                </>)}

                <div>
                  <label style={labelStyle}>ልዩ ሁኔታዎች / Special Conditions (Optional)</label>
                  <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' as const }} value={terms.special_conditions} onChange={e => setTerms(p => ({ ...p, special_conditions: e.target.value }))} placeholder="Any additional terms or conditions..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(4)} style={{ flex: 2, padding: '13px', borderRadius: 10, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Invite tenant */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>ሌላኛውን ወገን ጋብዝ / Invite Other Party</h2>
              <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14 }}>Send a link to the tenant/buyer to fill their details and negotiate terms</p>
              <div>
                <label style={labelStyle}>የተከራዩ/ገዢው ኢሜይል / Tenant or Buyer Email</label>
                <input style={inputStyle} type="email" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} placeholder="tenant@example.com" />
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>They will receive a secure link to fill their information and review terms. Leave blank to save as draft.</div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginTop: 16 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Back</button>
                <button onClick={handleCreate} disabled={loading}
                  style={{ flex: 2, padding: '13px', borderRadius: 10, background: '#E8431A', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Creating...' : tenantEmail ? '📧 Create & Send Invite' : '💾 Save as Draft'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

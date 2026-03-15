'use client';
import { useState, useEffect, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { CheckCircle, Download, Send, Copy, FileText } from 'lucide-react';

const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };
const labelStyle = { fontSize: 13, fontWeight: 600 as const, color: '#374151', display: 'block' as const, marginBottom: 6 };

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tenantInfo, setTenantInfo] = useState({ full_name: '', id_number: '', address: '', phone: '' });
  const [counterOffer, setCounterOffer] = useState('');

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('contracts').select('*').eq('id', id).single()
      .then(({ data }) => {
        setContract(data);
        if (data?.tenant_full_name) setTenantInfo({ full_name: data.tenant_full_name, id_number: data.tenant_id_number || '', address: data.tenant_address || '', phone: data.tenant_phone || '' });
        setLoading(false);
      });
  }, [id]);

  const isOwner = contract?.owner_clerk_id === user?.id;
  const isTenant = contract?.tenant_clerk_id === user?.id;
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/contracts/join/${contract?.tenant_invite_token}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveTenantInfo = async () => {
    setSaving(true);
    const supabase = createBrowserClient();
    await supabase.from('contracts').update({
      tenant_clerk_id: user?.id,
      tenant_full_name: tenantInfo.full_name,
      tenant_id_number: tenantInfo.id_number,
      tenant_address: tenantInfo.address,
      tenant_phone: tenantInfo.phone,
      status: 'negotiating',
    }).eq('id', id);
    setContract((c: any) => ({ ...c, ...tenantInfo, status: 'negotiating' }));
    setSaving(false);
  };

  const submitCounterOffer = async () => {
    const supabase = createBrowserClient();
    await supabase.from('contracts').update({
      tenant_proposed_rent: parseFloat(counterOffer),
      negotiation_notes: `Tenant proposed: ETB ${counterOffer}/month`,
      status: 'negotiating',
    }).eq('id', id);
    setContract((c: any) => ({ ...c, tenant_proposed_rent: parseFloat(counterOffer) }));
    setCounterOffer('');
  };

  const agreeToTerms = async () => {
    const supabase = createBrowserClient();
    const field = isOwner ? { owner_agreed: true } : { tenant_agreed: true };
    const { data } = await supabase.from('contracts').update(field).eq('id', id).select().single();
    setContract(data);
    if (data.owner_agreed && data.tenant_agreed) {
      await supabase.from('contracts').update({ status: 'agreed' }).eq('id', id);
      setContract((c: any) => ({ ...c, status: 'agreed' }));
    }
  };

  const generateDocument = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: id })
      });
      const data = await res.json();
      if (data.success) {
        setContract((c: any) => ({ ...c, pdf_url: data.pdfUrl, status: 'completed' }));
        window.open(data.pdfUrl, '_blank');
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading...</div></div>;
  if (!contract) return <div><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Contract not found</div></div>;

  const bothAgreed = contract.owner_agreed && contract.tenant_agreed;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#006AFF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Contract #{id.slice(0, 8).toUpperCase()}</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
                {contract.type === 'short_rent' && 'አጭር ኪራይ ውል'}
                {contract.type === 'long_rent' && 'ረጅም ኪራይ ውል'}
                {contract.type === 'nda' && 'የምስጢር ስምምነት'}
                {contract.type === 'sale' && 'የሽያጭ ውል'}
              </h1>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{contract.property_address}</div>
            </div>
            <div style={{ padding: '6px 16px', borderRadius: 20, background: contract.status === 'completed' ? '#d1fae5' : contract.status === 'agreed' ? '#dbeafe' : '#fef3c7', color: contract.status === 'completed' ? '#065f46' : contract.status === 'agreed' ? '#1d4ed8' : '#92400e', fontSize: 13, fontWeight: 700 }}>
              {contract.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          {/* Invite link */}
          {isOwner && contract.status !== 'completed' && (
            <div style={{ marginTop: 20, padding: '14px 16px', background: '#f0f6ff', borderRadius: 10, border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#006AFF', marginBottom: 8 }}>📨 Share this link with the tenant/buyer:</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input readOnly value={inviteLink} style={{ ...inputStyle, background: 'white', fontSize: 12, color: '#374151' }} />
                <button onClick={copyLink} style={{ padding: '0 16px', borderRadius: 8, background: copied ? '#059669' : '#006AFF', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' as const }}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Parties */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#006AFF', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ወገን ሀ / Party A (Owner)</div>
            {[['ሙሉ ስም', contract.owner_full_name], ['መታወቂያ', contract.owner_id_number], ['አድራሻ', contract.owner_address], ['ስልክ', contract.owner_phone]].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{val || '—'}</div>
              </div>
            ))}
            {contract.owner_agreed && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 13, fontWeight: 600, marginTop: 12 }}><CheckCircle size={16} /> Agreed to terms</div>}
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8431A', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ወገን ለ / Party B (Tenant/Buyer)</div>
            {contract.tenant_full_name ? (
              <>
                {[['ሙሉ ስም', contract.tenant_full_name], ['መታወቂያ', contract.tenant_id_number], ['አድራሻ', contract.tenant_address], ['ስልክ', contract.tenant_phone]].map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{val || '—'}</div>
                  </div>
                ))}
                {contract.tenant_agreed && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 13, fontWeight: 600, marginTop: 12 }}><CheckCircle size={16} /> Agreed to terms</div>}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
                <Send size={32} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>Awaiting tenant to fill their details</div>
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>የውል ዝርዝር / Contract Terms</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {contract.monthly_rent && <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>MONTHLY RENT</div><div style={{ fontSize: 18, fontWeight: 800, color: '#006AFF' }}>ETB {contract.monthly_rent.toLocaleString()}</div></div>}
            {contract.deposit_amount && <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>DEPOSIT</div><div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>ETB {contract.deposit_amount.toLocaleString()}</div></div>}
            {contract.start_date && <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>START DATE</div><div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{contract.start_date}</div></div>}
            {contract.end_date && <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>END DATE</div><div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{contract.end_date}</div></div>}
            {contract.sale_price && <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>SALE PRICE</div><div style={{ fontSize: 18, fontWeight: 800, color: '#006AFF' }}>ETB {contract.sale_price.toLocaleString()}</div></div>}
          </div>
          {contract.special_conditions && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>SPECIAL CONDITIONS</div>
              <div style={{ fontSize: 14, color: '#374151' }}>{contract.special_conditions}</div>
            </div>
          )}

          {/* Counter offer display */}
          {contract.tenant_proposed_rent && contract.tenant_proposed_rent !== contract.monthly_rent && (
            <div style={{ marginTop: 16, padding: '14px 16px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>⚖️ Counter Offer from Tenant</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>ETB {contract.tenant_proposed_rent.toLocaleString()}/month</div>
              {contract.negotiation_notes && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{contract.negotiation_notes}</div>}
            </div>
          )}

          {/* Counter offer input */}
          {isTenant && contract.status === 'negotiating' && !contract.tenant_agreed && (
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>ለውጥ አቅርቡ / Submit Counter Offer (Optional)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={inputStyle} type="number" value={counterOffer} onChange={e => setCounterOffer(e.target.value)} placeholder="Your proposed monthly rent in ETB" />
                <button onClick={submitCounterOffer} disabled={!counterOffer} style={{ padding: '0 20px', borderRadius: 8, background: '#006AFF', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' as const }}>Submit</button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          {!bothAgreed && contract.status !== 'draft' && contract.tenant_full_name && (
            <button onClick={agreeToTerms}
              disabled={(isOwner && contract.owner_agreed) || (isTenant && contract.tenant_agreed)}
              style={{ flex: 1, padding: '14px', borderRadius: 10, background: (isOwner && contract.owner_agreed) || (isTenant && contract.tenant_agreed) ? '#d1fae5' : '#059669', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle size={18} />
              {(isOwner && contract.owner_agreed) || (isTenant && contract.tenant_agreed) ? '✓ You agreed' : 'Agree to Terms'}
            </button>
          )}

          {(bothAgreed || contract.status === 'agreed' || contract.status === 'completed') && (
            <button onClick={generateDocument} disabled={generating}
              style={{ flex: 1, padding: '14px', borderRadius: 10, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <FileText size={18} />
              {generating ? 'Generating...' : 'Generate Amharic Contract'}
            </button>
          )}

          {contract.pdf_url && (
            <a href={contract.pdf_url} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, padding: '14px', borderRadius: 10, background: '#111827', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={18} /> Download Contract
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

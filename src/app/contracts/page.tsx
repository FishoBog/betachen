'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const CONTRACT_TYPES = {
  short_rent: { label: 'አጭር ኪራይ ውል', labelEN: 'Short-term Rental', color: '#92400e', bg: '#fef3c7' },
  long_rent: { label: 'ረጅም ኪራይ ውል', labelEN: 'Long-term Rental', color: '#065f46', bg: '#d1fae5' },
  nda: { label: 'የምስጢር ስምምነት', labelEN: 'NDA', color: '#1d4ed8', bg: '#dbeafe' },
  sale: { label: 'የሽያጭ ውል', labelEN: 'Sale Agreement', color: '#7c3aed', bg: '#ede9fe' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: '#6b7280', icon: Clock },
  pending_tenant: { label: 'Awaiting Tenant', color: '#d97706', icon: Clock },
  negotiating: { label: 'Negotiating', color: '#2563eb', icon: AlertCircle },
  agreed: { label: 'Agreed', color: '#059669', icon: CheckCircle },
  completed: { label: 'Completed', color: '#059669', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#dc2626', icon: AlertCircle },
};

export default function ContractsPage() {
  const { user, isSignedIn } = useUser();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase.from('contracts')
      .select('*')
      .or(`owner_clerk_id.eq.${user.id},tenant_clerk_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setContracts(data || []); setLoading(false); });
  }, [user]);

  if (!isSignedIn) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Please sign in to access contracts</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 4 }}>ውሎች / Contracts</h1>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Manage your rental and sale agreements</p>
          </div>
          <Link href="/contracts/new" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#E8431A', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <Plus size={18} /> New Contract
          </Link>
        </div>

        {/* Contract type cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
          {Object.entries(CONTRACT_TYPES).map(([type, info]) => (
            <Link key={type} href={`/contracts/new?type=${type}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 14, padding: '20px 24px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <FileText size={20} color={info.color} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{info.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{info.labelEN}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Contracts list */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Recent Contracts</div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading...</div>
          ) : contracts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <FileText size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No contracts yet</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>Create your first contract to get started</div>
              <Link href="/contracts/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#006AFF', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                <Plus size={16} /> Create Contract
              </Link>
            </div>
          ) : contracts.map(c => {
            const typeInfo = CONTRACT_TYPES[c.type as keyof typeof CONTRACT_TYPES];
            const statusInfo = STATUS_LABELS[c.status] || STATUS_LABELS.draft;
            const StatusIcon = statusInfo.icon;
            const isOwner = c.owner_clerk_id === user?.id;
            return (
              <Link key={c.id} href={`/contracts/${c.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: typeInfo?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color={typeInfo?.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{typeInfo?.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {isOwner ? `Tenant: ${c.tenant_full_name || 'Pending...'}` : `Owner: ${c.owner_full_name || 'Unknown'}`}
                      {c.property_address && ` • ${c.property_address}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: `${statusInfo.color}15`, color: statusInfo.color, fontSize: 12, fontWeight: 600 }}>
                    <StatusIcon size={12} />
                    {statusInfo.label}
                  </div>
                  <ArrowRight size={16} color="#9ca3af" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

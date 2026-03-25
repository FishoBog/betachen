'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { PlusCircle, Eye, MessageSquare, RefreshCw, Trash2, CheckCircle, Clock, XCircle, AlertTriangle, Shield, TrendingUp, DollarSign, Home, ChevronRight } from 'lucide-react';
import type { Property } from '@/types';

const GOJO_IMAGE = 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/Gojo-bete.jpg';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  active:         { label: 'Active',         color: '#065f46', bg: '#d1fae5', icon: CheckCircle },
  pending_review: { label: 'Pending Review', color: '#92400e', bg: '#fef3c7', icon: Clock },
  pending:        { label: 'Pending Review', color: '#92400e', bg: '#fef3c7', icon: Clock },
  expired:        { label: 'Expired',        color: '#991b1b', bg: '#fee2e2', icon: XCircle },
  rejected:       { label: 'Rejected',       color: '#991b1b', bg: '#fee2e2', icon: XCircle },
  draft:          { label: 'Draft',          color: '#374151', bg: '#f3f4f6', icon: Clock },
};

const TYPE_LABELS: Record<string, string> = {
  sale: 'For Sale', long_rent: 'For Rent', short_rent: 'Short Stay',
};

function formatPrice(price: number, currency: string) {
  if (!price) return 'Negotiable';
  if (price >= 1000000) return `${currency} ${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${currency} ${(price / 1000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
}

function daysLeft(expiresAt: string | null) {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function OwnerDashboard() {
  const { user } = useUser();
  const [properties, setProperties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [msgCounts, setMsgCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending_review' | 'expired'>('all');

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();

    Promise.all([
      supabase.from('properties').select('*, property_images(*)').eq('owner_id', user.id).order('created_at', { ascending: false }),
      supabase.from('listing_payments').select('*').eq('owner_clerk_id', user.id).eq('status', 'paid'),
      supabase.from('profiles').select('*').eq('clerk_id', user.id).single(),
    ]).then(async ([{ data: props }, { data: pays }, { data: prof }]) => {
      setProperties(props ?? []);
      setPayments(pays ?? []);
      setProfile(prof);

      if (props && props.length > 0) {
        const ids = props.map((p: any) => p.id);

        const [{ data: views }, { data: chats }] = await Promise.all([
          supabase.from('property_views').select('property_id').in('property_id', ids),
          supabase.from('chats').select('property_id').in('property_id', ids),
        ]);

        const vc: Record<string, number> = {};
        const mc: Record<string, number> = {};
        ids.forEach((id: string) => {
          vc[id] = views?.filter((v: any) => v.property_id === id).length ?? 0;
          mc[id] = chats?.filter((c: any) => c.property_id === id).length ?? 0;
        });
        setViewCounts(vc);
        setMsgCounts(mc);
      }
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    setDeleting(id);
    const supabase = createBrowserClient();
    await supabase.from('properties').delete().eq('id', id);
    setProperties(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  };

  const filtered = properties.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending_review') return p.status === 'pending_review' || p.status === 'pending';
    return p.status === activeTab;
  });

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending_review' || p.status === 'pending').length,
    expired: properties.filter(p => p.status === 'expired').length,
    totalViews: Object.values(viewCounts).reduce((a, b) => a + b, 0),
    totalMessages: Object.values(msgCounts).reduce((a, b) => a + b, 0),
    totalPaid: payments.reduce((a, p) => a + (p.amount ?? 0), 0),
  };

  const expiringSoon = properties.filter(p => {
    const d = daysLeft(p.expires_at);
    return d !== null && d <= 7 && d > 0 && p.status === 'active';
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>Loading your dashboard...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 4 }}>
              My Dashboard
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Welcome back, {user?.firstName ?? 'Owner'} 👋</p>
          </div>
          <Link href="/owner/listings/new" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <PlusCircle size={16} /> Post New Listing
          </Link>
        </div>

        {/* Verification banner */}
        {profile && profile.verification_status !== 'verified' && (
          <div style={{ background: profile.verification_status === 'pending' ? '#fef3c7' : '#fef2f2', border: `1px solid ${profile.verification_status === 'pending' ? '#fde68a' : '#fecaca'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
            <Shield size={22} color={profile.verification_status === 'pending' ? '#d97706' : '#dc2626'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>
                {profile.verification_status === 'pending' ? '⏳ Verification Under Review' : '🛡️ ID Verification Required'}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {profile.verification_status === 'pending'
                  ? 'Your ID is being reviewed. You will be notified within 24 hours.'
                  : 'Verify your ID to post listings and get the verified badge.'}
              </div>
            </div>
            {profile.verification_status !== 'pending' && (
              <Link href="/owner/verify" style={{ padding: '8px 16px', background: '#006AFF', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Verify Now
              </Link>
            )}
          </div>
        )}

        {/* Expiring soon banner */}
        {expiringSoon.length > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
            <AlertTriangle size={22} color="#d97706" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>
                ⚠️ {expiringSoon.length} listing{expiringSoon.length > 1 ? 's' : ''} expiring soon!
              </div>
              <div style={{ fontSize: 13, color: '#78350f', marginTop: 2 }}>
                {expiringSoon.map(p => `"${p.title}" (${daysLeft(p.expires_at)} days left)`).join(', ')}
              </div>
            </div>
            <Link href="/owner/listings" style={{ padding: '8px 16px', background: '#E8431A', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Renew Now
            </Link>
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Listings', value: stats.total, icon: Home, color: '#006AFF', bg: '#eff6ff' },
            { label: 'Active', value: stats.active, icon: CheckCircle, color: '#059669', bg: '#ecfdf5' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: '#d97706', bg: '#fffbeb' },
            { label: 'Expired', value: stats.expired, icon: XCircle, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Total Views', value: stats.totalViews, icon: Eye, color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Total Inquiries', value: stats.totalMessages, icon: MessageSquare, color: '#0891b2', bg: '#ecfeff' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Earnings card */}
        <div style={{ background: 'linear-gradient(135deg, #0a0f14, #1a2a3a)', borderRadius: 16, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Invested in Listings</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'white' }}>ETB {stats.totalPaid.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{payments.length} payment{payments.length !== 1 ? 's' : ''} made</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.07)', borderRadius: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#E8431A' }}>{stats.active}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Active Now</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.07)', borderRadius: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#006AFF' }}>{stats.totalViews}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Total Views</div>
            </div>
          </div>
        </div>

        {/* Listings section */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>My Listings</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'active', 'pending_review', 'expired'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${activeTab === tab ? '#006AFF' : '#e5e7eb'}`, background: activeTab === tab ? '#006AFF' : 'white', color: activeTab === tab ? 'white' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {tab === 'all' ? 'All' : tab === 'pending_review' ? 'Pending' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span style={{ marginLeft: 5, background: activeTab === tab ? 'rgba(255,255,255,0.25)' : '#f3f4f6', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>
                    {tab === 'all' ? stats.total : tab === 'pending_review' ? stats.pending : tab === 'active' ? stats.active : stats.expired}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ width: 100, height: 85, borderRadius: 12, overflow: 'hidden', margin: '0 auto 16px', opacity: 0.5 }}>
                <img src={GOJO_IMAGE} alt="ጎጆ" style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'top' }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No listings yet</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Post your first property and start getting inquiries</div>
              <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#E8431A', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                <PlusCircle size={16} /> Post First Listing
              </Link>
            </div>
          ) : (
            <div>
              {filtered.map((p, i) => {
                const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.draft;
                const StatusIcon = sc.icon;
                const days = daysLeft(p.expires_at);
                const mainImage = p.property_images?.[0]?.image_url ?? p.images?.[0];
                return (
                  <div key={p.id} style={{ display: 'flex', gap: 16, padding: '20px 24px', borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'flex-start', flexWrap: 'wrap' as const }}>

                    {/* Image */}
                    <div style={{ width: 100, height: 80, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                      {mainImage ? (
                        <img src={mainImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={GOJO_IMAGE} alt="ጎጆ" style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'top', opacity: 0.5 }} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' as const }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <StatusIcon size={11} /> {sc.label}
                        </span>
                        <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                          {TYPE_LABELS[p.type] ?? p.type}
                        </span>
                        {days !== null && days <= 7 && days > 0 && (
                          <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                            ⚠️ {days}d left
                          </span>
                        )}
                        {days !== null && days <= 0 && p.status === 'active' && (
                          <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                            Expired
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                        📍 {p.location || p.subcity || 'Ethiopia'} •{' '}
                        {p.price_negotiable ? 'Price negotiable' : formatPrice(p.price, p.currency)}
                        {p.type === 'long_rent' ? '/mo' : p.type === 'short_rent' ? '/night' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={13} /> {viewCounts[p.id] ?? 0} views
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MessageSquare size={13} /> {msgCounts[p.id] ?? 0} inquiries
                        </span>
                        {p.expires_at && days !== null && days > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={13} /> Expires {new Date(p.expires_at).toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' as const }}>
                      <Link href={`/properties/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, background: '#f3f4f6', color: '#374151', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        <Eye size={13} /> View
                      </Link>
                      {(p.status === 'active' || p.status === 'expired') && (
                        <Link href={`/owner/listings/${p.id}/renew`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, background: '#006AFF', color: 'white', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          <RefreshCw size={13} /> Renew
                        </Link>
                      )}
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, background: deleting === p.id ? '#f3f4f6' : '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={13} /> {deleting === p.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips section */}
        <div style={{ marginTop: 24, background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 16 }}>💡 Tips to get more inquiries</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: '📸', title: 'Add more photos', desc: 'Listings with 5+ photos get 3x more views' },
              { icon: '📍', title: 'Add exact location', desc: 'Precise location gets 2x more inquiries' },
              { icon: '💧', title: 'Highlight water supply', desc: 'Ground water is a top search filter in Ethiopia' },
              { icon: '📱', title: 'Add WhatsApp number', desc: 'Buyers prefer WhatsApp for quick contact' },
              { icon: '🔄', title: 'Renew before expiry', desc: 'Active listings rank higher in search results' },
              { icon: '✍️', title: 'Write a good description', desc: 'Detailed descriptions build buyer trust' },
            ].map(tip => (
              <div key={tip.title} style={{ display: 'flex', gap: 10, padding: '12px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{tip.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{tip.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { CheckCircle, Home, FileText, RefreshCw } from 'lucide-react';

type Props = {
  propertyId: string;
  ownerClerkId: string;
  currentStatus: string;
  expiresAt?: string;
  onStatusChange?: (status: string) => void;
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', labelAm: 'ንቁ', color: '#059669', bg: '#d1fae5', icon: CheckCircle, desc: 'Visible to all buyers/renters' },
  { value: 'under_contract', label: 'Under Contract', labelAm: 'ውል ላይ', color: '#d97706', bg: '#fef3c7', icon: FileText, desc: 'In process, pending final deal' },
  { value: 'sold', label: 'Sold', labelAm: 'ተሸጧል', color: '#dc2626', bg: '#fef2f2', icon: Home, desc: 'Property has been sold' },
  { value: 'rented', label: 'Rented', labelAm: 'ተከራይቷል', color: '#7c3aed', bg: '#ede9fe', icon: Home, desc: 'Property has been rented' },
];

export function StatusManager({ propertyId, ownerClerkId, currentStatus, expiresAt, onStatusChange }: Props) {
  const [selected, setSelected] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const daysLeft = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const handleSave = async () => {
    if (selected === currentStatus) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/listings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, ownerClerkId, newStatus: selected })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        onStatusChange?.(selected);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Listing Status</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Update the status of your property listing</div>

      {/* Expiry info */}
      {expiresAt && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: daysLeft && daysLeft <= 7 ? '#fef2f2' : daysLeft && daysLeft <= 30 ? '#fffbeb' : '#f0f9ff', border: `1px solid ${daysLeft && daysLeft <= 7 ? '#fecaca' : daysLeft && daysLeft <= 30 ? '#fde68a' : '#bae6fd'}`, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Listing Expiry</div>
            <div style={{ fontSize: 13, color: daysLeft && daysLeft <= 7 ? '#dc2626' : '#374151', fontWeight: 600 }}>
              {daysLeft && daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} days left — ${new Date(expiresAt).toLocaleDateString()}`}
            </div>
          </div>
          {daysLeft && daysLeft <= 30 && (
            <a href={`/owner/listings/${propertyId}/renew`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#E8431A', color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              <RefreshCw size={13} /> Renew
            </a>
          )}
        </div>
      )}

      {/* Status selector */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {STATUS_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <div key={opt.value} onClick={() => setSelected(opt.value)}
              style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${selected === opt.value ? opt.color : '#e5e7eb'}`, background: selected === opt.value ? opt.bg : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
              <Icon size={20} color={selected === opt.value ? opt.color : '#9ca3af'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: selected === opt.value ? opt.color : '#111827' }}>
                  {opt.label} / {opt.labelAm}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{opt.desc}</div>
              </div>
              {selected === opt.value && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={12} color="white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning for closing statuses */}
      {(selected === 'sold' || selected === 'rented') && selected !== currentStatus && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
          ⚠️ Marking as <strong>{selected}</strong> will hide this listing from search results. You can reactivate it anytime.
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving || selected === currentStatus}
        style={{ width: '100%', padding: '12px', borderRadius: 10, background: saved ? '#059669' : saving || selected === currentStatus ? '#e5e7eb' : '#006AFF', color: saved || (saving || selected === currentStatus) ? (saved ? 'white' : '#9ca3af') : 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving || selected === currentStatus ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
        {saved ? '✓ Status Updated!' : saving ? 'Saving...' : selected === currentStatus ? 'No changes' : `Update to "${STATUS_OPTIONS.find(o => o.value === selected)?.label}"`}
      </button>
    </div>
  );
}

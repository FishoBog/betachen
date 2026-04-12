'use client';
import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Tag, Plus, Copy, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

type DiscountCode = {
  id: string;
  code: string;
  discount_percent: number;
  customer_name: string | null;
  customer_email: string | null;
  note: string | null;
  used: boolean;
  used_by_email: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid #e5e7eb', borderRadius: 8,
  fontSize: 14, color: '#111827', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', background: 'white',
};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: generateCode(),
    discount_percent: 50,
    customer_name: '',
    customer_email: '',
    note: '',
    expires_days: 30,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCodes = async () => {
    setLoading(true);
    const res = await fetch('/api/discount');
    const data = await res.json();
    setCodes(data.codes ?? []);
    setLoading(false);
  };

  useEffect(() => { loadCodes(); }, []);

  const handleCreate = async () => {
    if (!form.code || form.discount_percent < 0 || form.discount_percent > 100) {
      setError('Please fill in all required fields correctly.');
      return;
    }
    setCreating(true); setError(''); setSuccess('');
    const res = await fetch('/api/discount?action=create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(`Code ${form.code} created successfully!`);
      setShowForm(false);
      setForm({ code: generateCode(), discount_percent: 50, customer_name: '', customer_email: '', note: '', expires_days: 30 });
      loadCodes();
    } else {
      setError(data.error || 'Failed to create code');
    }
    setCreating(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCount = codes.filter(c => !c.used).length;
  const usedCount = codes.filter(c => c.used).length;
  const totalDiscount = codes.filter(c => c.used).reduce((sum, c) => {
    const saved = Math.round(500 * c.discount_percent / 100);
    return sum + saved;
  }, 0);

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '2rem', background: '#f9fafb' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>Discount Codes</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Generate and manage promotional discount codes for listing fees</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Generate Code
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Active Codes', value: activeCount, color: '#059669', bg: '#d1fae5', icon: '🎟️' },
            { label: 'Used Codes', value: usedCount, color: '#006AFF', bg: '#dbeafe', icon: '✅' },
            { label: 'Total Discount Given', value: `ETB ${totalDiscount.toLocaleString()}`, color: '#d97706', bg: '#fef3c7', icon: '💰' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Generate New Discount Code</div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Code <span style={{ color: '#9ca3af', fontWeight: 400 }}>(auto-generated)</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2, fontSize: 16 }}
                      value={form.code}
                      onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    />
                    <button onClick={() => setForm(p => ({ ...p, code: generateCode() }))}
                      title="Regenerate" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>
                      <RefreshCw size={16} color="#6b7280" />
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Discount % <span style={{ color: '#E8431A' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle, fontSize: 20, fontWeight: 900, color: '#E8431A', paddingRight: 40 }}
                      type="number" min={0} max={100}
                      value={form.discount_percent}
                      onChange={e => setForm(p => ({ ...p, discount_percent: parseInt(e.target.value) || 0 }))}
                    />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 700, color: '#E8431A' }}>%</span>
                  </div>
                  {form.discount_percent > 0 && (
                    <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                      Customer pays ETB {Math.round(500 * (1 - form.discount_percent / 100))} instead of ETB 500
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Customer Name</label>
                  <input style={inputStyle} value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} placeholder="e.g. Abebe Kebede" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Customer Email</label>
                  <input style={inputStyle} type="email" value={form.customer_email} onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))} placeholder="customer@gmail.com" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Note (internal)</label>
                  <input style={inputStyle} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="e.g. First listing promotion" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Expires In (days)</label>
                  <input style={inputStyle} type="number" min={1} value={form.expires_days} onChange={e => setForm(p => ({ ...p, expires_days: parseInt(e.target.value) || 30 }))} />
                </div>
              </div>
              {error && <div style={{ color: '#dc2626', fontSize: 13, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>{error}</div>}
              {success && <div style={{ color: '#059669', fontSize: 13, background: '#f0fdf4', padding: '10px 14px', borderRadius: 8 }}>{success}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCreate} disabled={creating}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: creating ? '#9ca3af' : '#059669', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: creating ? 'not-allowed' : 'pointer' }}>
                  {creating ? 'Creating...' : '✓ Create Discount Code'}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {success && !showForm && (
          <div style={{ background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#059669', fontWeight: 600, fontSize: 14 }}>
            ✅ {success}
          </div>
        )}

        {/* Codes table */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>All Discount Codes</div>
            <button onClick={loadCodes} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, cursor: 'pointer', color: '#6b7280' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : codes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Tag size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>No discount codes yet</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Click Generate Code to create your first one</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                    {['Code', 'Discount', 'Customer', 'Status', 'Expires', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {codes.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb', opacity: c.used ? 0.6 : 1 }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: '#111827', letterSpacing: 1 }}>{c.code}</span>
                          <button onClick={() => copyCode(c.code)} title="Copy"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === c.code ? '#059669' : '#9ca3af', padding: 2 }}>
                            {copied === c.code ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#E8431A' }}>{c.discount_percent}%</span>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>ETB {Math.round(500 * (1 - c.discount_percent / 100))} final</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.customer_name || '—'}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.customer_email || ''}</div>
                        {c.note && <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>{c.note}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.used ? (
                          <div>
                            <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>Used</span>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>by {c.used_by_email}</div>
                          </div>
                        ) : (
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>Active</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => copyCode(c.code)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                          {copied === c.code ? <><CheckCircle size={12} color="#059669" /> Copied!</> : <><Copy size={12} /> Copy Code</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

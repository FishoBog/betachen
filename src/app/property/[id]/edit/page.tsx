'use client';

export const dynamic = 'force-dynamic';
import { use } from 'react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
interface Props { params: Promise<{ id: string }> }
export default function EditPropertyPage({ params: paramsPromise }: Props) {
  const params = use(paramsPromise);
  const { user } = useUser();
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', status: '' });
  useEffect(() => {
    supabase.from('properties').select('*').eq('id', params.id).single()
      .then(({ data }) => {
        if (!data) { router.push('/owner/dashboard'); return; }
        if (data.owner_id !== user?.id) { router.push('/'); return; }
        setForm({ title: data.title, description: data.description ?? '', price: String(data.price), status: data.status });
        setLoading(false);
      });
  }, [params.id, user]);
  const save = async () => {
    setSaving(true);
    await supabase.from('properties').update({ title: form.title, description: form.description, price: Number(form.price), status: form.status }).eq('id', params.id);
    router.push('/owner/dashboard');
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Edit Listing</h1>
        <div className="card p-6 space-y-4">
          <input className="input-field" placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <input className="input-field" type="number" placeholder="Price" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          <select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button onClick={save} disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}

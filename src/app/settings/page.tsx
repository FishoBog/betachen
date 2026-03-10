'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';

export default function SettingsPage() {
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!user) return;
    const supabase = createBrowserClient();
    await supabase.from('profiles').upsert({ clerk_id: user.id, full_name: name, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Settings</h1>
        <div className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
            <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251..." />
          </div>
          <button onClick={save} className="btn-primary w-full">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}

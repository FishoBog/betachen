'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!user || !name) return;
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.from('profiles').upsert({ clerk_id: user.id, full_name: name, phone });
    await user.update({ firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') });
    router.push('/');
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Complete Your Profile</h1>
        <div className="space-y-4">
          <input className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="input-field" placeholder="Phone Number (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
          <button onClick={handleSubmit} disabled={loading || !name} className="w-full btn-primary">
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

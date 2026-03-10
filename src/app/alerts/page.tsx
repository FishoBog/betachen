'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { Bell, Trash2 } from 'lucide-react';

export default function AlertsPage() {
  const { user } = useUser();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    createBrowserClient().from('saved_searches').select('*').eq('user_id', user.id)
      .then(({ data }) => setAlerts(data ?? []));
  }, [user]);

  const remove = async (id: string) => {
    await createBrowserClient().from('saved_searches').delete().eq('id', id);
    setAlerts(p => p.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Search Alerts</h1>
        {alerts.length === 0 ? <p className="text-gray-500 text-center py-20">No alerts set up yet.</p>
          : <div className="space-y-3">{alerts.map(a => (
            <div key={a.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" style={{ color: 'var(--coral)' }} />
                <span className="font-medium">{a.name}</span>
              </div>
              <button onClick={() => remove(a.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}</div>}
      </main>
    </div>
  );
}

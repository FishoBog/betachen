'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { MessageSquare } from 'lucide-react';
import type { Chat } from '@/types';

export default function MessagesPage() {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) return;
    createBrowserClient().from('chats').select('*, properties(title), buyer:profiles!chats_buyer_id_fkey(full_name), owner:profiles!chats_owner_id_fkey(full_name)')
      .or(`buyer_id.eq.${user.id},owner_id.eq.${user.id}`).order('created_at', { ascending: false })
      .then(({ data }) => setChats((data as Chat[]) ?? []));
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Messages</h1>
        {chats.length === 0 ? <p className="text-gray-500 text-center py-20">No messages yet.</p>
          : <div className="space-y-3">{chats.map(c => (
            <Link key={c.id} href={`/messages/${c.id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--navy)' }}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{(c as any).properties?.title ?? 'Property'}</p>
                <p className="text-xs text-gray-500">{(c as any).buyer?.full_name ?? ''}</p>
              </div>
            </Link>
          ))}</div>}
      </main>
    </div>
  );
}

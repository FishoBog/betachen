'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { MessageSquare, Home, ChevronRight } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase
      .from('messages')
      .select('*, properties(id, title, location, type)')
      .or(`sender_clerk_id.eq.${user.id},receiver_clerk_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // Group by property_id — show latest message per property
        const seen = new Set();
        const grouped = (data ?? []).filter((m: any) => {
          if (seen.has(m.property_id)) return false;
          seen.add(m.property_id);
          return true;
        });
        setThreads(grouped);
        setLoading(false);
      });
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={24} color="#006AFF" /> Messages
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
        ) : threads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <MessageSquare size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No messages yet</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>When you message a property owner it will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {threads.map((m: any) => {
              const isMe = m.sender_clerk_id === user?.id;
              const isUnread = !m.is_read && m.receiver_clerk_id === user?.id;
              return (
                <div
                  key={m.id}
                  onClick={() => router.push(`/messages/${m.property_id}`)}
                  style={{ background: 'white', borderRadius: 14, border: `1px solid ${isUnread ? '#dbeafe' : '#e5e7eb'}`, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: isUnread ? '#006AFF' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Home size={20} color={isUnread ? 'white' : '#6b7280'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {m.properties?.title ?? 'Property'}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, marginLeft: 8 }}>
                        {new Date(m.created_at).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      {m.properties?.location ?? ''} • {isMe ? 'You messaged the owner' : 'Buyer messaged you'}
                    </div>
                    <div style={{ fontSize: 13, color: isUnread ? '#111827' : '#6b7280', fontWeight: isUnread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {isMe ? 'You: ' : ''}{m.content}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    {isUnread && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#006AFF' }} />
                    )}
                    <ChevronRight size={16} color="#9ca3af" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

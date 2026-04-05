'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { MessageSquare, Home } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase
      .from('messages')
      .select('*, properties(title, location, type)')
      .or(`sender_clerk_id.eq.${user.id},receiver_clerk_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // Group by property to show one thread per property
        const seen = new Set();
        const grouped = (data ?? []).filter((m: any) => {
          const key = `${m.property_id}-${m.sender_clerk_id === user.id ? m.receiver_clerk_id : m.sender_clerk_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setMessages(grouped);
        setLoading(false);
      });
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', marginBottom: 24 }}>
          💬 Messages
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <MessageSquare size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No messages yet</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>When you message a property owner it will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m: any) => {
              const isSender = m.sender_clerk_id === user?.id;
              const otherParty = isSender ? 'Owner' : 'Buyer';
              return (
                <div key={m.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#006AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Home size={20} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {m.properties?.title ?? 'Property'}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        {m.properties?.location ?? ''} • {isSender ? 'You messaged the owner' : 'Buyer messaged you'}
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {m.content}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                      {new Date(m.created_at).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  {!m.is_read && !isSender && (
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef2ee', color: '#E8431A', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                      NEW MESSAGE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

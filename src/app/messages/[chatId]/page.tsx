'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { Send, ArrowLeft, Home } from 'lucide-react';

const ADMIN_CLERK_ID = 'user_3AmnQEFKPsp6EX1W9xl88nOW4AV';

export default function MessageThreadPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  // Works whether the folder is [chatId] or [id]
  const propertyId = (params.chatId ?? params.id) as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [property, setProperty] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherPartyId, setOtherPartyId] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.id === ADMIN_CLERK_ID;

  useEffect(() => {
    if (!user || !propertyId) return;
    loadThread();
  }, [user, propertyId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThread = async () => {
    const supabase = createBrowserClient();

    // Load property
    const { data: prop } = await supabase
      .from('properties')
      .select('id, title, location, type, price, currency, owner_id')
      .eq('id', propertyId)
      .single();
    setProperty(prop);

    // Determine other party
    if (prop) {
      const other = prop.owner_id === user!.id
        ? null // owner sees all buyers
        : prop.owner_id;
      setOtherPartyId(other ?? '');
    }

    // Load thread + mark-as-read via secure server route (participant check enforced server-side)
    const res = await fetch(`/api/messages/thread?propertyId=${encodeURIComponent(propertyId)}`);
    const threadData = await res.json();
    setMessages(threadData.messages ?? []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !property) return;
    setSending(true);

    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, content: newMessage.trim() }),
    });
    const data = await res.json();

    if (data.message) {
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
    }
    setSending(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isLoaded) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Property header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, padding: '4px 0' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Home size={18} color="#006AFF" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {property?.title ?? 'Loading...'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {property?.location ?? ''} {isAdmin ? '• Admin view (all messages)' : property?.owner_id === user?.id ? '• You are the owner' : '• Conversation with owner'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: 14 }}>
              No messages yet. Start the conversation below.
            </div>
          ) : (
            messages.map((m: any) => {
              const isMe = m.sender_clerk_id === user?.id;
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%',
                    background: isMe ? '#006AFF' : 'white',
                    color: isMe ? 'white' : '#111827',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '12px 16px',
                    border: isMe ? 'none' : '1px solid #e5e7eb',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.content}</div>
                    <div style={{ fontSize: 10, marginTop: 6, opacity: 0.7, textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(m.created_at).toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {new Date(m.created_at).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })}
                      {isMe ? ' · You' : ' · Other party'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Reply box */}
      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send)"
            rows={2}
            style={{ flex: 1, padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' as const, boxSizing: 'border-box' as const }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            style={{ width: 48, height: 48, borderRadius: 12, background: !newMessage.trim() ? '#e5e7eb' : '#006AFF', border: 'none', cursor: !newMessage.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={20} color={!newMessage.trim() ? '#9ca3af' : 'white'} />
          </button>
        </div>
      </div>
    </div>
  );
}

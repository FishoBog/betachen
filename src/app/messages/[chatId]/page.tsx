'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { createBrowserClient } from '@/lib/supabase';
import { Send, ArrowLeft, Home } from 'lucide-react';

export default function MessageThreadPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [property, setProperty] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherPartyId, setOtherPartyId] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

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

    // Load all messages for this property involving this user
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('property_id', propertyId)
      .or(`sender_clerk_id.eq.${user!.id},receiver_clerk_id.eq.${user!.id}`)
      .order('created_at', { ascending: true });

    setMessages(msgs ?? []);

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('property_id', propertyId)
      .eq('receiver_clerk_id', user!.id)
      .eq('is_read', false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !property) return;
    setSending(true);

    const receiverId = property.owner_id === user.id
      ? messages.find((m: any) => m.sender_clerk_id !== user.id)?.sender_clerk_id
      : property.owner_id;

    if (!receiverId) {
      setSending(false);
      return;
    }

    const supabase = createBrowserClient();
    const { data } = await supabase.from('messages').insert({
      property_id: propertyId,
      sender_clerk_id: user.id,
      receiver_clerk_id: receiverId,
      content: newMessage.trim(),
      is_read: false,
    }).select().single();

    if (data) {
      setMessages(prev => [...prev, data]);
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
              {property?.location ?? ''} {property?.owner_id === user?.id ? '• You are the owner' : '• Conversation with owner'}
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

'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface Props { chatId: string; propertyTitle: string; }

export function ChatWindow({ chatId, propertyTitle }: Props) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at')
      .then(({ data }) => setMessages((data as Message[]) ?? []));
    const channel = supabase.channel(`chat:${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        payload => setMessages(p => [...p, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !user) return;
    const content = text.trim();
    setText('');
    await supabase.from('messages').insert({ chat_id: chatId, sender_id: user.id, content });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={cn('flex', m.sender_id === user?.id ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-xs px-4 py-2 rounded-2xl text-sm',
              m.sender_id === user?.id ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm')}
              style={m.sender_id === user?.id ? { background: 'var(--navy)' } : {}}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..." className="input-field flex-1" />
        <button onClick={send} className="btn-primary px-4">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

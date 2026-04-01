'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot, Phone } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTED = [
  'How do I post a listing?',
  'What payment methods are accepted?',
  'How does the cancellation policy work?',
  'How do I book a short stay?',
];

const SUGGESTED_AM = [
  'እንዴት ማስታወቂያ እለጥፋለሁ?',
  'ምን የክፍያ ዘዴዎች ይቀበላሉ?',
  'የሰርዛ ፖሊሲ እንዴት ነው?',
  'አጭር ቆይታ እንዴት እቆርጣለሁ?',
];

export function HelpChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'ሰላም! 👋 I\'m the ቤታችን Assistant. I can help you find properties, understand bookings, payments, and more. How can I help you today?\n\nሰላም! የቤታችን ረዳት ነኝ። ቤቶችን ለማግኘት፣ ክፍያዎችን እና ቦታ ማስያዝን ለማብራራት ዝግጁ ነኝ።' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'EN' | 'AM'>('EN');
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) { setUnread(0); inputRef.current?.focus(); }
  }, [open]);

  const send = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please email support@Betachen-et.com' }]);
    } finally {
      setLoading(false);
    }
  };

  const escalate = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '👤 I\'ll connect you with our team!\n\n📧 Email: support@Betachen-et.com\n📱 We typically respond within a few hours during business hours.\n\nYou can also describe your issue here and we\'ll make sure it gets to the right person.'
    }]);
  };

  const suggested = lang === 'AM' ? SUGGESTED_AM : SUGGESTED;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #006AFF, #0047CC)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,106,255,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={24} color="white" />}
        {!open && unread > 0 && (
          <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, background: '#E8431A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', border: '2px solid white' }}>
            {unread}
          </div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 999,
          width: 360, height: 520,
          background: 'white', borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease-out'
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #006AFF, #0047CC)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18 }}>ጎ</span>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>ቤታችን Assistant</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                  Online • Replies instantly
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Language toggle */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 2 }}>
                {(['EN', 'AM'] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    background: lang === l ? 'white' : 'transparent',
                    color: lang === l ? '#006AFF' : 'rgba(255,255,255,0.8)',
                  }}>{l === 'EN' ? 'EN' : 'አማ'}</button>
                ))}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'user' ? '#E8431A' : '#f0f4ff', marginTop: 2 }}>
                  {m.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="#006AFF" />}
                </div>
                <div style={{
                  maxWidth: '78%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: m.role === 'user' ? '#E8431A' : '#f8faff',
                  color: m.role === 'user' ? 'white' : '#1a1a2e',
                  fontSize: 13, lineHeight: 1.6,
                  border: m.role === 'assistant' ? '1px solid #e8f0fe' : 'none',
                  whiteSpace: 'pre-wrap' as const
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Suggested questions — show after first message only */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick questions</div>
                {suggested.map(q => (
                  <button key={q} onClick={() => send(q)} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e8f0fe', background: '#f8faff', color: '#006AFF', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e8f0fe'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8faff'; }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="#006AFF" />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: '#f8faff', border: '1px solid #e8f0fe', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#006AFF', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                  <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Human escalation */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center' }}>
            <button onClick={escalate} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#006AFF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}>
              <Phone size={13} />
              Talk to a human
            </button>
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={lang === 'AM' ? 'መልዕክት ይጻፉ...' : 'Type a message...'}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#111827' }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              style={{ width: 38, height: 38, borderRadius: 12, background: input.trim() && !loading ? '#006AFF' : '#e5e7eb', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
              {loading ? <Loader2 size={16} color="#9ca3af" /> : <Send size={16} color={input.trim() ? 'white' : '#9ca3af'} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

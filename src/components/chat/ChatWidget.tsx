'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { X, Send, MessageCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useLang } from '@/context/LangContext';

type Message = { role: 'user' | 'assistant'; content: string; };

const QUICK_QUESTIONS_EN = [
  'How do I post a listing?',
  'What is the listing fee?',
  'What areas are best in Addis?',
  'What is leasehold (ሊዝ)?',
  'How do I contact an owner?',
  'I am a diaspora investor',
];

const QUICK_QUESTIONS_AM = [
  'ማስታወቂያ እንዴት እለጥፋለሁ?',
  'የዝርዝር ክፍያ ምን ያህል ነው?',
  'በአዲስ አበባ ምን አካባቢ ጥሩ ነው?',
  'ሊዝ ምንድን ነው?',
  'ባለቤቱን እንዴት አነጋግራለሁ?',
  'የዲያስፖራ ኢንቨስተር ነኝ',
];

export function ChatWidget() {
  const { user } = useUser();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const am = lang === 'AM';
  const quickQuestions = am ? QUICK_QUESTIONS_AM : QUICK_QUESTIONS_EN;

  useEffect(() => {
    if (open && messages.length === 0) {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: am
          ? 'ሰላም! እኔ የቤታችን ረዳት ነኝ 🏠 ስለ ኢትዮጵያ ሪል እስቴት፣ ስለ ቤታችን አገልግሎቶች፣ ወይም ንብረት ለመፈለግ/ለመሸጥ/ለማከራየት እርዳታ ሊሰጥዎ ዝግጁ ነኝ። ምን ልረዳዎ?'
          : 'Hi! I\'m the Betachen Assistant 🏠 I can help you with Ethiopian real estate, finding or listing properties, understanding the market, and anything about our platform. What can I help you with?',
      }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userId: user?.id ?? null,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: am ? 'ይቅርታ፣ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።' : 'Sorry, something went wrong. Please try again.',
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: am
        ? 'ሰላም! ምን ልረዳዎ?'
        : 'Hi again! What can I help you with?',
    }]);
  };

  return (
    <>
      {/* ── Chat button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #006AFF, #0047CC)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,106,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          title={am ? 'ረዳት' : 'Chat with us'}
        >
          <MessageCircle size={24} color="white" />
          {/* Pulse ring */}
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(0,106,255,0.4)',
            animation: 'pulse 2s infinite',
          }} />
        </button>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 380, maxWidth: 'calc(100vw - 32px)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
          background: 'white',
          maxHeight: minimized ? 60 : 600,
          transition: 'max-height 0.3s ease',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #006AFF, #0047CC)',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                {am ? 'ቤታችን ረዳት' : 'Betachen Assistant'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                {am ? 'ዝግጁ' : 'Online — Ready to help'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={clearChat} title={am ? 'አጥፋ' : 'Clear chat'} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={13} color="white" />
              </button>
              <button onClick={() => setMinimized(m => !m)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronDown size={13} color="white" style={{ transform: minimized ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <button onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color="white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: '#f9fafb' }}>

                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {m.role === 'assistant' && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#006AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>
                        <MessageCircle size={13} color="white" />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '78%',
                      padding: '10px 14px',
                      borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: m.role === 'user' ? '#006AFF' : 'white',
                      color: m.role === 'user' ? 'white' : '#111827',
                      fontSize: 14, lineHeight: 1.5,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      whiteSpace: 'pre-wrap' as const,
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#006AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MessageCircle size={13} color="white" />
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', display: 'inline-block', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick questions — show only at start */}
                {messages.length === 1 && !loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, paddingLeft: 36 }}>
                      {am ? 'ፈጣን ጥያቄዎች:' : 'Quick questions:'}
                    </div>
                    {quickQuestions.map(q => (
                      <button key={q} onClick={() => sendMessage(q)} style={{ marginLeft: 36, padding: '8px 12px', borderRadius: 20, border: '1.5px solid #dbeafe', background: 'white', color: '#006AFF', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left' as const }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 14px', background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={am ? 'ጥያቄዎን ይጻፉ...' : 'Type your question...'}
                  rows={1}
                  style={{
                    flex: 1, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 12,
                    fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' as const,
                    lineHeight: 1.4, maxHeight: 80, overflowY: 'auto',
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: !input.trim() || loading ? '#e5e7eb' : '#006AFF',
                    border: 'none', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Send size={16} color={!input.trim() || loading ? '#9ca3af' : 'white'} />
                </button>
              </div>

              {/* Footer */}
              <div style={{ padding: '6px 14px 10px', background: 'white', textAlign: 'center' as const }}>
                <span style={{ fontSize: 10, color: '#d1d5db' }}>
                  {am ? 'ቤታችን ረዳት — AI ነው' : 'Betachen Assistant — Powered by AI'}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}

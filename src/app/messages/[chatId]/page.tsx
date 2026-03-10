'use client';

export const dynamic = 'force-dynamic';
import { use, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
interface Props { params: Promise<{ chatId: string }> }
export default function ChatPage({ params: paramsPromise }: Props) {
  const { chatId } = use(paramsPromise);
  const { user } = useUser();
  const [chat, setChat] = useState<any>(null);
  useEffect(() => {
    createBrowserClient().from('chats').select('*, properties(id,title,location_name), buyer:profiles!chats_buyer_id_fkey(full_name), owner:profiles!chats_owner_id_fkey(full_name)')
      .eq('id', chatId).single().then(({ data }) => setChat(data));
  }, [chatId]);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col">
        <Link href="/messages" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 mb-4 text-sm w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Messages
        </Link>
        {chat?.properties && (
          <Link href={`/property/${chat.properties.id}`} className="card p-3 mb-4 flex items-center gap-3 hover:shadow-md">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{chat.properties.title}</p>
              <p className="text-xs text-gray-400">{chat.properties.location_name}</p>
            </div>
          </Link>
        )}
        <div className="flex-1 card overflow-hidden" style={{ minHeight: '500px' }}>
          {chat && <ChatWindow chatId={chatId} propertyTitle={chat.properties?.title ?? ''} />}
        </div>
      </main>
    </div>
  );
}

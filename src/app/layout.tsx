import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Ethiopic, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { LangProvider } from '@/context/LangContext';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

const notoEthiopic = Noto_Sans_Ethiopic({ subsets: ['ethiopic'], weight: ['400','500','600','700'], variable: '--font-noto-ethiopic', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'ጎጆ — Real Estate in Ethiopia',
  description: 'Find, rent, and sell properties across Ethiopia',
  manifest: '/manifest.json',
};

export const viewport: Viewport = { themeColor: '#006AFF', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? 'pk_test_placeholder00000000000000000000000000000000000000000';
  return (
    <ClerkProvider publishableKey={key}>
      <html lang="am" className={`${notoEthiopic.variable} ${dmSans.variable}`}>
        <body className="antialiased" style={{ background: '#ffffff' }}>
          <LangProvider>
            <Navbar />
            {children}
          </LangProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

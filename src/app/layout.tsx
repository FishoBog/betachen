import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Ethiopic, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const notoEthiopic = Noto_Sans_Ethiopic({ subsets: ['ethiopic'], weight: ['400','500','600','700'], variable: '--font-noto-ethiopic', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'ጎጆ — Real Estate in Addis Ababa',
  description: 'Find, rent, and sell properties in Addis Ababa',
  manifest: '/manifest.json',
};

export const viewport: Viewport = { themeColor: '#0A2342', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="am" className={`${notoEthiopic.variable} ${dmSans.variable}`}>
        <body className="antialiased" style={{ background: 'var(--sand, #F7F6F2)' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

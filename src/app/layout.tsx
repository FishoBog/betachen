import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Ethiopic, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { LangProvider } from '@/context/LangContext';
import { HelpChat } from '@/components/chat/HelpChat';
import './globals.css';

const notoEthiopic = Noto_Sans_Ethiopic({ subsets: ['ethiopic'], weight: ['400','500','600','700'], variable: '--font-noto-ethiopic', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'ጎጆ Homes — Ethiopia Real Estate',
  description: "Ethiopia's #1 Real Estate Platform — Buy, Rent, Invest",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ጎጆ Homes',
  },
  icons: {
    icon: 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/gojo-logo.svg',
    apple: 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/gojo-logo.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#E8431A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? 'pk_test_placeholder00000000000000000000000000000000000000000';
  return (
    <ClerkProvider publishableKey={key}>
      <html lang="am" className={`${notoEthiopic.variable} ${dmSans.variable}`}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="ጎጆ Homes" />
          <link rel="apple-touch-icon" href="https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/gojo-logo.svg" />
        </head>
        <body className="antialiased" style={{ background: '#ffffff', margin: 0, padding: 0, overflowX: 'hidden', width: '100%' }}>
          <LangProvider>
            {children}
            <HelpChat />
          </LangProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
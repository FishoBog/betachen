import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Ethiopic, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { LangProvider } from '@/context/LangContext';
import { HelpChat } from '@/components/chat/HelpChat';
import './globals.css';

const notoEthiopic = Noto_Sans_Ethiopic({ subsets: ['ethiopic'], weight: ['400','500','600','700'], variable: '--font-noto-ethiopic', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'ቤታችን Homes — Real Estate in Ethiopia | Buy, Rent & Short Stay',
    template: '%s | ቤታችን Homes Ethiopia',
  },
  description: 'Find houses, apartments and properties for sale, rent and short stay across Ethiopia. ቤት ለኪራይ፣ ለሽያጭ እና አጭር ቆይታ በኢትዮጵያ። Ethiopia\'s #1 real estate platform — Addis Ababa, Dire Dawa and all major cities.',
  keywords: [
    'real estate Ethiopia',
    'house for rent Addis Ababa',
    'property for sale Ethiopia',
    'apartment for rent Addis Ababa',
    'short term stay Ethiopia',
    'furnished apartment Addis Ababa',
    'villa for rent Ethiopia',
    'condominium Ethiopia',
    'ቤት ለኪራይ አዲስ አበባ',
    'ቤት ለሽያጭ ኢትዮጵያ',
    'አፓርትመንት ለኪራይ',
    'ቤት ለአጭር ቆይታ',
    'ቤታችን ሆምስ',
    'Ethiopia property',
    'Addis Ababa real estate',
    'Ethiopia housing',
    'rent house Ethiopia',
    'buy property Addis Ababa',
    'short stay Addis Ababa',
    'diaspora Ethiopia real estate',
  ],
  authors: [{ name: 'ቤታችን Homes' }],
  creator: 'ቤታችን Homes',
  publisher: 'ቤታችን Homes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ቤታችን Homes',
  },
  icons: {
    icon: 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/betachen-logo.svg',
    apple: 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/betachen-logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_ET',
    alternateLocale: 'am_ET',
    url: 'https://www.betachen.com',
    siteName: 'ቤታችን Homes',
    title: 'ቤታችን Homes — Real Estate in Ethiopia',
    description: 'Find houses, apartments and properties for sale, rent and short stay across Ethiopia.',
    images: [
      {
        url: 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/hero-addis.jpg',
        width: 1200,
        height: 630,
        alt: 'ቤታችን Homes — Real Estate in Ethiopia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ቤታችን Homes — Real Estate in Ethiopia',
    description: 'Find houses, apartments and properties for sale, rent and short stay across Ethiopia.',
    images: ['https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/hero-addis.jpg'],
  },
  alternates: {
    canonical: 'https://www.betachen.com',
    languages: {
      'en-ET': 'https://www.betachen.com',
      'am-ET': 'https://www.betachen.com',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
          <meta name="google-site-verification" content="uBxm0oxxyRvmMztHXEXLlRAUqcXiSaKvtijuVN9TL6I" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="ቤታችን Homes" />
          <link rel="apple-touch-icon" href="https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/betachen-logo.svg" />
          <script
  dangerouslySetInnerHTML={{
    __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "w46nyb6hzp");`
  }}
/>
<script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "RealEstateAgent",
                "name": "ቤታችን Homes",
                "url": "https://www.betachen.com",
                "logo": "https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/betachen-logo.svg",
                "description": "Ethiopia's #1 Real Estate Platform — Buy, Rent and Short Stay properties across Ethiopia.",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Addis Ababa",
                  "addressCountry": "ET"
                },
                "areaServed": {
                  "@type": "Country",
                  "name": "Ethiopia"
                },
                "sameAs": [
                  "https://t.me/BetachenBot"
                ]
              })
            }}
          />
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
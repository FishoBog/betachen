'use client';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import { Mail, Home, MapPin, ListChecks, Upload, CheckCircle, ArrowRight, ShieldCheck, Clock, Phone } from 'lucide-react';

export default function HowToPostPage() {
  const { lang } = useLang();
  const EN = lang === 'EN';

  const steps = [
    {
      icon: Mail, color: '#E8431A', bg: '#fef2ee',
      titleEN: 'Verify your email', titleAM: 'ኢሜይልዎን ያረጋግጡ',
      bodyEN: 'You do not need an account. Enter your name, phone number and email. We send a 6-digit code to your email — type it in to continue. Check your spam folder if you do not see it.',
      bodyAM: 'መለያ አያስፈልግዎትም። ስምዎን፣ ስልክ ቁጥርዎን እና ኢሜይልዎን ያስገቡ። ወደ ኢሜይልዎ 6 አሃዝ ኮድ እንልካለን — ለመቀጠል ያስገቡት። ካላዩት የspam ፎልደርዎን ይመልከቱ።',
    },
    {
      icon: Home, color: '#1d4ed8', bg: '#dbeafe',
      titleEN: 'Step 1 — Property details', titleAM: 'ደረጃ 1 — የንብረት ዝርዝር',
      bodyEN: 'Write a clear title (e.g. "3 Bedroom Apartment in Bole"). Choose For Sale, Rent or Short Stay. Set the price — or mark it negotiable. Pick Residential or Commercial, then fill in bedrooms, bathrooms, size and any extra rooms.',
      bodyAM: 'ግልጽ ርዕስ ይጻፉ (ለምሳሌ "3 መኝታ ክፍል አፓርትመንት ቦሌ")። ሽያጭ፣ ኪራይ ወይም የአጭር ጊዜ ይምረጡ። ዋጋ ያስገቡ — ወይም ለድርድር ክፍት ያድርጉት። የመኖሪያ ወይም የንግድ ይምረጡ፣ ከዚያ መኝታ ክፍሎች፣ መታጠቢያዎች፣ ስፋት ይሙሉ።',
    },
    {
      icon: MapPin, color: '#065f46', bg: '#d1fae5',
      titleEN: 'Step 2 — Location', titleAM: 'ደረጃ 2 — አካባቢ',
      bodyEN: 'Choose your city and subcity, then add woreda, kebele and a nearby landmark so buyers can find it. For the map pin: open Google Maps, find your property, copy the coordinates and paste them in. This is optional but helps buyers a lot.',
      bodyAM: 'ከተማዎንና ክፍለ ከተማዎን ይምረጡ፣ ከዚያ ወረዳ፣ ቀበሌ እና አቅራቢያ ያለ ምልክት ይጨምሩ። ለካርታ ምልክት: ጉግል ካርታ ይክፈቱ፣ ንብረትዎን ያግኙ፣ መጋጠሚያዎቹን ቅዳ እና ይለጥፉ።',
    },
    {
      icon: ListChecks, color: '#7c3aed', bg: '#ede9fe',
      titleEN: 'Step 3 — Features & details', titleAM: 'ደረጃ 3 — ባህሪያትና ዝርዝሮች',
      bodyEN: 'Add plot size, parking, water and electricity reliability, internet, security (compound wall, guard), nearby landmarks and amenities like WiFi, generator or elevator. The more you fill in, the more serious your listing looks.',
      bodyAM: 'የቦታ ስፋት፣ ማቆሚያ፣ የውሃና የኤሌክትሪክ አስተማማኝነት፣ ኢንተርኔት፣ ደህንነት (ቅጥር ግቢ፣ ጠባቂ)፣ አቅራቢያ ምልክቶችና እንደ ዋይፋይ፣ ጀነሬተር ያሉ መገልገያዎችን ይጨምሩ።',
    },
    {
      icon: Upload, color: '#92400e', bg: '#fef3c7',
      titleEN: 'Step 4 — Photos', titleAM: 'ደረጃ 4 — ፎቶዎች',
      bodyEN: 'Upload clear photos — up to 10. The first photo becomes the cover, so make it your best one. Bright, wide shots of each room work best. Listings with good photos get far more messages.',
      bodyAM: 'ግልጽ ፎቶዎችን ይስቀሉ — እስከ 10 ድረስ። የመጀመሪያው ፎቶ ሽፋን ይሆናል፣ ስለዚህ ምርጡን ያድርጉት። ብሩህ፣ ሰፊ ፎቶዎች ይሻላሉ። ጥሩ ፎቶ ያላቸው ማስታወቂያዎች ብዙ መልዕክት ያገኛሉ።',
    },
    {
      icon: CheckCircle, color: '#059669', bg: '#d1fae5',
      titleEN: 'Step 5 — Review & publish', titleAM: 'ደረጃ 5 — ይገምግሙ እና ያትሙ',
      bodyEN: 'Check the summary of everything you entered. If it looks right, submit. You will be taken to the payment page to pay the listing fee. After payment your listing is reviewed and then goes live.',
      bodyAM: 'ያስገቡትን ሁሉ ማጠቃለያ ይመልከቱ። ትክክል ከሆነ ያስገቡ። የማስታወቂያ ክፍያ ለመክፈል ወደ ክፍያ ገጽ ይወሰዳሉ። ከክፍያ በኋላ ማስታወቂያዎ ተገምግሞ ይታተማል።',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0d1f45, #0f3460)', padding: '60px 24px 70px', textAlign: 'center' as const }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '8px 18px', marginBottom: 20 }}>
            <Home size={16} color="white" />
            <span style={{ color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: '0.5px' }}>
              {EN ? 'HOW TO POST' : 'እንዴት መለጠፍ እንደሚቻል'}
            </span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.15 }}>
            {EN ? 'List your property in 5 simple steps' : 'ንብረትዎን በ5 ቀላል ደረጃዎች ይዘርዝሩ'}
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 32 }}>
            {EN ? 'No account needed. The whole process takes about 10 minutes. Follow the steps below.' : 'መለያ አያስፈልግም። ሂደቱ በሙሉ 10 ደቂቃ ያህል ይወስዳል። ከታች ያሉትን ደረጃዎች ይከተሉ።'}
          </p>
          <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
            {EN ? 'Start Posting Now' : 'አሁን መለጠፍ ይጀምሩ'} <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Steps — now in a 2-column grid using the full width */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 22 }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: 'white', borderRadius: 18, border: '1px solid #e5e7eb', padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={30} color={s.color} />
                  </div>
                  <div style={{ position: 'absolute', top: -8, right: -8, width: 26, height: 26, borderRadius: '50%', background: s.color, color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i + 1}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 21, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
                    {EN ? s.titleEN : s.titleAM}
                  </div>
                  <div style={{ fontSize: 17, color: '#4b5563', lineHeight: 1.7 }}>
                    {EN ? s.bodyEN : s.bodyAM}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Before you start + reassurance, side by side using full width */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 22 }}>
          <div style={{ background: '#eff6ff', borderRadius: 18, border: '1px solid #dbeafe', padding: '28px 32px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1d4ed8', marginBottom: 18 }}>
              {EN ? 'Before you start, have these ready:' : 'ከመጀመርዎ በፊት እነዚህን ያዘጋጁ:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { en: 'A working email address (for the verification code)', am: 'የሚሰራ ኢሜይል አድራሻ (ለማረጋገጫ ኮድ)' },
                { en: 'Your phone number', am: 'የስልክ ቁጥርዎ' },
                { en: 'Clear photos of the property (up to 10)', am: 'ግልጽ የንብረት ፎቶዎች (እስከ 10)' },
                { en: 'The exact location — city, subcity and a landmark', am: 'ትክክለኛው አካባቢ — ከተማ፣ ክፍለ ከተማ እና ምልክት' },
                { en: 'The listing fee for payment at the end', am: 'በመጨረሻ ለክፍያ የማስታወቂያ ክፍያ' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 16, color: '#374151', lineHeight: 1.5 }}>{EN ? item.en : item.am}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: ShieldCheck, color: '#059669', titleEN: 'No account needed', titleAM: 'መለያ አያስፈልግም', descEN: 'Just verify your email and post.', descAM: 'ኢሜይልዎን አረጋግጠው ይለጥፉ።' },
              { icon: Clock, color: '#1d4ed8', titleEN: 'About 10 minutes', titleAM: '10 ደቂቃ ያህል', descEN: 'You can save time with photos ready.', descAM: 'ፎቶዎች ካዘጋጁ ጊዜ ይቆጥባሉ።' },
              { icon: Phone, color: '#E8431A', titleEN: 'Need help?', titleAM: 'እርዳታ ይፈልጋሉ?', descEN: 'Reach us on Telegram anytime.', descAM: 'በቴሌግራም በማንኛውም ጊዜ ያግኙን።' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Icon size={26} color={c.color} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{EN ? c.titleEN : c.titleAM}</div>
                    <div style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.5 }}>{EN ? c.descEN : c.descAM}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px 64px' }}>
        <div style={{ background: 'linear-gradient(135deg, #006AFF, #0047b3)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' as const }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 10 }}>
            {EN ? 'Ready to list your property?' : 'ንብረትዎን ለመዘርዘር ዝግጁ ነዎት?'}
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 26 }}>
            {EN ? 'Follow the 5 steps above — it only takes a few minutes.' : 'ከላይ ያሉትን 5 ደረጃዎች ይከተሉ — ጥቂት ደቂቃዎች ብቻ ይወስዳል።'}
          </div>
          <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 38px', background: 'white', color: '#006AFF', borderRadius: 12, fontWeight: 800, fontSize: 18, textDecoration: 'none' }}>
            {EN ? 'Post a Property' : 'ንብረት ይለጥፉ'} <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

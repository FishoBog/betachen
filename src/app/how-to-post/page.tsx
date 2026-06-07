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

      <div style={{ background: 'linear-gradient(135deg, #0d1f45, #0f3460)', padding: '56px 24px 64px', textAlign: 'center' as const }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 16px', marginBottom: 18 }}>
            <Home size={14} color="white" />
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>
              {EN ? 'HOW TO POST' : 'እንዴት መለጠፍ እንደሚቻል'}
            </span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: 'white', marginBottom: 14, lineHeight: 1.2 }}>
            {EN ? 'List your property in 5 simple steps' : 'ንብረትዎን በ5 ቀላል ደረጃዎች ይዘርዝሩ'}
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 28 }}>
            {EN ? 'No account needed. The whole process takes about 10 minutes. Follow the steps below.' : 'መለያ አያስፈልግም። ሂደቱ በሙሉ 10 ደቂቃ ያህል ይወስዳል። ከታች ያሉትን ደረጃዎች ይከተሉ።'}
          </p>
          <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
            {EN ? 'Start Posting Now' : 'አሁን መለጠፍ ይጀምሩ'} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 16px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px 26px', display: 'flex', gap: 18, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={26} color={s.color} />
                  </div>
                  <div style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: s.color, color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i + 1}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                    {EN ? s.titleEN : s.titleAM}
                  </div>
                  <div style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7 }}>
                    {EN ? s.bodyEN : s.bodyAM}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px 24px' }}>
        <div style={{ background: '#eff6ff', borderRadius: 16, border: '1px solid #dbeafe', padding: '24px 26px' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8', marginBottom: 14 }}>
            {EN ? 'Before you start, have these ready:' : 'ከመጀመርዎ በፊት እነዚህን ያዘጋጁ:'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { en: 'A working email address (for the verification code)', am: 'የሚሰራ ኢሜይል አድራሻ (ለማረጋገጫ ኮድ)' },
              { en: 'Your phone number', am: 'የስልክ ቁጥርዎ' },
              { en: 'Clear photos of the property (up to 10)', am: 'ግልጽ የንብረት ፎቶዎች (እስከ 10)' },
              { en: 'The exact location — city, subcity and a landmark', am: 'ትክክለኛው አካባቢ — ከተማ፣ ክፍለ ከተማ እና ምልክት' },
              { en: 'The listing fee for payment at the end', am: 'በመጨረሻ ለክፍያ የማስታወቂያ ክፍያ' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle size={18} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{EN ? item.en : item.am}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { icon: ShieldCheck, color: '#059669', titleEN: 'No account needed', titleAM: 'መለያ አያስፈልግም', descEN: 'Just verify your email and post.', descAM: 'ኢሜይልዎን አረጋግጠው ይለጥፉ።' },
            { icon: Clock, color: '#1d4ed8', titleEN: 'About 10 minutes', titleAM: '10 ደቂቃ ያህል', descEN: 'You can save time with photos ready.', descAM: 'ፎቶዎች ካዘጋጁ ጊዜ ይቆጥባሉ።' },
            { icon: Phone, color: '#E8431A', titleEN: 'Need help?', titleAM: 'እርዳታ ይፈልጋሉ?', descEN: 'Reach us on Telegram anytime.', descAM: 'በቴሌግራም በማንኛውም ጊዜ ያግኙን።' },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px' }}>
                <Icon size={22} color={c.color} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{EN ? c.titleEN : c.titleAM}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{EN ? c.descEN : c.descAM}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px 56px' }}>
        <div style={{ background: 'linear-gradient(135deg, #006AFF, #0047b3)', borderRadius: 18, padding: '32px 28px', textAlign: 'center' as const }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 8 }}>
            {EN ? 'Ready to list your property?' : 'ንብረትዎን ለመዘርዘር ዝግጁ ነዎት?'}
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 22 }}>
            {EN ? 'Follow the 5 steps above — it only takes a few minutes.' : 'ከላይ ያሉትን 5 ደረጃዎች ይከተሉ — ጥቂት ደቂቃዎች ብቻ ይወስዳል።'}
          </div>
          <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'white', color: '#006AFF', borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
            {EN ? 'Post a Property' : 'ንብረት ይለጥፉ'} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import { Mail, Home, MapPin, Upload, CheckCircle, ArrowRight, ShieldCheck, Clock, Phone, Tag } from 'lucide-react';

export default function HowToPostPage() {
  const { lang } = useLang();
  const EN = lang === 'EN';

  const steps = [
    {
      icon: Mail, color: '#E8431A', bg: '#fef2ee',
      titleEN: 'Verify by email or Telegram', titleAM: 'በኢሜይል ወይም በቴሌግራም ያረጋግጡ',
      bodyEN: 'You do not need an account. Choose Email or Telegram. For email, we send a 6-digit code — type it in to continue (check your spam folder). For Telegram, tap the button, press Start in the Betachen bot, and you are verified automatically — no code to type.',
      bodyAM: 'መለያ አያስፈልግዎትም። ኢሜይል ወይም ቴሌግራም ይምረጡ። ለኢሜይል 6 አሃዝ ኮድ እንልካለን — ለመቀጠል ያስገቡት (የspam ፎልደርዎን ይመልከቱ)። ለቴሌግራም ይጫኑ፣ በቤታችን ቦት ላይ Start ይጫኑ፣ ወዲያውኑ ይረጋገጣሉ — ኮድ ማስገባት አያስፈልግም።',
    },
    {
      icon: Home, color: '#1d4ed8', bg: '#dbeafe',
      titleEN: 'Step 1 — Property type & details', titleAM: 'ደረጃ 1 — የንብረት አይነትና ዝርዝር',
      bodyEN: 'Choose your property type: Residential, Short Stay, Commercial, Hotel or Guest House. For Residential, pick a sub-type — Condo / Apartment, Villa, or G+ (G+ also asks the number of floors). For Residential and Commercial you then choose For Sale or For Rent. Add a clear title, the price (or mark it negotiable), bedrooms, bathrooms, house area and water supply. For Villa and G+ for sale, you also add the plot size. Sale listings include parking, road access, construction stage and deed type here too.',
      bodyAM: 'የንብረትዎን አይነት ይምረጡ: መኖሪያ፣ የአጭር ጊዜ ቆይታ፣ የንግድ / ቢዝነስ፣ ሆቴል ወይም የእንግዳ ማረፊያ። ለመኖሪያ ንዑስ አይነት ይምረጡ — ኮንዶ / አፓርትማ፣ ቪላ ወይም ጂ+ (ጂ+ የወለል ብዛትም ይጠይቃል)። ለመኖሪያና ለንግድ ቀጥሎ ለሽያጭ ወይም ለኪራይ ይምረጡ። ግልጽ ርዕስ፣ ዋጋ (ወይም ለድርድር ክፍት)፣ መኝታ ክፍሎች፣ መታጠቢያ፣ የቤት ስፋትና የውሃ አቅርቦት ይጨምሩ። ለቪላና ለጂ+ ሽያጭ የቦታ ስፋትም ይጨምራሉ። የሽያጭ ማስታወቂያዎች የመኪና ማቆሚያ፣ የመንገድ መዳረሻ፣ የግንባታ ደረጃና የሰነድ አይነትም እዚሁ ያካትታሉ።',
    },
    {
      icon: MapPin, color: '#065f46', bg: '#d1fae5',
      titleEN: 'Step 2 — Location', titleAM: 'ደረጃ 2 — አካባቢ',
      bodyEN: 'Choose your city and subcity, then add woreda, kebele and a nearby landmark so buyers can find it. For the map pin, simply use your phone\u2019s location while you are at the property — one tap drops the pin for you.',
      bodyAM: 'ከተማዎንና ክፍለ ከተማዎን ይምረጡ፣ ከዚያ ወረዳ፣ ቀበሌ እና በአቅራቢያ ያለ ምልክት ይጨምሩ። ለካርታ ምልክት ንብረቱ ጋ ሆነው የስልክዎን አካባቢ ይጠቀሙ — በአንድ ጠቅታ ምልክቱ ይቀመጣል።',
    },
    {
      icon: Upload, color: '#92400e', bg: '#fef3c7',
      titleEN: 'Step 3 — Photos', titleAM: 'ደረጃ 3 — ፎቶዎች',
      bodyEN: 'Upload clear photos — up to 10. You can either upload photos from your device or take them directly with your phone\u2019s camera. The first photo becomes the cover, so make it your best one. Bright, wide shots of each room work best. Listings with good photos get far more messages.',
      bodyAM: 'ግልጽ ፎቶዎችን ያስገቡ — እስከ 10 ድረስ። ፎቶዎችን ከስልክዎ ፋይል መምረጥ ወይም በቀጥታ በሞባይልዎ ካሜራ አንስተው ማስገባት ይችላሉ። የመጀመሪያው ፎቶ ሽፋን ይሆናል፣ ስለዚህ ምርጡን ያድርጉት። ብሩህ፣ ሰፊ ፎቶዎች ይሻላሉ። ጥሩ ፎቶ ያላቸው ማስታወቂያዎች ብዙ መልዕክት ያገኛሉ።',
    },
    {
      icon: CheckCircle, color: '#059669', bg: '#d1fae5',
      titleEN: 'Step 4 — Review & publish', titleAM: 'ደረጃ 4 — ይገምግሙ እና ያትሙ',
      bodyEN: 'Check the summary of everything you entered — you can tap Edit on any item to fix it. When it looks right, submit. You will be taken to the payment page to pay the listing fee. After payment your listing is reviewed and then goes live.',
      bodyAM: 'ያስገቡት መረጃ ትክክል መሆኑን ያረጋግጡ — ማንኛውንም የተሳሳተ መረጃ ለማስተካከል «አስተካክል» የሚለውን ይጫኑ። ትክክል ከሆነ ያስገቡ። የማስታወቂያ ክፍያ ለመክፈል ወደ ክፍያ ገጽ ይወሰዳሉ። ከክፍያ በኋላ ማስታወቂያዎ ተገምግሞ ለእይታ ዝግጁ ይሆናል።',
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
              {EN ? 'HOW TO ADVERTISE' : 'እንዴት ማስተዋወቅ እንደሚቻል'}
            </span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.15 }}>
            {EN ? 'Advertise your property in 4 simple steps' : 'ንብረትዎን በ4 ቀላል ደረጃዎች ያስተዋውቁ'}
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 32 }}>
            {EN ? 'No account needed. It takes just 4 steps and about 10 minutes. Follow the steps below.' : 'መለያ አያስፈልግም። 4 ደረጃዎች ብቻ፣ 10 ደቂቃ ያህል ይወስዳል። ከታች ያሉትን ደረጃዎች ይከተሉ።'}
          </p>
          <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
            {EN ? 'Start Now' : 'አሁን ይጀምሩ'} <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Property type primer */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 24px 8px' }}>
        <div style={{ background: '#f0f6ff', borderRadius: 18, border: '1px solid #dbeafe', padding: '24px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Tag size={22} color="#1d4ed8" />
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1d4ed8' }}>
              {EN ? 'First, choose your property type' : 'መጀመሪያ የንብረትዎን አይነት ይምረጡ'}
            </div>
          </div>
          <div style={{ fontSize: 16, color: '#374151', lineHeight: 1.7 }}>
            {EN
              ? 'Residential and Commercial properties can be listed For Sale or For Rent. For Residential, you also pick a sub-type — Condo / Apartment, Villa or G+. Short Stay, Hotel and Guest House are stay-based listings. The form adapts to what you choose — for example, sale-specific details like plot size and deed type only appear for properties for sale.'
              : 'የመኖሪያና የንግድ ንብረቶች ለሽያጭ ወይም ለኪራይ ሊቀርቡ ይችላሉ። ለመኖሪያ ንዑስ አይነትም ይመርጣሉ — ኮንዶ / አፓርትማ፣ ቪላ ወይም ጂ+። የአጭር ጊዜ ቆይታ፣ ሆቴልና የእንግዳ ማረፊያ በቆይታ ላይ የተመሰረቱ ናቸው። ቅጹ በመረጡት መሰረት ይስተካከላል — ለምሳሌ እንደ የቦታ ስፋትና የሰነድ አይነት ያሉ ለሽያጭ የተወሰኑ ዝርዝሮች ለሽያጭ ንብረቶች ብቻ ይታያሉ።'}
          </div>
        </div>
      </div>

      {/* Steps — 2-column grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 22 }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: 'white', borderRadius: 18, border: '1px solid #e5e7eb', padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={30} color={s.color} />
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

      {/* Before you start + reassurance */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 22 }}>
          <div style={{ background: '#eff6ff', borderRadius: 18, border: '1px solid #dbeafe', padding: '28px 32px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1d4ed8', marginBottom: 18 }}>
              {EN ? 'Before you start, have these ready:' : 'ከመጀመርዎ በፊት እነዚህን ያዘጋጁ:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { en: 'An email address OR Telegram (for verification)', am: 'ኢሜይል አድራሻ ወይም ቴሌግራም (ለማረጋገጫ)' },
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
              { icon: ShieldCheck, color: '#059669', titleEN: 'No account needed', titleAM: 'መለያ አያስፈልግም', descEN: 'Verify by email or Telegram and post.', descAM: 'በኢሜይል ወይም በቴሌግራም አረጋግጠው ይለጥፉ።' },
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
            {EN ? 'Ready to advertise your property?' : 'ንብረትዎን ለማስተዋወቅ ዝግጁ ነዎት?'}
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 26 }}>
            {EN ? 'Follow the steps above — it only takes a few minutes.' : 'ከላይ ያሉትን ደረጃዎች ይከተሉ — ጥቂት ደቂቃዎች ብቻ ይወስዳል።'}
          </div>
          <Link href="/owner/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 38px', background: 'white', color: '#006AFF', borderRadius: 12, fontWeight: 800, fontSize: 18, textDecoration: 'none' }}>
            {EN ? 'Advertise a Property' : 'ንብረት ያስተዋውቁ'} <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

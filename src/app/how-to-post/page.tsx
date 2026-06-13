'use client';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import { Mail, Home, MapPin, ListChecks, Upload, CheckCircle, ArrowRight, ShieldCheck, Clock, Phone, Building2, Tag } from 'lucide-react';

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
      titleEN: 'Step 1 — Property type & details', titleAM: 'ደረጃ 1 — የንብረት አይነትና ዝርዝር',
      bodyEN: 'First choose your property type: Residential, Short Stay, Commercial, Hotel or Guest House. For Residential and Commercial you then choose For Sale or For Rent. Write a clear title, set the price (or mark it negotiable), and fill in bathrooms, kitchen, bedrooms and size.',
      bodyAM: 'መጀመሪያ የንብረትዎን አይነት ይምረጡ: መኖሪያ፣ የአጭር ጊዜ ቆይታ፣ የንግድ / ቢዝነስ፣ ሆቴል ወይም የእንግዳ ማረፊያ። ለመኖሪያና ለንግድ ቀጥሎ ለሽያጭ ወይም ለኪራይ ይምረጡ። ግልጽ ርዕስ ይጻፉ፣ ዋጋ ያስገቡ (ወይም ለድርድር ክፍት ያድርጉ)፣ መታጠቢያ፣ ኩሽና፣ መኝታ ክፍሎችና ስፋት ይሙሉ።',
    },
    {
      icon: MapPin, color: '#065f46', bg: '#d1fae5',
      titleEN: 'Step 2 — Location', titleAM: 'ደረጃ 2 — አካባቢ',
      bodyEN: 'Choose your city and subcity, then add woreda, kebele and a nearby landmark so buyers can find it. For the map pin you can use your phone\u2019s location while at the property, or open Google Maps, copy the coordinates and paste them in.',
      bodyAM: 'ከተማዎንና ክፍለ ከተማዎን ይምረጡ፣ ከዚያ ወረዳ፣ ቀበሌ እና በአቅራቢያ ያለ ምልክት ይጨምሩ። ለካርታ ምልክት ንብረቱ ጋ ሆነው የስልክዎን አካባቢ መጠቀም ይችላሉ፣ ወይም ጉግል ካርታ ከፍተው መጋጠሚያዎቹን ቅዳ እና ይለጥፉ።',
    },
    {
      icon: ListChecks, color: '#7c3aed', bg: '#ede9fe', saleOnly: true,
      titleEN: 'Step 3 — Features & details (for properties for sale)', titleAM: 'ደረጃ 3 — ባህሪያትና ዝርዝሮች (ለሽያጭ ንብረቶች)',
      bodyEN: 'This step appears only when your property is For Sale. Add plot size, parking, water (well water, water tanker), electricity and internet, security (fence, guard), construction stage, deed type, nearby services and amenities like WiFi, generator, water heater or elevator. Rentals, short stay, hotels and guest houses skip this step.',
      bodyAM: 'ይህ ደረጃ ንብረትዎ ለሽያጭ ሲሆን ብቻ ይታያል። የቦታ ስፋት፣ ማቆሚያ፣ ውሃ (የጉድጓድ ውሃ፣ የውሃ ታንከር)፣ ኤሌክትሪክና ኢንተርኔት፣ ደህንነት (አጥር፣ ጠባቂ)፣ የግንባታ ደረጃ፣ የሰነድ አይነት፣ በአቅራቢያ ያሉ አገልግሎቶችና እንደ ዋይፋይ፣ ጀነሬተር፣ ውሃ ማሞቂያ ያሉ መገልገያዎችን ይጨምሩ። ኪራይ፣ የአጭር ጊዜ ቆይታ፣ ሆቴልና የእንግዳ ማረፊያ ይህን ደረጃ ይዘላሉ።',
    },
    {
      icon: Upload, color: '#92400e', bg: '#fef3c7',
      titleEN: 'Step — Photos', titleAM: 'ደረጃ — ፎቶዎች',
      bodyEN: 'Upload clear photos — up to 10. The first photo becomes the cover, so make it your best one. Bright, wide shots of each room work best. Listings with good photos get far more messages.',
      bodyAM: 'ግልጽ ፎቶዎችን ይስቀሉ — እስከ 10 ድረስ። የመጀመሪያው ፎቶ ሽፋን ይሆናል፣ ስለዚህ ምርጡን ያድርጉት። ብሩህ፣ ሰፊ ፎቶዎች ይሻላሉ። ጥሩ ፎቶ ያላቸው ማስታወቂያዎች ብዙ መልዕክት ያገኛሉ።',
    },
    {
      icon: CheckCircle, color: '#059669', bg: '#d1fae5',
      titleEN: 'Step — Review & publish', titleAM: 'ደረጃ — ይገምግሙ እና ያትሙ',
      bodyEN: 'Check the summary of everything you entered — you can tap Edit on any item to fix it. When it looks right, submit. You will be taken to the payment page to pay the listing fee. After payment your listing is reviewed and then goes live.',
      bodyAM: 'ያስገቡትን ሁሉ ማጠቃለያ ይመልከቱ — ማንኛውንም ለማስተካከል «አስተካክል» ይጫኑ። ትክክል ከሆነ ያስገቡ። የማስታወቂያ ክፍያ ለመክፈል ወደ ክፍያ ገጽ ይወሰዳሉ። ከክፍያ በኋላ ማስታወቂያዎ ተገምግሞ ይታተማል።',
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
            {EN ? 'Advertise your property in a few simple steps' : 'ንብረትዎን በጥቂት ቀላል ደረጃዎች ያስተዋውቁ'}
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 32 }}>
            {EN ? 'No account needed. It takes 4\u20135 steps depending on your property type, and about 10 minutes. Follow the steps below.' : 'መለያ አያስፈልግም። እንደ ንብረትዎ አይነት 4\u20135 ደረጃዎች ይወስዳል፣ 10 ደቂቃ ያህል። ከታች ያሉትን ደረጃዎች ይከተሉ።'}
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
              ? 'Residential and Commercial properties can be listed For Sale or For Rent. Short Stay, Hotel and Guest House are stay-based listings. The form adapts to the type you choose — for example, sale-specific details like plot size and deed type only appear for properties for sale.'
              : 'የመኖሪያና የንግድ ንብረቶች ለሽያጭ ወይም ለኪራይ ሊቀርቡ ይችላሉ። የአጭር ጊዜ ቆይታ፣ ሆቴልና የእንግዳ ማረፊያ በቆይታ ላይ የተመሰረቱ ናቸው። ቅጹ እርስዎ በመረጡት አይነት መሰረት ይስተካከላል — ለምሳሌ እንደ የቦታ ስፋትና የሰነድ አይነት ያሉ ለሽያጭ የተወሰኑ ዝርዝሮች ለሽያጭ ንብረቶች ብቻ ይታያሉ።'}
          </div>
        </div>
      </div>

      {/* Steps — 2-column grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 22 }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: 'white', borderRadius: 18, border: s.saleOnly ? '1.5px solid #ede9fe' : '1px solid #e5e7eb', padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
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
                  {s.saleOnly && (
                    <div style={{ marginTop: 12, display: 'inline-block', background: '#ede9fe', color: '#6d28d9', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                      {EN ? 'Properties for sale only' : 'ለሽያጭ ንብረቶች ብቻ'}
                    </div>
                  )}
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

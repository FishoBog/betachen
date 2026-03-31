'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import { CheckCircle, ArrowRight, Building2, Scale, Truck, Paintbrush, Landmark, ClipboardList, HardHat, Shield, Star, Zap, Eye, MousePointer, TrendingUp, Megaphone } from 'lucide-react';

const PACKAGES = [
  {
    key: 'basic',
    labelEn: 'Basic',
    labelAm: 'መሠረታዊ',
    price: 500,
    durationMonths: 1,
    color: '#006AFF',
    features: [
      { en: 'Homepage sponsored cards', am: 'በዋናው ገጽ ላይ ስፖንሰር ካርድ' },
      { en: 'Up to 1,000 impressions/day', am: 'እስከ 1,000 ዕይታ/ቀን' },
      { en: 'Business profile card', am: 'የንግድ ፕሮፋይል ካርድ' },
      { en: '1 month duration', am: '1 ወር' },
    ],
    popular: false,
  },
  {
    key: 'standard',
    labelEn: 'Standard',
    labelAm: 'መደበኛ',
    price: 1500,
    durationMonths: 1,
    color: '#E8431A',
    features: [
      { en: 'Homepage + property detail pages', am: 'ዋናው ገጽ + የንብረት ዝርዝር ገጾች' },
      { en: 'Up to 5,000 impressions/day', am: 'እስከ 5,000 ዕይታ/ቀን' },
      { en: 'Logo + banner image', am: 'ሎጎ + ባነር ምስል' },
      { en: 'Custom CTA button', am: 'ብጁ CTA ቁልፍ' },
      { en: '1 month duration', am: '1 ወር' },
    ],
    popular: true,
  },
  {
    key: 'premium',
    labelEn: 'Premium',
    labelAm: 'ፕሪሚየም',
    price: 3000,
    durationMonths: 1,
    color: '#5b21b6',
    features: [
      { en: 'All placements across site', am: 'በሁሉም ገጾች' },
      { en: 'Up to 15,000 impressions/day', am: 'እስከ 15,000 ዕይታ/ቀን' },
      { en: 'Priority top placement', am: 'ቅድሚያ የሚሰጥ ቦታ' },
      { en: 'Logo + banner + rich card', am: 'ሎጎ + ባነር + ሙሉ ካርድ' },
      { en: 'Monthly performance report', am: 'ወርሃዊ የአፈጻጸም ሪፖርት' },
      { en: '1 month duration', am: '1 ወር' },
    ],
    popular: false,
  },
  {
    key: 'annual',
    labelEn: 'Annual',
    labelAm: 'ዓመታዊ',
    price: 15000,
    durationMonths: 12,
    color: '#047857',
    features: [
      { en: 'Everything in Premium', am: 'ሁሉም የፕሪሚየም ጥቅሞች' },
      { en: '12 months — save ETB 21,000', am: '12 ወር — ETB 21,000 ይቆጥቡ' },
      { en: 'Dedicated account manager', am: 'ወኪል አስተዳዳሪ' },
      { en: 'Featured in newsletter', am: 'በኒውስሌተር ይካተቱ' },
      { en: 'Social media shoutout', am: 'በሶሻል ሚዲያ ይጠቀሳሉ' },
    ],
    popular: false,
  },
];

const CATEGORIES = [
  { key: 'construction', labelEn: 'Construction & Contractors', labelAm: 'ግንባታ', icon: HardHat, color: '#fff7ed', iconColor: '#c2410c' },
  { key: 'legal', labelEn: 'Legal & Notary Services', labelAm: 'የሕግ አገልግሎቶች', icon: Scale, color: '#dbeafe', iconColor: '#1d4ed8' },
  { key: 'moving', labelEn: 'Moving & Logistics', labelAm: 'ማጓጓዝ', icon: Truck, color: '#d1fae5', iconColor: '#065f46' },
  { key: 'banking', labelEn: 'Banks & Mortgage', labelAm: 'ባንክና ሞርጌጅ', icon: Landmark, color: '#fef3c7', iconColor: '#92400e' },
  { key: 'interior', labelEn: 'Interior Design & Renovation', labelAm: 'የቤት ዲዛይን', icon: Paintbrush, color: '#fce7f3', iconColor: '#9d174d' },
  { key: 'insurance', labelEn: 'Insurance', labelAm: 'ኢንሹራንስ', icon: Shield, color: '#ede9fe', iconColor: '#5b21b6' },
  { key: 'hotel', labelEn: 'Hotels & Short Stay', labelAm: 'ሆቴልና አጭር ቆይታ', icon: Building2, color: '#ecfdf5', iconColor: '#047857' },
  { key: 'property_management', labelEn: 'Property Management', labelAm: 'የንብረት አስተዳደር', icon: ClipboardList, color: '#f0fdf4', iconColor: '#15803d' },
  { key: 'general', labelEn: 'General Business', labelAm: 'ጠቅላላ ንግድ', icon: TrendingUp, color: '#f3f4f6', iconColor: '#374151' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: 15, color: '#111827', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', background: 'white',
};

const labelStyle: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6,
};

export default function AdvertisePage() {
  const { lang } = useLang();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [step, setStep] = useState<'landing' | 'form' | 'success'>('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_whatsapp: '',
    website_url: '',
    headline: '',
    tagline: '',
    description: '',
    cta_text: '',
    cta_url: '',
  });

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));
  const pkg = PACKAGES.find(p => p.key === selectedPackage)!;

  const handleSubmit = async () => {
    if (!form.business_name || !form.business_email || !form.headline || !form.description || !selectedCategory) {
      setError(lang === 'EN' ? 'Please fill in all required fields' : 'ሁሉንም አስፈላጊ መስኮች ይሙሉ');
      return;
    }
    setLoading(true); setError('');
    try {
      const supabase = createBrowserClient();
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + pkg.durationMonths);
      const { error: err } = await supabase.from('advertisements').insert({
        business_name: form.business_name,
        business_email: form.business_email,
        business_phone: form.business_phone,
        business_whatsapp: form.business_whatsapp,
        website_url: form.website_url,
        category: selectedCategory,
        package: selectedPackage,
        headline: form.headline,
        tagline: form.tagline,
        description: form.description,
        cta_text: form.cta_text || (lang === 'EN' ? 'Contact Us' : 'ያነጋግሩን'),
        cta_url: form.cta_url,
        placement: selectedPackage === 'basic' ? ['homepage'] : selectedPackage === 'standard' ? ['homepage', 'property_detail'] : ['homepage', 'property_detail', 'commercial'],
        status: 'pending_review',
        payment_status: 'pending',
        price_etb: pkg.price,
        duration_months: pkg.durationMonths,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      if (err) throw err;
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' as const }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#059669" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 12 }}>
          {lang === 'EN' ? 'Application Submitted!' : 'ማመልከቻ ተልኳል!'}
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
          {lang === 'EN'
            ? 'Thank you! We will review your ad application and contact you within 24 hours with payment instructions.'
            : 'እናመሰግናለን! የማስታወቂያ ማመልከቻዎን እንገመግማለን እና በ24 ሰዓት ውስጥ የክፍያ መረጃ ይልካልሃ።'}
        </p>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 24, textAlign: 'left' as const }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
            {lang === 'EN' ? 'What happens next:' : 'ቀጣይ ደረጃዎች:'}
          </div>
          {[
            { n: '1', en: 'Our team reviews your ad (within 24 hours)', am: 'ቡድናችን ማስታወቂያዎን ይገመግማል (በ24 ሰዓት)' },
            { n: '2', en: 'We contact you with Chapa payment link', am: 'የቻፓ ክፍያ ሊንክ ይልካሎ' },
            { n: '3', en: 'After payment, your ad goes live immediately', am: 'ከክፍያ በኋላ ማስታወቂያዎ ወዲያውኑ ይጀምራል' },
          ].map(({ n, en, am }) => (
            <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#006AFF', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
              <span style={{ fontSize: 14, color: '#374151' }}>{lang === 'EN' ? en : am}</span>
            </div>
          ))}
        </div>
        <button onClick={() => router.push('/')}
          style={{ padding: '13px 32px', background: '#006AFF', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
          {lang === 'EN' ? 'Back to Home' : 'ወደ ዋናው ገጽ'}
        </button>
      </div>
    </div>
  );

  if (step === 'form') return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 8 }}>
            {lang === 'EN' ? 'Submit Your Ad' : 'ማስታወቂያዎን ያስገቡ'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>
            {lang === 'EN'
              ? `${pkg.labelEn} Package — ETB ${pkg.price.toLocaleString()} / ${pkg.durationMonths === 12 ? 'year' : 'month'}`
              : `${pkg.labelAm} ፓኬጅ — ETB ${pkg.price.toLocaleString()} / ${pkg.durationMonths === 12 ? 'ዓመት' : 'ወር'}`}
          </p>
        </div>

        {/* Business Info */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px 32px', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
            {lang === 'EN' ? 'Business Information' : 'የንግድ መረጃ'}
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Business Name *' : 'የንግድ ስም *'}</label>
                <input style={inputStyle} value={form.business_name} onChange={e => set('business_name', e.target.value)}
                  placeholder={lang === 'EN' ? 'e.g. ABC Law Firm' : 'ለምሳሌ፦ ABC የሕግ ቢሮ'} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Category *' : 'ምድብ *'}</label>
                <select style={inputStyle} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                  <option value="">{lang === 'EN' ? '— Select category —' : '— ምድብ ይምረጡ —'}</option>
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{lang === 'EN' ? c.labelEn : c.labelAm}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Email *' : 'ኢሜይል *'}</label>
                <input style={inputStyle} type="email" value={form.business_email} onChange={e => set('business_email', e.target.value)}
                  placeholder="business@example.com" />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Phone' : 'ስልክ'}</label>
                <input style={inputStyle} value={form.business_phone} onChange={e => set('business_phone', e.target.value)}
                  placeholder="+251911234567" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'WhatsApp' : 'ዋትሳፕ'}</label>
                <input style={inputStyle} value={form.business_whatsapp} onChange={e => set('business_whatsapp', e.target.value)}
                  placeholder="+251911234567" />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Website URL' : 'ድረ-ገጽ'}</label>
                <input style={inputStyle} value={form.website_url} onChange={e => set('website_url', e.target.value)}
                  placeholder="https://yourbusiness.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Ad Content */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px 32px', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
            {lang === 'EN' ? 'Ad Content' : 'የማስታወቂያ ይዘት'}
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={labelStyle}>{lang === 'EN' ? 'Headline *' : 'ርዕስ *'}</label>
              <input style={inputStyle} value={form.headline} onChange={e => set('headline', e.target.value)}
                placeholder={lang === 'EN' ? 'e.g. #1 Property Lawyers in Addis Ababa' : 'ለምሳሌ፦ በአዲስ አበባ ቁጥር 1 የንብረት ጠበቆች'} />
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                {lang === 'EN' ? 'Short and impactful — max 60 characters' : 'አጭርና ጠቃሚ — እስከ 60 ፊደሎች'}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{lang === 'EN' ? 'Tagline' : 'መሪ ቃል'}</label>
              <input style={inputStyle} value={form.tagline} onChange={e => set('tagline', e.target.value)}
                placeholder={lang === 'EN' ? 'e.g. Fast, trusted, affordable legal services' : 'ፈጣን፣ ታማኝ፣ ተመጣጣኝ የሕግ አገልግሎት'} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'EN' ? 'Description *' : 'መግለጫ *'}</label>
              <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' as const }}
                value={form.description} onChange={e => set('description', e.target.value)}
                placeholder={lang === 'EN' ? 'Describe your business and services clearly...' : 'ንግድዎን እና አገልግሎቶችዎን በግልጽ ይግለጹ...'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'CTA Button Text' : 'የቁልፍ ጽሑፍ'}</label>
                <input style={inputStyle} value={form.cta_text} onChange={e => set('cta_text', e.target.value)}
                  placeholder={lang === 'EN' ? 'e.g. Book a Consultation' : 'ለምሳሌ፦ ምክር ያስያዙ'} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'CTA Link (phone, website or WhatsApp)' : 'የቁልፍ ሊንክ'}</label>
                <input style={inputStyle} value={form.cta_url} onChange={e => set('cta_url', e.target.value)}
                  placeholder="https:// or tel:+251..." />
              </div>
            </div>
          </div>
        </div>

        {/* Package Summary */}
        <div style={{ background: 'white', borderRadius: 16, border: `2px solid ${pkg.color}`, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                {lang === 'EN' ? pkg.labelEn : pkg.labelAm} {lang === 'EN' ? 'Package' : 'ፓኬጅ'}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {lang === 'EN' ? `${pkg.durationMonths} month${pkg.durationMonths > 1 ? 's' : ''} — reviewed within 24 hours` : `${pkg.durationMonths} ወር — በ24 ሰዓት ይገመገማል`}
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: pkg.color }}>
              ETB {pkg.price.toLocaleString()}
            </div>
          </div>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setStep('landing')}
            style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            {lang === 'EN' ? 'Back' : 'ተመለስ'}
          </button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex: 2, padding: '14px', borderRadius: 12, background: loading ? '#9ca3af' : pkg.color, color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? (lang === 'EN' ? 'Submitting...' : 'በማስገባት ላይ...') : (lang === 'EN' ? 'Submit Ad Application' : 'ማስታወቂያ አስገባ')} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f3460 100%)', padding: '72px 24px 80px', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,1) 40px, rgba(255,255,255,1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,1) 40px, rgba(255,255,255,1) 41px)' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8431A', borderRadius: 20, padding: '7px 18px', marginBottom: 24 }}>
            <Megaphone size={14} color="white" />
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.8px' }}>
              {lang === 'EN' ? 'ADVERTISE ON ጎጆ' : 'በጎጆ ላይ ያስተዋውቁ'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 18 }}>
            {lang === 'EN' ? 'Reach Thousands of' : 'ሺዎችን'}<br />
            <span style={{ color: '#38bdf8' }}>{lang === 'EN' ? 'Property Buyers & Owners' : 'የቤት ገዢዎችና ባለቤቶች ይድረሱ'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
            {lang === 'EN'
              ? 'Put your business in front of active property buyers, sellers, renters and investors across Ethiopia every single day.'
              : 'ንግድዎን በየቀኑ ለቤት ገዢዎች፣ ሻጮች፣ ተከራዮችና ባለሀብቶች ያሳዩ።'}
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' as const }}>
            {[
              { n: '10,000+', en: 'Monthly Visitors', am: 'ወርሃዊ ጎብኝዎች', icon: Eye },
              { n: '1,200+', en: 'Active Listings', am: 'ንቁ ዝርዝሮች', icon: Building2 },
              { n: '500+', en: 'Property Owners', am: 'ባለቤቶች', icon: Star },
              { n: '24hrs', en: 'Ad Review Time', am: 'የማስታወቂያ ግምገማ ጊዜ', icon: Zap },
            ].map(({ n, en, am, icon: Icon }) => (
              <div key={n} style={{ textAlign: 'center' as const }}>
                <Icon size={20} color="rgba(255,255,255,0.4)" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 26, fontWeight: 900, color: 'white' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3, fontWeight: 600 }}>{lang === 'EN' ? en : am}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why advertise */}
      <div style={{ background: '#f9fafb', padding: '64px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', textAlign: 'center' as const, marginBottom: 12 }}>
            {lang === 'EN' ? 'Why Advertise on ጎጆ?' : 'ለምን በጎጆ ላይ ያስተዋውቁ?'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 16, textAlign: 'center' as const, marginBottom: 48 }}>
            {lang === 'EN' ? 'Highly targeted audience actively looking for property-related services' : 'ለቤት ነክ አገልግሎቶች ንቁ የሆነ ዒላማ ተደራሲ'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { icon: Eye, color: '#dbeafe', iconColor: '#1d4ed8', en: 'High Intent Audience', am: 'ዒላማ ተደራሲ', descEn: 'People on ጎጆ are actively buying, renting or investing in property — they need your services now.', descAm: 'በጎጆ ላይ ያሉ ሰዎች ቤት እየገዙ፣ እየተከራዩ ወይም ኢንቨስት እያደረጉ ናቸው።' },
              { icon: MousePointer, color: '#d1fae5', iconColor: '#065f46', en: 'High Click Rates', am: 'ከፍተኛ ጠቅ ምጣኔ', descEn: 'Property seekers are 3x more likely to engage with relevant service ads compared to general platforms.', descAm: 'ቤት ፈላጊዎች ከሌሎች መድረኮች 3 እጥፍ ለሚመለከታቸው ማስታወቂያዎች ምላሽ ይሰጣሉ።' },
              { icon: TrendingUp, color: '#fef3c7', iconColor: '#92400e', en: 'Growing Platform', am: 'እያደገ ያለ መድረክ', descEn: 'ጎጆ is Ethiopia\'s fastest growing real estate platform with thousands of new users every month.', descAm: 'ጎጆ በኢትዮጵያ በፍጥነት እያደገ ያለ የሪል እስቴት መድረክ ነው።' },
              { icon: Shield, color: '#ede9fe', iconColor: '#5b21b6', en: 'Brand Trust', am: 'የብራንድ እምነት', descEn: 'Being featured on ጎጆ signals credibility and professionalism to property buyers and owners.', descAm: 'በጎጆ ላይ መካተት ለቤት ገዢዎችና ባለቤቶች ታማኝነትዎን ያሳያል።' },
            ].map(({ icon: Icon, color, iconColor, en, am, descEn, descAm }) => (
              <div key={en} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', border: '1px solid #e5e7eb' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={26} color={iconColor} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{lang === 'EN' ? en : am}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{lang === 'EN' ? descEn : descAm}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Categories */}
      <div style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', textAlign: 'center' as const, marginBottom: 12 }}>
            {lang === 'EN' ? 'Supported Ad Categories' : 'ተቀባይነት ያላቸው ምድቦች'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 16, textAlign: 'center' as const, marginBottom: 40 }}>
            {lang === 'EN' ? 'We accept ads from businesses directly relevant to property buyers and owners' : 'ለቤት ገዢዎችና ባለቤቶች ቀጥተኛ ግንኙነት ካላቸው ንግዶች ማስታወቂያ እንቀበላለን'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(({ key, labelEn, labelAm, icon: Icon, color, iconColor }) => (
              <div key={key} style={{ background: color, borderRadius: 14, padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={iconColor} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{lang === 'EN' ? labelEn : labelAm}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', textAlign: 'center' as const, marginBottom: 12 }}>
            {lang === 'EN' ? 'Simple, Transparent Pricing' : 'ቀላልና ግልጽ ዋጋ'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 16, textAlign: 'center' as const, marginBottom: 48 }}>
            {lang === 'EN' ? 'Choose the package that fits your business goals' : 'ለንግድ ዓላማዎ የሚስማማ ፓኬጅ ይምረጡ'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {PACKAGES.map(pkg => (
              <div key={pkg.key}
                onClick={() => { setSelectedPackage(pkg.key); setStep('form'); }}
                style={{ background: 'white', borderRadius: 18, border: `2px solid ${selectedPackage === pkg.key ? pkg.color : '#e5e7eb'}`, padding: '28px 24px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', boxShadow: pkg.popular ? '0 8px 24px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = pkg.color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = selectedPackage === pkg.key ? pkg.color : '#e5e7eb'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                {pkg.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: pkg.color, color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 16px', borderRadius: 20 }}>
                    {lang === 'EN' ? '⭐ Most Popular' : '⭐ በጣም ተወዳጅ'}
                  </div>
                )}
                <div style={{ fontSize: 20, fontWeight: 900, color: pkg.color, marginBottom: 4 }}>
                  {lang === 'EN' ? pkg.labelEn : pkg.labelAm}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', marginBottom: 4 }}>
                  ETB {pkg.price.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                  {lang === 'EN' ? `per ${pkg.durationMonths === 12 ? 'year' : 'month'}` : `በ${pkg.durationMonths === 12 ? 'ዓመት' : 'ወር'}`}
                </div>
                <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
                  {pkg.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle size={15} color={pkg.color} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{lang === 'EN' ? f.en : f.am}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '12px', borderRadius: 10, background: pkg.color, color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                  {lang === 'EN' ? 'Get Started' : 'ይጀምሩ'} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: '#111827', textAlign: 'center' as const, marginBottom: 40 }}>
            {lang === 'EN' ? 'Frequently Asked Questions' : 'ተደጋጋሚ ጥያቄዎች'}
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              {
                qEn: 'How long does it take for my ad to go live?',
                qAm: 'ማስታወቂያዬ መቼ ይጀምራል?',
                aEn: 'After you submit your application, we review it within 24 hours. Once approved, we send you a Chapa payment link. Your ad goes live immediately after payment is confirmed.',
                aAm: 'ማመልከቻዎን ካስገቡ በኋላ በ24 ሰዓት እንገመግማለን። ከተፈቀደ በኋላ የቻፓ ክፍያ ሊንክ እንልካለን። ክፍያ ከተረጋገጠ ወዲያውኑ ይጀምራል።',
              },
              {
                qEn: 'Can I include my logo and images?',
                qAm: 'ሎጎዬን እና ምስሎቼን ማካተት እችላለሁ?',
                aEn: 'Standard and above packages include logo and banner image support. After submission, our team will contact you to collect your brand assets.',
                aAm: 'Standard እና ከዚያ በላይ ፓኬጆች ሎጎና ባነር ምስልን ይደግፋሉ። ካስገቡ በኋላ ቡድናችን ያነጋግርዎታል።',
              },
              {
                qEn: 'What payment methods are accepted?',
                qAm: 'ምን ዓይነት ክፍያ ይቀበላሉ?',
                aEn: 'We accept payment via Chapa — which supports CBE Birr, Telebirr, bank transfer and card payments.',
                aAm: 'ቻፓ በኩል ክፍያ እንቀበላለን — CBE ብር፣ ቴሌብር፣ የባንክ ዝውውርና ካርድ ክፍያዎችን ይደግፋል።',
              },
              {
                qEn: 'Can I renew or upgrade my package?',
                qAm: 'ፓኬጄን ማደስ ወይም ማሻሻል እችላለሁ?',
                aEn: 'Yes. You can renew at any time before expiry or upgrade to a higher package. Contact us at advertise@gojo-homes.com.',
                aAm: 'አዎ። ከማለቁ በፊት በማንኛውም ጊዜ ማደስ ወይም ወደ ከፍተኛ ፓኬጅ ማሸጋገር ይችላሉ።',
              },
            ].map(({ qEn, qAm, aEn, aAm }) => (
              <div key={qEn} style={{ background: '#f9fafb', borderRadius: 14, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{lang === 'EN' ? qEn : qAm}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{lang === 'EN' ? aEn : aAm}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ background: '#006AFF', padding: '64px 24px', textAlign: 'center' as const }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 12 }}>
          {lang === 'EN' ? 'Ready to Grow Your Business?' : 'ንግድዎን ለማሳደግ ዝግጁ ነዎት?'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 32 }}>
          {lang === 'EN' ? 'Join businesses already advertising on ጎጆ and reach your target customers.' : 'አስቀድሞ በጎጆ ላይ ከሚያስተዋውቁ ንግዶች ጋር ይቀላቀሉ።'}
        </p>
        <button onClick={() => setStep('form')}
          style={{ padding: '15px 40px', background: '#E8431A', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {lang === 'EN' ? 'Start Advertising Today' : 'ዛሬ ያስተዋውቁ'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import { Upload, MapPin, Building2, CheckCircle, ArrowRight, ArrowLeft, X, ChevronDown, PlusCircle, Zap, Wifi, Car, Layers, Shield } from 'lucide-react';

const ETHIOPIA_CITIES = [
  { cityEn: 'Addis Ababa', cityAm: 'አዲስ አበባ', subsEn: ['Bole','Yeka','Kirkos','Lemi Kura','Nifas Silk-Lafto','Arada','Lideta','Gullele','Kolfe Keraniyo','Akaki-Kality','Addis Ketema'], subsAm: ['ቦሌ','የካ','ቂርቆስ','ለሚ ኩራ','ንፋስ ስልክ ላፍቶ','አራዳ','ልደታ','ጉለሌ','ኮልፌ ቀራኒዮ','አቃቂ ቃሊቲ','አዲስ ከተማ'] },
  { cityEn: 'Dire Dawa', cityAm: 'ድሬዳዋ', subsEn: ['Kezira','Magala','Melka Jebdu','Sabiyan','Gende Qore','Gende Tesfa'], subsAm: ['ቀዚራ','መጋላ','መልካ ጀብዱ','ሳቢያን','ገንደ ቆሬ','ገንደ ተስፋ'] },
  { cityEn: 'Adama', cityAm: 'አዳማ', subsEn: ['Bole','Arada','Dabe Soloke','Melka Adama','Boku','Migira','Posta Bet'], subsAm: ['ቦሌ','አራዳ','ዳቤ ሶሎቄ','መልካ አዳማ','ቦቁ','ሚጊራ','ፖስታ ቤት'] },
  { cityEn: 'Gondar', cityAm: 'ጎንደር', subsEn: ['Maraki','Arada','Azezo','Fasil','Jantekel','Lideta','Gebriel'], subsAm: ['ማራኪ','አራዳ','አዘዞ','ፋሲል','ጃንተከል','ልደታ','ገብርኤል'] },
  { cityEn: 'Hawassa', cityAm: 'ሐዋሳ', subsEn: ['Hayiq Dar','Misrak','Tabor','Mehal','Bahil Adarash','Tula','Monopol'], subsAm: ['ሐይቅ ዳር','ምሥራቅ','ታቦር','መሀል','ባህል አዳራሽ','ቱላ','ሞኖፖል'] },
  { cityEn: 'Bahir Dar', cityAm: 'ባሕር ዳር', subsEn: ['Belay Zeleke','Atse Tewodros','Fasilo','Shimbit','Ginbot 20','Tana','Diaspora Sefer'], subsAm: ['በላይ ዘለቀ','አፄ ቴዎድሮስ','ፋሲሎ','ሽምቢት','ግንቦት 20','ጣና','ዲያስፖራ ሰፈር'] },
  { cityEn: 'Mekelle', cityAm: 'መቐለ', subsEn: ['Hadnet','Ayder','Kedamay Weyane','Qwiha','Semien','Saharti','Adi Haki'], subsAm: ['ሃድነት','አይደር','ቀዳማይ ወያነ','ኩዊሃ','ሰሜን','ሰሐርቲ','ዓዲ ሓቂ'] },
  { cityEn: 'Jimma', cityAm: 'ጅማ', subsEn: ['Hermata','Jiren','Bosa Bazab','Mendera Kochino','Ginjo','Seto Semero'], subsAm: ['ሀርማታ','ጅሬን','ቦሳ ባዛብ','መንደራ ኮቺኖ','ጊንጆ','ሴቶ ሰመሮ'] },
  { cityEn: 'Dessie', cityAm: 'ደሴ', subsEn: ['Arada','Piazza','Dawudo','Segno Gebeya','Hotie','Memhir Akale Wold','Kurkur'], subsAm: ['አራዳ','ፒያሳ','ዳውዶ','ሰኞ ገበያ','ሆጤ','መምህር አካለ ወልድ','ኩርኩር'] },
  { cityEn: 'Harar', cityAm: 'ሐረር', subsEn: ['Jugol','Shenkor','Aboker','JinEala','Duk Ber'], subsAm: ['ጁጎል','ሸንኮር','አቦከር','ጅን ኤላ','ዱክ በር'] },
];

const COMMERCIAL_TYPES = [
  { key: 'office', labelEn: 'Office Space', labelAm: 'የቢሮ ቦታ', icon: '🏢' },
  { key: 'retail', labelEn: 'Retail / Shop', labelAm: 'መደብር / ሱቅ', icon: '🏪' },
  { key: 'warehouse', labelEn: 'Warehouse / Industrial', labelAm: 'መጋዘን / ኢንዱስትሪ', icon: '🏭' },
  { key: 'event_hall', labelEn: 'Event Hall / Conference', labelAm: 'የዝግጅት አዳራሽ', icon: '🎪' },
  { key: 'commercial_land', labelEn: 'Commercial Land', labelAm: 'የንግድ መሬት', icon: '🌍' },
  { key: 'mixed_use', labelEn: 'Mixed Use', labelAm: 'ድብልቅ አጠቃቀም', icon: '🏗️' },
  { key: 'hotel', labelEn: 'Hotel / Guest House', labelAm: 'ሆቴል / እንግዳ ቤት', icon: '🏨' },
  { key: 'parking', labelEn: 'Parking Facility', labelAm: 'የመኪና ማቆሚያ', icon: '🅿️' },
  { key: 'medical', labelEn: 'Medical / Clinic Space', labelAm: 'የህክምና / ክሊኒክ ቦታ', icon: '🏥' },
  { key: 'bank', labelEn: 'Bank / Financial Space', labelAm: 'የባንክ / የፋይናንስ ቦታ', icon: '🏦' },
];

const LEASE_TYPES = [
  { key: 'monthly_rent', labelEn: 'Monthly Rent', labelAm: 'ወርሃዊ ኪራይ' },
  { key: 'annual_lease', labelEn: 'Annual Lease', labelAm: 'ዓመታዊ ሊዝ' },
  { key: 'long_term_lease', labelEn: 'Long-term Lease (3yr+)', labelAm: 'የረጅም ጊዜ ሊዝ (3+ ዓመት)' },
  { key: 'for_sale', labelEn: 'For Sale / Purchase', labelAm: 'ለሽያጭ' },
  { key: 'lease_to_own', labelEn: 'Lease to Own', labelAm: 'ሊዝ ወደ ባለቤትነት' },
  { key: 'build_to_suit', labelEn: 'Build to Suit', labelAm: 'እንደ ፍላጎት ግንባታ' },
  { key: 'revenue_share', labelEn: 'Revenue Share', labelAm: 'የገቢ ክፍፍል' },
];

const FITOUT_CONDITIONS = [
  { key: 'shell_core', labelEn: 'Shell & Core', labelAm: 'ቅርፊትና ምሰሶ ብቻ' },
  { key: 'fitted', labelEn: 'Fitted / Semi-finished', labelAm: 'ከፊል ጨርሶ' },
  { key: 'fully_furnished', labelEn: 'Fully Furnished', labelAm: 'ሙሉ በሙሉ የታጠቀ' },
  { key: 'open_plan', labelEn: 'Open Plan', labelAm: 'ክፍት ዕቅድ' },
];

const LEASE_STRUCTURES = [
  { key: 'gross', labelEn: 'Gross Lease', labelAm: 'ሙሉ ኪራይ (ሁሉም ወጪ ይካተታል)' },
  { key: 'nnn', labelEn: 'NNN / Triple Net', labelAm: 'ሶስት ኔት (ተከራይ ሁሉንም ይከፍላል)' },
  { key: 'modified_gross', labelEn: 'Modified Gross', labelAm: 'ተሻሽሎ ኪራይ' },
  { key: 'negotiable', labelEn: 'Negotiable', labelAm: 'በድርድር' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: 14, color: '#111827', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', background: 'white',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6,
};

const sectionStyle: React.CSSProperties = {
  background: 'white', borderRadius: 16,
  border: '1px solid #e5e7eb', padding: '28px 32px', marginBottom: 20,
};

export default function CommercialListingPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { t, lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCityDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [form, setForm] = useState({
    title: '', description: '', commercial_type: '',
    lease_type: 'monthly_rent', lease_structure: 'gross',
    currency: 'ETB', price: '', price_negotiable: false,
    floor_area_sqm: '', plot_area_sqm: '', floor_number: '',
    total_floors: '', parking_spaces: '', ceiling_height_m: '',
    fitout_condition: 'shell_core', zoning_type: '',
    has_loading_dock: false, has_3phase_power: false,
    has_backup_generator: false, has_fiber_internet: false,
    has_elevator: false, has_cctv: false, has_security: false,
    has_ac: false, has_reception: false, has_meeting_rooms: false,
    city: '', subcity: '', woreda: '', specific_location: '',
    lat: '', lng: '', whatsapp: '', year_built: '',
    total_units: '', available_from: '',
  });

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  const selectedCity = ETHIOPIA_CITIES.find(c => c.cityEn === form.city);
  const filteredCities = ETHIOPIA_CITIES.filter(c =>
    citySearch === '' ||
    c.cityEn.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.cityAm.includes(citySearch)
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    const supabase = createBrowserClient();
    const urls: string[] = [];
    for (const file of files.slice(0, 15)) {
      const fileName = `commercial/${user?.id}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }
    setPhotoUrls(prev => [...prev, ...urls]);
    setUploadingPhotos(false);
  };

  const removePhoto = (url: string) => setPhotoUrls(prev => prev.filter(u => u !== url));

  const handleSubmit = async () => {
    if (!isSignedIn || !user) return;
    setLoading(true); setError('');
    try {
      const supabase = createBrowserClient();
      const locationParts = [form.specific_location, form.woreda, form.subcity, form.city].filter(Boolean);
      const selectedType = COMMERCIAL_TYPES.find(ct => ct.key === form.commercial_type);
      const { data, error: err } = await supabase.from('properties').insert({
        owner_id: user.id,
        title: form.title,
        description: form.description,
        type: form.lease_type === 'for_sale' ? 'sale' : 'long_rent',
        currency: form.currency,
        price: form.price_negotiable ? 0 : parseFloat(form.price),
        price_negotiable: form.price_negotiable,
        area: form.floor_area_sqm ? parseFloat(form.floor_area_sqm) : null,
        area_sqm: form.floor_area_sqm ? parseFloat(form.floor_area_sqm) : null,
        plot_area_sqm: form.plot_area_sqm ? parseFloat(form.plot_area_sqm) : null,
        parking_spaces: form.parking_spaces ? parseInt(form.parking_spaces) : null,
        location: locationParts.join(', '),
        subcity: form.subcity,
        latitude: form.lat ? parseFloat(form.lat) : null,
        longitude: form.lng ? parseFloat(form.lng) : null,
        images: photoUrls,
        status: 'pending_review',
        owner_email: user.primaryEmailAddress?.emailAddress,
        owner_whatsapp: form.whatsapp,
        is_commercial: true,
        commercial_type: form.commercial_type,
        commercial_details: {
          lease_type: form.lease_type,
          lease_structure: form.lease_structure,
          fitout_condition: form.fitout_condition,
          ceiling_height_m: form.ceiling_height_m,
          zoning_type: form.zoning_type,
          has_loading_dock: form.has_loading_dock,
          has_3phase_power: form.has_3phase_power,
          has_backup_generator: form.has_backup_generator,
          has_fiber_internet: form.has_fiber_internet,
          has_elevator: form.has_elevator,
          has_cctv: form.has_cctv,
          has_security: form.has_security,
          has_ac: form.has_ac,
          has_reception: form.has_reception,
          has_meeting_rooms: form.has_meeting_rooms,
          floor_number: form.floor_number,
          total_floors: form.total_floors,
          total_units: form.total_units,
          year_built: form.year_built,
          available_from: form.available_from,
          type_label_en: selectedType?.labelEn,
          type_label_am: selectedType?.labelAm,
        },
      }).select().single();
      if (err) throw err;
      router.push(`/owner/listings/${data.id}/payment`);
    } catch (err: any) {
      setError(err.message); setLoading(false);
    }
  };

  const steps = [
    lang === 'EN' ? 'Property Type' : 'የንብረት አይነት',
    lang === 'EN' ? 'Location' : 'አካባቢ',
    lang === 'EN' ? 'Commercial Details' : 'የንግድ ዝርዝሮች',
    lang === 'EN' ? 'Photos' : 'ፎቶዎች',
    lang === 'EN' ? 'Review & Pay' : 'ይገምግሙ እና ይክፈሉ',
  ];

  if (!isLoaded) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}><Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>{lang === 'EN' ? 'Loading...' : 'በመጫን ላይ...'}</div>
    </div>
  );

  if (!isSignedIn) return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)', padding: '64px 24px 72px', textAlign: 'center' as const }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#006AFF', borderRadius: 20, padding: '6px 18px', marginBottom: 20 }}>
          <Building2 size={13} color="white" />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.8px' }}>{lang === 'EN' ? 'COMMERCIAL LISTINGS' : 'የንግድ ቤቶች'}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
          {lang === 'EN' ? 'List Your Commercial' : 'የንግድ ቤትዎን ይዘርዝሩ'}<br />
          <span style={{ color: '#38bdf8' }}>{lang === 'EN' ? 'Property on ጎጆ' : 'በጎጆ ላይ'}</span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto 32px' }}>
          {lang === 'EN'
            ? 'Reach verified businesses, investors and tenants looking for commercial space across Ethiopia.'
            : 'በኢትዮጵያ ለንግድ ቦታ እየፈለጉ ያሉ የተረጋገጡ ንግዶችን፣ ባለሀብቶችንና ተከራዮችን ይድረሱ።'}
        </p>
        <SignInButton mode="modal">
          <button style={{ padding: '15px 40px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <PlusCircle size={18} /> {lang === 'EN' ? 'Create Account & List' : 'መለያ ፍጠሩ እና ይዘርዝሩ'}
          </button>
        </SignInButton>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 48, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {[['10', lang === 'EN' ? 'Property Types' : 'የንብረት አይነቶች'], ['7', lang === 'EN' ? 'Lease Options' : 'የሊዝ አማራጮች'], ['ETB 500', lang === 'EN' ? 'Listing Fee' : 'የዝርዝር ክፍያ']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' as const }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'white' }}>{num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 24, textAlign: 'center' as const }}>
          {lang === 'EN' ? 'Supported Commercial Property Types' : 'የሚደገፉ የንግድ ቤት አይነቶች'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {COMMERCIAL_TYPES.map(ct => (
            <div key={ct.key} style={{ background: 'white', borderRadius: 14, padding: '20px 16px', border: '1px solid #e5e7eb', textAlign: 'center' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{ct.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{lang === 'EN' ? ct.labelEn : ct.labelAm}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', borderRadius: 20, padding: '6px 14px', marginBottom: 12 }}>
            <Building2 size={13} color="#006AFF" />
            <span style={{ color: '#006AFF', fontSize: 12, fontWeight: 700 }}>{lang === 'EN' ? 'COMMERCIAL LISTING' : 'የንግድ ቤት ማስታወቂያ'}</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 6 }}>
            {lang === 'EN' ? 'Post a Commercial Listing' : 'የንግድ ቤት ማስታወቂያ ለጥፍ'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>
            {lang === 'EN' ? 'Fill in the details below. Your listing will be reviewed within 24 hours.' : 'ዝርዝሮቹን ይሙሉ። ማስታወቂያዎ በ24 ሰዓት ውስጥ ይገመገማል።'}
          </p>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto' as const }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, minWidth: 80 }}>
              <div style={{ height: 4, borderRadius: 2, background: step >= i + 1 ? '#006AFF' : '#e5e7eb', marginBottom: 6 }} />
              <div style={{ fontSize: 11, color: step >= i + 1 ? '#006AFF' : '#9ca3af', fontWeight: step === i + 1 ? 700 : 400, whiteSpace: 'nowrap' as const }}>
                {i + 1}. {s}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 1 — Property Type & Basic Info */}
        {step === 1 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} color="#006AFF" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                  {lang === 'EN' ? 'Select Commercial Property Type' : 'የንግድ ቤት አይነት ይምረጡ'}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
                {COMMERCIAL_TYPES.map(ct => (
                  <div key={ct.key} onClick={() => set('commercial_type', ct.key)}
                    style={{ padding: '16px 12px', borderRadius: 12, border: `2px solid ${form.commercial_type === ct.key ? '#006AFF' : '#e5e7eb'}`, background: form.commercial_type === ct.key ? '#eff6ff' : 'white', cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{ct.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: form.commercial_type === ct.key ? '#006AFF' : '#374151', lineHeight: 1.3 }}>
                      {lang === 'EN' ? ct.labelEn : ct.labelAm}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Listing Title *' : 'የዝርዝር ርዕስ *'}</label>
                  <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder={lang === 'EN' ? 'e.g. Prime Office Space in Bole — 250m²' : 'ለምሳሌ፦ ዋና ቢሮ ቦታ በቦሌ — 250 ሜ²'} />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Description *' : 'መግለጫ *'}</label>
                  <textarea style={{ ...inputStyle, height: 110, resize: 'vertical' as const }} value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder={lang === 'EN' ? 'Describe the space — layout, access, surroundings, nearby businesses...' : 'ቦታውን ይግለጹ — አቀማመጥ፣ መዳረሻ፣ አካባቢ...'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Lease / Transaction Type *' : 'የሊዝ አይነት *'}</label>
                    <select style={inputStyle} value={form.lease_type} onChange={e => set('lease_type', e.target.value)}>
                      {LEASE_TYPES.map(lt => (
                        <option key={lt.key} value={lt.key}>{lang === 'EN' ? lt.labelEn : lt.labelAm}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Lease Structure' : 'የሊዝ መዋቅር'}</label>
                    <select style={inputStyle} value={form.lease_structure} onChange={e => set('lease_structure', e.target.value)}>
                      {LEASE_STRUCTURES.map(ls => (
                        <option key={ls.key} value={ls.key}>{lang === 'EN' ? ls.labelEn : ls.labelAm}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      {lang === 'EN' ? 'Price / Rate' : 'ዋጋ'} {form.lease_type === 'monthly_rent' ? (lang === 'EN' ? '(per month)' : '(በወር)') : form.lease_type === 'annual_lease' ? (lang === 'EN' ? '(per year)' : '(በዓመት)') : ''}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{lang === 'EN' ? 'Price negotiable' : 'ዋጋ በድርድር'}</span>
                      <div onClick={() => set('price_negotiable', !form.price_negotiable)}
                        style={{ width: 44, height: 24, borderRadius: 12, background: form.price_negotiable ? '#006AFF' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: form.price_negotiable ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                  </div>
                  {form.price_negotiable ? (
                    <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, color: '#065f46', fontWeight: 500 }}>
                      {lang === 'EN' ? 'Price will be negotiated directly with interested parties.' : 'ዋጋው ከፍላጎት ሰዎች ጋር በቀጥታ ይደራደራል።'}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>{lang === 'EN' ? 'Currency' : 'ምንዛሬ'}</label>
                        <select style={inputStyle} value={form.currency} onChange={e => set('currency', e.target.value)}>
                          <option value="ETB">ETB — Ethiopian Birr</option>
                          <option value="USD">USD — US Dollar</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>{lang === 'EN' ? 'Amount *' : 'መጠን *'}</label>
                        <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)}
                          placeholder={form.lease_type === 'monthly_rent' ? 'e.g. 50000' : 'e.g. 5000000'} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'WhatsApp Contact' : 'ዋትሳፕ ቁጥር'}</label>
                  <input style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+251911234567" />
                </div>
              </div>
            </div>
            <button onClick={() => { if (!form.commercial_type) { setError(lang === 'EN' ? 'Please select a property type' : 'የንብረት አይነት ይምረጡ'); return; } if (!form.title) { setError(lang === 'EN' ? 'Please enter a title' : 'ርዕስ ያስገቡ'); return; } if (!form.price && !form.price_negotiable) { setError(lang === 'EN' ? 'Please enter a price or mark as negotiable' : 'ዋጋ ያስገቡ ወይም በድርድር ምልክት ያድርጉ'); return; } setError(''); setStep(2); }}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {lang === 'EN' ? 'Next: Location' : 'ቀጣይ፦ አካባቢ'} <ArrowRight size={18} />
            </button>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

        {/* STEP 2 — Location */}
        {step === 2 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{lang === 'EN' ? 'Location' : 'አካባቢ'}</div>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div ref={cityRef} style={{ position: 'relative' }}>
                  <label style={labelStyle}>{lang === 'EN' ? 'City *' : 'ከተማ *'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={citySearch || (form.city ? `${form.city} (${ETHIOPIA_CITIES.find(c => c.cityEn === form.city)?.cityAm})` : '')}
                      onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); if (!e.target.value) { set('city', ''); set('subcity', ''); } }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder={lang === 'EN' ? 'Search city...' : 'ከተማ ፈልግ...'}
                      style={inputStyle} />
                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                  {showCityDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, zIndex: 100, maxHeight: 240, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4 }}>
                      {filteredCities.map(c => (
                        <div key={c.cityEn}
                          onClick={() => { set('city', c.cityEn); set('subcity', ''); setCitySearch(''); setShowCityDropdown(false); }}
                          style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#111827', borderBottom: '1px solid #f3f4f6', background: form.city === c.cityEn ? '#f0f6ff' : 'white' }}
                          onMouseEnter={e => { if (form.city !== c.cityEn) (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                          onMouseLeave={e => { if (form.city !== c.cityEn) (e.currentTarget as HTMLElement).style.background = 'white'; }}>
                          <span style={{ fontWeight: form.city === c.cityEn ? 700 : 400 }}>{lang === 'EN' ? c.cityEn : c.cityAm}</span>
                          <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: 13 }}>{lang === 'EN' ? c.cityAm : c.cityEn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, opacity: selectedCity ? 1 : 0.5 }}>{lang === 'EN' ? 'Subcity / District' : 'ክፍለ ከተማ'}</label>
                  <select value={form.subcity} onChange={e => set('subcity', e.target.value)} disabled={!selectedCity} style={{ ...inputStyle, opacity: selectedCity ? 1 : 0.5 }}>
                    <option value="">{selectedCity ? (lang === 'EN' ? `All ${selectedCity.cityEn}` : `ሁሉም ${selectedCity.cityAm}`) : (lang === 'EN' ? '— Select city first —' : '— መጀመሪያ ከተማ ይምረጡ —')}</option>
                    {selectedCity?.subsEn.map((sub, i) => (
                      <option key={sub} value={sub}>{lang === 'EN' ? `${sub} — ${selectedCity.subsAm[i]}` : `${selectedCity.subsAm[i]} — ${sub}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Woreda / Area' : 'ወረዳ / አካባቢ'}</label>
                  <input style={inputStyle} value={form.woreda} onChange={e => set('woreda', e.target.value)} placeholder={lang === 'EN' ? 'e.g. Woreda 3' : 'ለምሳሌ፦ ወረዳ 3'} />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'EN' ? 'Specific Location / Landmark' : 'ዝርዝር አካባቢ / ምልክት'}</label>
                  <input style={inputStyle} value={form.specific_location} onChange={e => set('specific_location', e.target.value)}
                    placeholder={lang === 'EN' ? 'e.g. Ground floor of Sunshine Building, opposite CBE Bole branch' : 'ለምሳሌ፦ የሰንሻይን ህንፃ የመጀመሪያ ፎቅ፣ CBE ቦሌ ቅርንጫፍ맞은편'} />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    {lang === 'EN' ? 'The more specific, the more enquiries you will receive' : 'ዝርዝሩ ሲበዛ ብዙ ጥያቄዎችን ይቀበላሉ'}
                  </div>
                </div>
                {/* Coordinate picker */}
                <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>
                    {lang === 'EN' ? 'Pin Location on Map (optional)' : 'ቦታ በካርታ ላይ ይምቱ (አማራጭ)'}
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                    {lang === 'EN' ? 'Open Google Maps, right-click your location, copy the coordinates and paste below.' : 'ጉግል ካርታ ይክፈቱ፣ ቦታዎን በቀኝ ጠቅ ያድርጉ፣ መጋጠሚያዎቹን ወደዚህ ያለጥፉ።'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
                    <div>
                      <input type="text" value={form.lat && form.lng ? `${form.lat}, ${form.lng}` : ''}
                        onChange={e => {
                          const parts = e.target.value.split(',').map(s => s.trim());
                          if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
                            set('lat', parseFloat(parts[0]).toFixed(6));
                            set('lng', parseFloat(parts[1]).toFixed(6));
                          }
                        }}
                        placeholder="e.g. 9.0234, 38.7612" style={inputStyle} />
                    </div>
                    <button onClick={() => window.open('https://maps.google.com', '_blank')}
                      style={{ padding: '12px 16px', background: '#006AFF', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                      {lang === 'EN' ? 'Open Maps' : 'ካርታ ክፈት'}
                    </button>
                  </div>
                  {form.lat && form.lng && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#ecfdf5', borderRadius: 8, fontSize: 12, color: '#065f46', fontWeight: 600 }}>
                      ✓ {lang === 'EN' ? 'Location pinned' : 'አካባቢ ተቀናብሯል'}: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> {lang === 'EN' ? 'Back' : 'ተመለስ'}
              </button>
              <button onClick={() => { if (!form.city) { setError(lang === 'EN' ? 'Please select a city' : 'ከተማ ይምረጡ'); return; } setError(''); setStep(3); }}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {lang === 'EN' ? 'Next: Commercial Details' : 'ቀጣይ፦ የንግድ ዝርዝሮች'} <ArrowRight size={18} />
              </button>
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

        {/* STEP 3 — Commercial Details */}
        {step === 3 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                {lang === 'EN' ? 'Commercial Property Details' : 'የንግድ ቤት ዝርዝሮች'}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                {lang === 'EN' ? 'Provide technical specifications for the space' : 'ለቦታው ቴክኒካዊ ዝርዝሮችን ያቅርቡ'}
              </div>

              {/* Space measurements */}
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                  {lang === 'EN' ? 'Space Measurements' : 'የቦታ መለኪያዎች'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Floor Area (m²) *' : 'የወለል ስፋት (ሜ²) *'}</label>
                    <input style={inputStyle} type="number" value={form.floor_area_sqm} onChange={e => set('floor_area_sqm', e.target.value)} placeholder="e.g. 250" />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Plot Area (m²)' : 'የቦታ ስፋት (ሜ²)'}</label>
                    <input style={inputStyle} type="number" value={form.plot_area_sqm} onChange={e => set('plot_area_sqm', e.target.value)} placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Ceiling Height (m)' : 'የጣሪያ ከፍታ (ሜ)'}</label>
                    <input style={inputStyle} type="number" step="0.1" value={form.ceiling_height_m} onChange={e => set('ceiling_height_m', e.target.value)} placeholder="e.g. 3.5" />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Parking Spaces' : 'የመኪና ማቆሚያ'}</label>
                    <input style={inputStyle} type="number" min="0" value={form.parking_spaces} onChange={e => set('parking_spaces', e.target.value)} placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Floor Number' : 'የፎቅ ቁጥር'}</label>
                    <input style={inputStyle} type="number" value={form.floor_number} onChange={e => set('floor_number', e.target.value)} placeholder="e.g. 3" />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Total Floors in Building' : 'ጠቅላላ ፎቆች'}</label>
                    <input style={inputStyle} type="number" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} placeholder="e.g. 10" />
                  </div>
                </div>
              </div>

              {/* Fit-out & Condition */}
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                  {lang === 'EN' ? 'Fit-out Condition' : 'የፊኒሺንግ ሁኔታ'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                  {FITOUT_CONDITIONS.map(fc => (
                    <div key={fc.key} onClick={() => set('fitout_condition', fc.key)}
                      style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${form.fitout_condition === fc.key ? '#006AFF' : '#e5e7eb'}`, background: form.fitout_condition === fc.key ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.fitout_condition === fc.key ? '#006AFF' : '#374151' }}>
                        {form.fitout_condition === fc.key ? '✓ ' : ''}{lang === 'EN' ? fc.labelEn : fc.labelAm}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional info */}
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Zoning Type' : 'የዞን አይነት'}</label>
                    <select style={inputStyle} value={form.zoning_type} onChange={e => set('zoning_type', e.target.value)}>
                      <option value="">{lang === 'EN' ? 'Select zoning...' : 'ዞን ይምረጡ...'}</option>
                      <option value="commercial">{lang === 'EN' ? 'Commercial Zone' : 'የንግድ ዞን'}</option>
                      <option value="industrial">{lang === 'EN' ? 'Industrial Zone' : 'የኢንዱስትሪ ዞን'}</option>
                      <option value="mixed">{lang === 'EN' ? 'Mixed Use Zone' : 'ድብልቅ ዞን'}</option>
                      <option value="special">{lang === 'EN' ? 'Special Economic Zone' : 'ልዩ ኢኮኖሚ ዞን'}</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Available From' : 'የሚገኝበት ቀን'}</label>
                    <input style={inputStyle} type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Year Built' : 'የተሠራበት ዓመት'}</label>
                    <input style={inputStyle} type="number" value={form.year_built} onChange={e => set('year_built', e.target.value)} placeholder="e.g. 2018" />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Total Units Available' : 'ጠቅላላ ክፍሎች'}</label>
                    <input style={inputStyle} type="number" value={form.total_units} onChange={e => set('total_units', e.target.value)} placeholder="e.g. 5" />
                  </div>
                </div>
              </div>

              {/* Facilities & Features */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                  {lang === 'EN' ? 'Facilities & Features' : 'አገልግሎቶችና ባህሪያት'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                  {[
                    { key: 'has_backup_generator', icon: Zap, labelEn: 'Backup Generator', labelAm: 'ሪዘርቭ ጀነሬተር' },
                    { key: 'has_fiber_internet', icon: Wifi, labelEn: 'Fiber Internet', labelAm: 'ፋይበር ኢንተርኔት' },
                    { key: 'has_elevator', icon: Layers, labelEn: 'Elevator / Lift', labelAm: 'አሳንሶር' },
                    { key: 'has_3phase_power', icon: Zap, labelEn: '3-Phase Power', labelAm: '3-ፌዝ ኤሌክትሪክ' },
                    { key: 'has_loading_dock', icon: Car, labelEn: 'Loading Dock', labelAm: 'የጭነት መድረክ' },
                    { key: 'has_ac', icon: Shield, labelEn: 'Air Conditioning', labelAm: 'ኤ.ሲ' },
                    { key: 'has_cctv', icon: Shield, labelEn: 'CCTV / Surveillance', labelAm: 'ሲሲቲቪ' },
                    { key: 'has_security', icon: Shield, labelEn: 'Security Guard', labelAm: 'ጠባቂ' },
                    { key: 'has_reception', icon: Building2, labelEn: 'Reception Area', labelAm: 'ሪሴፕሽን አካባቢ' },
                    { key: 'has_meeting_rooms', icon: Building2, labelEn: 'Meeting Rooms', labelAm: 'የስብሰባ ክፍሎች' },
                  ].map(({ key, icon: Icon, labelEn, labelAm }) => (
                    <div key={key} onClick={() => set(key, !(form as any)[key])}
                      style={{ padding: '12px 14px', borderRadius: 10, border: `2px solid ${(form as any)[key] ? '#006AFF' : '#e5e7eb'}`, background: (form as any)[key] ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={14} color={(form as any)[key] ? '#006AFF' : '#6b7280'} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: (form as any)[key] ? '#006AFF' : '#374151' }}>
                        {(form as any)[key] ? '✓ ' : ''}{lang === 'EN' ? labelEn : labelAm}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> {lang === 'EN' ? 'Back' : 'ተመለስ'}
              </button>
              <button onClick={() => { if (!form.floor_area_sqm && form.commercial_type !== 'commercial_land' && form.commercial_type !== 'parking') { setError(lang === 'EN' ? 'Please enter the floor area' : 'የወለል ስፋት ያስገቡ'); return; } setError(''); setStep(4); }}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {lang === 'EN' ? 'Next: Photos' : 'ቀጣይ፦ ፎቶዎች'} <ArrowRight size={18} />
              </button>
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

        {/* STEP 4 — Photos */}
        {step === 4 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                  {lang === 'EN' ? 'Property Photos' : 'የንብረት ፎቶዎች'}
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                {lang === 'EN' ? 'Upload up to 15 photos. Include exterior, interior, floor plan if available.' : 'እስከ 15 ፎቶዎች ይጫኑ። ውጭ፣ ውስጥ እና የፎቅ ዕቅድ ካለ ያካትቱ።'}
              </div>
              <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#1d4ed8' }}>
                💡 {lang === 'EN' ? 'Pro tip: High quality photos get 3x more enquiries. Include photos of the entrance, main space, facilities and street view.' : 'ጥሩ ፎቶዎች 3 እጥፍ ጥያቄ ያመጣሉ። የመግቢያ፣ ዋና ቦታ፣ አገልግሎቶችና መንገድ ፎቶ ያካትቱ።'}
              </div>
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div style={{ border: '2px dashed #d1d5db', borderRadius: 14, padding: '40px 24px', textAlign: 'center', background: '#f9fafb' }}>
                  {uploadingPhotos ? (
                    <div style={{ color: '#006AFF', fontWeight: 600 }}>{lang === 'EN' ? 'Uploading photos...' : 'ፎቶዎችን በመጫን ላይ...'}</div>
                  ) : (
                    <>
                      <Upload size={36} color="#9ca3af" style={{ marginBottom: 12 }} />
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{lang === 'EN' ? 'Click to upload photos' : 'ፎቶዎችን ለመጫን ጠቅ ያድርጉ'}</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>JPG, PNG {lang === 'EN' ? 'up to 10MB each' : 'እስከ 10MB'}</div>
                    </>
                  )}
                </div>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
              {photoUrls.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 20 }}>
                  {photoUrls.map((url, i) => (
                    <div key={url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                      <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && <div style={{ position: 'absolute', top: 6, left: 6, background: '#006AFF', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>COVER</div>}
                      <button onClick={() => removePhoto(url)} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} color="white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> {lang === 'EN' ? 'Back' : 'ተመለስ'}
              </button>
              <button onClick={() => setStep(5)} style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {lang === 'EN' ? 'Next: Review & Pay' : 'ቀጣይ፦ ይገምግሙ እና ይክፈሉ'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — Review & Pay */}
        {step === 5 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} color="#059669" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                  {lang === 'EN' ? 'Review Your Commercial Listing' : 'የንግድ ቤት ማስታወቂያዎን ይገምግሙ'}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 2 }}>
                {[
                  [lang === 'EN' ? 'Property Type' : 'የንብረት አይነት', COMMERCIAL_TYPES.find(ct => ct.key === form.commercial_type)?.[lang === 'EN' ? 'labelEn' : 'labelAm'] || '—'],
                  [lang === 'EN' ? 'Title' : 'ርዕስ', form.title],
                  [lang === 'EN' ? 'Lease Type' : 'የሊዝ አይነት', LEASE_TYPES.find(lt => lt.key === form.lease_type)?.[lang === 'EN' ? 'labelEn' : 'labelAm'] || '—'],
                  [lang === 'EN' ? 'Lease Structure' : 'የሊዝ መዋቅር', LEASE_STRUCTURES.find(ls => ls.key === form.lease_structure)?.[lang === 'EN' ? 'labelEn' : 'labelAm'] || '—'],
                  [lang === 'EN' ? 'Price' : 'ዋጋ', form.price_negotiable ? (lang === 'EN' ? 'Negotiable' : 'በድርድር') : `${form.currency} ${parseFloat(form.price || '0').toLocaleString()}`],
                  [lang === 'EN' ? 'City' : 'ከተማ', form.city || '—'],
                  [lang === 'EN' ? 'Subcity' : 'ክፍለ ከተማ', form.subcity || '—'],
                  [lang === 'EN' ? 'Location' : 'አካባቢ', form.specific_location || '—'],
                  [lang === 'EN' ? 'Floor Area' : 'የወለል ስፋት', form.floor_area_sqm ? `${form.floor_area_sqm} m²` : '—'],
                  [lang === 'EN' ? 'Ceiling Height' : 'የጣሪያ ከፍታ', form.ceiling_height_m ? `${form.ceiling_height_m}m` : '—'],
                  [lang === 'EN' ? 'Parking' : 'ፓርኪንግ', form.parking_spaces || '—'],
                  [lang === 'EN' ? 'Fit-out' : 'ፊኒሺንግ', FITOUT_CONDITIONS.find(fc => fc.key === form.fitout_condition)?.[lang === 'EN' ? 'labelEn' : 'labelAm'] || '—'],
                  [lang === 'EN' ? 'Zoning' : 'ዞን', form.zoning_type || '—'],
                  [lang === 'EN' ? 'Available From' : 'ከ', form.available_from || '—'],
                  [lang === 'EN' ? 'Generator' : 'ጀነሬተር', form.has_backup_generator ? (lang === 'EN' ? 'Yes' : 'አዎ') : (lang === 'EN' ? 'No' : 'አይ')],
                  [lang === 'EN' ? 'Fiber Internet' : 'ፋይበር', form.has_fiber_internet ? (lang === 'EN' ? 'Yes' : 'አዎ') : (lang === 'EN' ? 'No' : 'አይ')],
                  [lang === 'EN' ? '3-Phase Power' : '3-ፌዝ', form.has_3phase_power ? (lang === 'EN' ? 'Yes' : 'አዎ') : (lang === 'EN' ? 'No' : 'አይ')],
                  [lang === 'EN' ? 'Loading Dock' : 'የጭነት መድረክ', form.has_loading_dock ? (lang === 'EN' ? 'Yes' : 'አዎ') : (lang === 'EN' ? 'No' : 'አይ')],
                  [lang === 'EN' ? 'Photos' : 'ፎቶዎች', `${photoUrls.length}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#111827', fontWeight: 500, textAlign: 'right' as const, maxWidth: '60%' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 16, border: '2px solid #006AFF', padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
                {lang === 'EN' ? 'Commercial Listing Fee — ETB 500' : 'የንግድ ቤት ዝርዝር ክፍያ — ETB 500'}
              </div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                • {lang === 'EN' ? '3 months active listing' : 'ለ3 ወራት ንቁ ዝርዝር'}<br />
                • {lang === 'EN' ? 'Reviewed by admin within 24 hours' : 'በ24 ሰዓት ውስጥ ይገመገማል'}<br />
                • {lang === 'EN' ? 'Renewable after expiry for ETB 300' : 'ከሚያልፍ በኋላ ለ ETB 300 ያድሱ'}<br />
                • {lang === 'EN' ? 'Listed under Commercial section' : 'ስር የንግድ ቦታ ክፍል ይዘረዘራል'}
              </div>
            </div>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(4)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> {lang === 'EN' ? 'Back' : 'ተመለስ'}
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: loading ? '#9ca3af' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? (lang === 'EN' ? 'Submitting...' : 'በማስገባት ላይ...') : (lang === 'EN' ? 'Submit & Pay ETB 500' : 'ያስገቡ እና ETB 500 ይክፈሉ')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

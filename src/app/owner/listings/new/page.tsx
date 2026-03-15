'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Upload, MapPin, Home, CheckCircle, ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';
import { PriceSuggestion } from '@/components/property/PriceSuggestion';

const REGIONS = [
  'አዲስ አበባ / Addis Ababa',
  'ኦሮሚያ / Oromia',
  'አማራ / Amhara',
  'ትግራይ / Tigray',
  'ደቡብ ብሔሮች / SNNPR',
  'ሲዳማ / Sidama',
  'ድሬዳዋ / Dire Dawa',
  'ሐረሪ / Harari',
  'አፋር / Afar',
  'ሶማሌ / Somali',
];

const ADDIS_SUBCITIES = [
  'ቦሌ / Bole', 'ቂርቆስ / Kirkos', 'የካ / Yeka', 'ንፋስ ስልክ / Nifas Silk',
  'አቃቂ / Akaki', 'ሊደታ / Lideta', 'ጉለሌ / Gulele', 'ቆልፈ / Kolfe',
  'አራዳ / Arada', 'አዲስ ከተማ / Addis Ketema', 'ለሚ ኩራ / Lemi Kura',
];

const AMENITIES = [
  { key: 'parking', label: 'Parking' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'generator', label: 'Generator' },
  { key: 'water_tank', label: 'Water Tank' },
  { key: 'security', label: 'Security' },
  { key: 'cctv', label: 'CCTV' },
  { key: 'gym', label: 'Gym' },
  { key: 'pool', label: 'Pool' },
  { key: 'elevator', label: 'Elevator' },
  { key: 'furnished', label: 'Furnished' },
  { key: 'ac', label: 'A/C' },
  { key: 'solar', label: 'Solar' },
  { key: 'garden', label: 'Garden' },
  { key: 'balcony', label: 'Balcony' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: 14, color: '#111827', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
  background: 'white', transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#374151',
  display: 'block', marginBottom: 6,
};

const sectionStyle: React.CSSProperties = {
  background: 'white', borderRadius: 16,
  border: '1px solid #e5e7eb', padding: '28px 32px', marginBottom: 20,
};

export default function NewListingPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'sale',
    currency: 'ETB',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    total_floors: '',
    region: '',
    city: '',
    subcity: '',
    woreda: '',
    kebele: '',
    specific_location: '',
    lat: '',
    lng: '',
    location_precision: 'approximate',
    whatsapp: '',
    amenities: [] as string[],
    year_built: '',
  });

  const set = (field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value }));

  const toggleAmenity = (key: string) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(key)
        ? p.amenities.filter(a => a !== key)
        : [...p.amenities, key]
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    const supabase = createBrowserClient();
    const urls: string[] = [];
    for (const file of files.slice(0, 10)) {
      const fileName = `${user?.id}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }
    setPhotoUrls(prev => [...prev, ...urls]);
    setUploadingPhotos(false);
  };

  const removePhoto = (url: string) =>
    setPhotoUrls(prev => prev.filter(u => u !== url));

  const handleSubmit = async () => {
    if (!isSignedIn || !user) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createBrowserClient();
      const locationParts = [
        form.specific_location, form.kebele, form.woreda,
        form.subcity, form.city, form.region
      ].filter(Boolean);
      const fullLocation = locationParts.join(', ');

      const { data, error: err } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          title: form.title,
          description: form.description,
          type: form.type,
          currency: form.currency,
          price: parseFloat(form.price),
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          area: form.area ? parseFloat(form.area) : null,
          location: fullLocation,
          subcity: form.subcity,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          images: photoUrls,
          amenities: form.amenities,
          status: 'pending_review',
          owner_email: user.primaryEmailAddress?.emailAddress,
          owner_whatsapp: form.whatsapp,
        })
        .select()
        .single();

      if (err) throw err;

      // Redirect to payment
      router.push(`/owner/listings/${data.id}/payment`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const steps = [
    'Basic Info',
    'Location',
    'Amenities',
    'Photos',
    'Review & Pay'
  ];

  if (!isSignedIn) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Sign in to post a listing
        </div>
        <div style={{ fontSize: 15, color: '#6b7280' }}>
          You need an account to advertise your property
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 6 }}>
            Post a Listing
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>
            Fill in the details below. Your listing will be reviewed before going live.
          </p>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto' as const }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, minWidth: 80 }}>
              <div style={{
                height: 4, borderRadius: 2,
                background: step > i + 1 ? '#006AFF' : step === i + 1 ? '#006AFF' : '#e5e7eb',
                marginBottom: 6, transition: 'background 0.3s'
              }} />
              <div style={{
                fontSize: 11,
                color: step >= i + 1 ? '#006AFF' : '#9ca3af',
                fontWeight: step === i + 1 ? 700 : 400,
                whiteSpace: 'nowrap' as const
              }}>
                {i + 1}. {s}
              </div>
            </div>
          ))}
        </div>

        {/* ── STEP 1 — Basic Info ── */}
        {step === 1 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Basic Information</div>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Property Title *</label>
                  <input style={inputStyle} value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Modern 3-Bedroom Apartment in Bole" />
                </div>

                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    style={{ ...inputStyle, height: 100, resize: 'vertical' as const }}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Describe the property — condition, features, nearby landmarks..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Listing Type *</label>
                    <select style={inputStyle} value={form.type}
                      onChange={e => set('type', e.target.value)}>
                      <option value="sale">For Sale — ለሽያጭ</option>
                      <option value="long_rent">Long-term Rent — ረጅም ኪራይ</option>
                      <option value="short_rent">Short Stay — አጭር ቆይታ</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select style={inputStyle} value={form.currency}
                      onChange={e => set('currency', e.target.value)}>
                      <option value="ETB">ETB — Ethiopian Birr</option>
                      <option value="USD">USD — US Dollar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    Price ({form.currency}) *
                    {form.type === 'long_rent' && ' — per month'}
                    {form.type === 'short_rent' && ' — per night'}
                  </label>
                  <input style={inputStyle} type="number" value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder={form.type === 'sale' ? 'e.g. 5000000' : 'e.g. 15000'} />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    💡 Not sure? Use the AI Price Suggestion on the final step
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Bedrooms</label>
                    <input style={inputStyle} type="number" min="0"
                      value={form.bedrooms}
                      onChange={e => set('bedrooms', e.target.value)}
                      placeholder="e.g. 3" />
                  </div>
                  <div>
                    <label style={labelStyle}>Bathrooms</label>
                    <input style={inputStyle} type="number" min="0"
                      value={form.bathrooms}
                      onChange={e => set('bathrooms', e.target.value)}
                      placeholder="e.g. 2" />
                  </div>
                  <div>
                    <label style={labelStyle}>Area (m²)</label>
                    <input style={inputStyle} type="number"
                      value={form.area}
                      onChange={e => set('area', e.target.value)}
                      placeholder="e.g. 120" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Floor Number</label>
                    <input style={inputStyle} type="number"
                      value={form.floor}
                      onChange={e => set('floor', e.target.value)}
                      placeholder="e.g. 3" />
                  </div>
                  <div>
                    <label style={labelStyle}>Total Floors</label>
                    <input style={inputStyle} type="number"
                      value={form.total_floors}
                      onChange={e => set('total_floors', e.target.value)}
                      placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label style={labelStyle}>Year Built</label>
                    <input style={inputStyle} type="number"
                      value={form.year_built}
                      onChange={e => set('year_built', e.target.value)}
                      placeholder="e.g. 2020" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    WhatsApp Number (for direct inquiries)
                  </label>
                  <input style={inputStyle} value={form.whatsapp}
                    onChange={e => set('whatsapp', e.target.value)}
                    placeholder="e.g. +251911234567" />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    Interested buyers/renters can contact you directly via WhatsApp
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!form.title || !form.price) {
                  setError('Please fill in title and price');
                  return;
                }
                setError('');
                setStep(2);
              }}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Next: Location <ArrowRight size={18} />
            </button>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

        {/* ── STEP 2 — Location ── */}
        {step === 2 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Property Location</div>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Region / ክልል *</label>
                    <select style={inputStyle} value={form.region}
                      onChange={e => set('region', e.target.value)}>
                      <option value="">Select Region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>City / ከተማ *</label>
                    <input style={inputStyle} value={form.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="e.g. Addis Ababa, Dire Dawa" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Subcity / ክ/ከተማ</label>
                    {form.region.includes('Addis') ? (
                      <select style={inputStyle} value={form.subcity}
                        onChange={e => set('subcity', e.target.value)}>
                        <option value="">Select Subcity</option>
                        {ADDIS_SUBCITIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <input style={inputStyle} value={form.subcity}
                        onChange={e => set('subcity', e.target.value)}
                        placeholder="e.g. Subcity name" />
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Woreda / ወረዳ</label>
                    <input style={inputStyle} value={form.woreda}
                      onChange={e => set('woreda', e.target.value)}
                      placeholder="e.g. Woreda 3" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Kebele / ቀበሌ</label>
                    <input style={inputStyle} value={form.kebele}
                      onChange={e => set('kebele', e.target.value)}
                      placeholder="e.g. Kebele 05" />
                  </div>
                  <div>
                    <label style={labelStyle}>Specific Location / ዝርዝር አድራሻ</label>
                    <input style={inputStyle} value={form.specific_location}
                      onChange={e => set('specific_location', e.target.value)}
                      placeholder="e.g. Near Bole Medhanialem Church" />
                  </div>
                </div>

                {/* Location precision */}
                <div>
                  <label style={labelStyle}>Location Privacy</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { val: 'exact', label: 'Exact Location', desc: 'Show precise pin on map' },
                      { val: 'approximate', label: 'Approximate', desc: 'Show nearby area (~500m)' },
                      { val: 'area_only', label: 'Area Only', desc: 'Show subcity only' },
                    ].map(opt => (
                      <div key={opt.val} onClick={() => set('location_precision', opt.val)}
                        style={{ padding: '12px 14px', borderRadius: 10, border: `2px solid ${form.location_precision === opt.val ? '#006AFF' : '#e5e7eb'}`, background: form.location_precision === opt.val ? '#f0f6ff' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {form.location_precision === 'exact' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Latitude</label>
                      <input style={inputStyle} type="number" step="any"
                        value={form.lat}
                        onChange={e => set('lat', e.target.value)}
                        placeholder="e.g. 9.0192" />
                    </div>
                    <div>
                      <label style={labelStyle}>Longitude</label>
                      <input style={inputStyle} type="number" step="any"
                        value={form.lng}
                        onChange={e => set('lng', e.target.value)}
                        placeholder="e.g. 38.7525" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> Back
              </button>
              <button
                onClick={() => {
                  if (!form.region || !form.city) {
                    setError('Please select region and city');
                    return;
                  }
                  setError('');
                  setStep(3);
                }}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Next: Amenities <ArrowRight size={18} />
              </button>
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

        {/* ── STEP 3 — Amenities ── */}
        {step === 3 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                Amenities & Features
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                Select all that apply — these help the AI estimate your price accurately
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {AMENITIES.map(a => (
                  <div key={a.key} onClick={() => toggleAmenity(a.key)}
                    style={{ padding: '10px 14px', borderRadius: 10, border: `2px solid ${form.amenities.includes(a.key) ? '#006AFF' : '#e5e7eb'}`, background: form.amenities.includes(a.key) ? '#f0f6ff' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.amenities.includes(a.key) ? '#006AFF' : '#374151' }}>
                      {form.amenities.includes(a.key) ? '✓ ' : ''}{a.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={() => setStep(4)}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Next: Photos <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 — Photos ── */}
        {step === 4 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Property Photos</div>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                Upload up to 10 photos. First photo will be the cover image. Photos are also used by the AI to assess property condition and value.
              </div>

              {/* Upload area */}
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div style={{ border: '2px dashed #d1d5db', borderRadius: 14, padding: '40px 24px', textAlign: 'center', background: '#f9fafb' }}>
                  {uploadingPhotos ? (
                    <div style={{ color: '#006AFF', fontWeight: 600 }}>Uploading photos...</div>
                  ) : (
                    <>
                      <Upload size={36} color="#9ca3af" style={{ marginBottom: 12 }} />
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                        Click to upload photos
                      </div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>
                        JPG, PNG up to 10MB each • Max 10 photos
                      </div>
                    </>
                  )}
                </div>
                <input type="file" multiple accept="image/*"
                  onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>

              {/* Photo previews */}
              {photoUrls.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 20 }}>
                  {photoUrls.map((url, i) => (
                    <div key={url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                      <img src={url} alt={`Photo ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && (
                        <div style={{ position: 'absolute', top: 6, left: 6, background: '#006AFF', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                          COVER
                        </div>
                      )}
                      <button onClick={() => removePhoto(url)}
                        style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} color="white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photoUrls.length > 0 && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, color: '#065f46' }}>
                  ✓ {photoUrls.length} photo{photoUrls.length > 1 ? 's' : ''} uploaded — AI will analyze these to estimate your property value
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(3)}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={() => setStep(5)}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Next: Review & Pay <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5 — Review & Pay ── */}
        {step === 5 && (
          <div>

            {/* AI Price Suggestion */}
            <div style={{ marginBottom: 20 }}>
              <PriceSuggestion
                propertyData={{
                  type: form.type,
                  title: form.title,
                  description: form.description,
                  region: form.region,
                  city: form.city,
                  subcity: form.subcity,
                  woreda: form.woreda,
                  specific_location: form.specific_location,
                  bedrooms: form.bedrooms,
                  bathrooms: form.bathrooms,
                  area: form.area,
                  floor: form.floor,
                  total_floors: form.total_floors,
                  year_built: form.year_built,
                  amenities: form.amenities,
                }}
                imageUrls={photoUrls}
                onUsePrice={(price) => set('price', price.toString())}
              />
            </div>

            {/* Review summary */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} color="#059669" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Review Your Listing</div>
              </div>

              <div style={{ display: 'grid', gap: 2 }}>
                {[
                  ['Title', form.title],
                  ['Type', form.type === 'sale' ? 'For Sale' : form.type === 'long_rent' ? 'Long-term Rent' : 'Short Stay'],
                  ['Price', `${form.currency} ${parseFloat(form.price || '0').toLocaleString()}${form.type === 'long_rent' ? '/mo' : form.type === 'short_rent' ? '/night' : ''}`],
                  ['Region', form.region || '—'],
                  ['City', form.city || '—'],
                  ['Subcity', form.subcity || '—'],
                  ['Woreda', form.woreda || '—'],
                  ['Kebele', form.kebele || '—'],
                  ['Specific Location', form.specific_location || '—'],
                  ['Bedrooms', form.bedrooms || '—'],
                  ['Bathrooms', form.bathrooms || '—'],
                  ['Area', form.area ? `${form.area} m²` : '—'],
                  ['Floor', form.floor ? `${form.floor} of ${form.total_floors || '?'}` : '—'],
                  ['Year Built', form.year_built || '—'],
                  ['Amenities', form.amenities.length > 0 ? form.amenities.join(', ') : 'None selected'],
                  ['Photos', `${photoUrls.length} photo(s) uploaded`],
                  ['WhatsApp', form.whatsapp || 'Not provided'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#111827', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment box */}
            <div style={{ background: 'white', borderRadius: 16, border: '2px solid #006AFF', padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
                Listing Fee
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                One-time payment to publish your listing. After review and payment confirmation your listing goes live.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#006AFF' }}>ETB 500</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>One-time • 3 months active • Renew for ETB 300</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Accepted payments:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                    {['Telebirr', 'CBE Birr', 'Visa/MC', 'Bank'].map(m => (
                      <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', background: '#f3f4f6', borderRadius: 10, color: '#374151' }}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow info */}
            <div style={{ background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a', padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
                📋 What happens next?
              </div>
              <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.8 }}>
                1. Submit listing → pay ETB 500 via Chapa<br />
                2. Payment confirmed → listing sent for admin review<br />
                3. Admin reviews within 24 hours<br />
                4. Listing goes LIVE on ጎጆ for 3 months ✅<br />
                5. You'll get email reminders 30, 7 and 1 day before expiry<br />
                6. Renew for ETB 300 to keep listing active
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(4)}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: loading ? '#9ca3af' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? 'Submitting...' : '💳 Submit & Pay ETB 500'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

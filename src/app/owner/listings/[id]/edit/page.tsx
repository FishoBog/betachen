'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';

const ETHIOPIA_CITIES = [
  'Addis Ababa','Dire Dawa','Adama','Gondar','Hawassa','Bahir Dar','Mekelle',
  'Jimma','Dessie','Shashemene','Bishoftu','Harar','Shaggar','Jigjiga','Sodo','Arba Minch','Hosaena',
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: 15, color: '#111827', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', background: 'white',
};
const labelStyle: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6,
};
const sectionStyle: React.CSSProperties = {
  background: 'white', borderRadius: 16,
  border: '1px solid #e5e7eb', padding: '28px 30px', marginBottom: 20,
};

export default function EditListingPage() {
  const { user } = useUser();
  const { lang } = useLang();
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Only the key/common fields owners most often need to fix.
  const [form, setForm] = useState({
    title: '', description: '', type: 'sale', condition: 'good',
    currency: 'ETB', price: '', price_negotiable: false,
    bedrooms: '', bathrooms: '', area: '',
    city: '', subcity: '', specific_location: '',
  });

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  // Load the existing listing and pre-fill the form.
  useEffect(() => {
    if (!listingId) return;
    fetch(`/api/listings/get?id=${listingId}`)
      .then(res => res.json())
      .then(data => {
        const p = data.property;
        if (!p) { setNotFound(true); setLoaded(true); return; }
        setForm({
          title: p.title || '',
          description: p.description || '',
          type: p.type || 'sale',
          condition: p.condition || 'good',
          currency: p.currency || 'ETB',
          price: p.price_negotiable ? '' : (p.price != null ? String(p.price) : ''),
          price_negotiable: !!p.price_negotiable,
          bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
          bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
          area: p.area != null ? String(p.area) : (p.area_sqm != null ? String(p.area_sqm) : ''),
          // location string is "specific, kebele, woreda, subcity, city"; we keep
          // the city + subcity in their own fields and show the rest as free text.
          city: p.city || (typeof p.location === 'string' && ETHIOPIA_CITIES.find(c => p.location.includes(c))) || '',
          subcity: p.subcity || '',
          specific_location: typeof p.location === 'string' ? p.location : '',
        });
        if (Array.isArray(p.images)) setPhotoUrls(p.images);
        setLoaded(true);
      })
      .catch(() => { setError('Could not load this listing.'); setLoaded(true); });
  }, [listingId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    const supabase = createBrowserClient();
    const urls: string[] = [];
    for (const file of files.slice(0, 10)) {
      const fileName = `guest/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true });
      if (!error) { const { data } = supabase.storage.from('property-images').getPublicUrl(fileName); urls.push(data.publicUrl); }
    }
    setPhotoUrls(prev => [...prev, ...urls]);
    setUploadingPhotos(false);
  };

  const handleSave = async () => {
    if (!form.title) { setError(lang === 'EN' ? 'Title is required.' : 'ርዕስ ያስፈልጋል።'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/listings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: listingId, photoUrls, form }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save changes.');
      // Back to the payment page for this listing (the usual next step).
      router.push(`/owner/listings/${listingId}/payment`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (!loaded) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>Loading...</div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>
        {lang === 'EN' ? 'Listing not found.' : 'ማስታወቂያ አልተገኘም።'}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 4 }}>
            {lang === 'EN' ? 'Edit Listing' : 'ማስታወቂያ አስተካክል'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>
            {lang === 'EN' ? 'Update your listing details, then continue to payment.' : 'ዝርዝሮችን ያስተካክሉ፣ ከዚያ ወደ ክፍያ ይቀጥሉ።'}
          </p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={labelStyle}>{lang === 'EN' ? 'Title' : 'ርዕስ'}</label>
              <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'EN' ? 'Description' : 'መግለጫ'}</label>
              <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' as const }} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Type' : 'አይነት'}</label>
                <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="sale">{lang === 'EN' ? 'For Sale' : 'ለሽያጭ'}</option>
                  <option value="long_rent">{lang === 'EN' ? 'Long Rent' : 'የረዥም ጊዜ ኪራይ'}</option>
                  <option value="short_rent">{lang === 'EN' ? 'Short Rent' : 'የአጭር ጊዜ ኪራይ'}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Condition' : 'ሁኔታ'}</label>
                <select style={inputStyle} value={form.condition} onChange={e => set('condition', e.target.value)}>
                  <option value="new">{lang === 'EN' ? 'New' : 'አዲስ'}</option>
                  <option value="good">{lang === 'EN' ? 'Good' : 'ጥሩ'}</option>
                  <option value="needs_renovation">{lang === 'EN' ? 'Needs Renovation' : 'እድሳት ይፈልጋል'}</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>{lang === 'EN' ? 'Price' : 'ዋጋ'}</label>
                {form.type !== 'short_rent' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{lang === 'EN' ? 'Negotiable' : 'የሚደራደር'}</span>
                    <div onClick={() => set('price_negotiable', !form.price_negotiable)} style={{ width: 44, height: 24, borderRadius: 12, background: form.price_negotiable ? '#006AFF' : '#d1d5db', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: form.price_negotiable ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                )}
              </div>
              {form.price_negotiable && form.type !== 'short_rent' ? (
                <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 14, color: '#065f46' }}>
                  {lang === 'EN' ? 'Price is negotiable' : 'ዋጋው የሚደራደር ነው'}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Currency' : 'ምንዛሬ'}</label>
                    <select style={inputStyle} value={form.currency} onChange={e => set('currency', e.target.value)}>
                      <option value="ETB">ETB</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === 'EN' ? 'Amount' : 'መጠን'}</label>
                    <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>{lang === 'EN' ? 'Bedrooms' : 'መኝታ ክፍሎች'}</label><input style={inputStyle} type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} /></div>
              <div><label style={labelStyle}>{lang === 'EN' ? 'Bathrooms' : 'መታጠቢያ ክፍሎች'}</label><input style={inputStyle} type="number" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} /></div>
              <div><label style={labelStyle}>{lang === 'EN' ? 'Area (m²)' : 'ስፋት (ሜ²)'}</label><input style={inputStyle} type="number" value={form.area} onChange={e => set('area', e.target.value)} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'City' : 'ከተማ'}</label>
                <select style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">{lang === 'EN' ? '— Select city —' : '— ከተማ ይምረጡ —'}</option>
                  {ETHIOPIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{lang === 'EN' ? 'Subcity' : 'ክፍለ ከተማ'}</label>
                <input style={inputStyle} value={form.subcity} onChange={e => set('subcity', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{lang === 'EN' ? 'Location / Landmark' : 'አካባቢ / መለያ'}</label>
              <input style={inputStyle} value={form.specific_location} onChange={e => set('specific_location', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div style={sectionStyle}>
          <label style={{ ...labelStyle, marginBottom: 12 }}>{lang === 'EN' ? 'Photos' : 'ፎቶዎች'}</label>
          {photoUrls.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
              {photoUrls.map((url, i) => (
                <div key={url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setPhotoUrls(p => p.filter(u => u !== url))} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 14, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <label style={{ display: 'inline-block', padding: '11px 18px', borderRadius: 8, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {uploadingPhotos ? (lang === 'EN' ? 'Uploading...' : 'በመጫን ላይ...') : (lang === 'EN' ? '+ Add Photos' : '+ ፎቶ ጨምር')}
            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push(`/owner/listings/${listingId}/payment`)} style={{ flex: 1, padding: '15px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            {lang === 'EN' ? 'Cancel' : 'ሰርዝ'}
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '15px', borderRadius: 12, background: saving ? '#9ca3af' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? (lang === 'EN' ? 'Saving...' : 'በማስቀመጥ ላይ...') : (lang === 'EN' ? 'Save Changes & Continue' : 'አስቀምጥ እና ቀጥል')}
          </button>
        </div>
      </div>
    </div>
  );
}

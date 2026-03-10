'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase';
import { uploadPropertyImage } from '@/lib/upload-image';
import { GPSPicker } from './GPSPicker';
import { LocationPrivacyPicker } from './LocationPrivacyPicker';
import { AMENITIES_KEYS } from '@/types';
import type { LocationPrivacy, PropertyType } from '@/types';
import { Loader2, Upload } from 'lucide-react';

const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking', wifi: 'WiFi', generator: 'Generator', water_tank: 'Water Tank',
  security: 'Security', cctv: 'CCTV', gym: 'Gym', pool: 'Pool',
  elevator: 'Elevator', furnished: 'Furnished', ac: 'A/C', solar: 'Solar',
};

export function PropertyUploadForm() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [locationPrivacy, setLocationPrivacy] = useState<LocationPrivacy>('approximate');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', type: 'sale' as PropertyType,
    price: '', currency: 'ETB', bedrooms: '', bathrooms: '',
    area_sqm: '', location_name: '', subcity: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!user || !form.title || !form.price || !form.location_name) return;
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: prop, error } = await supabase.from('properties').insert({
        owner_id: user.id,
        title: form.title, description: form.description,
        type: form.type, price: Number(form.price), currency: form.currency,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
        location_name: form.location_name, subcity: form.subcity,
        latitude: lat, longitude: lng, location_privacy: locationPrivacy,
        amenities, status: 'published', expires_at,
      }).select('id').single();
      if (error || !prop) throw error;
      for (let i = 0; i < images.length; i++) {
        const url = await uploadPropertyImage(images[i], prop.id);
        await supabase.from('property_images').insert({ property_id: prop.id, image_url: url, is_main: i === 0, sort_order: i });
      }
      router.push(`/property/${prop.id}`);
    } catch (e) { console.error(e); setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">Basic Info</h2>
        <input className="input-field" placeholder="Title" value={form.title} onChange={e => set('title', e.target.value)} />
        <textarea className="input-field min-h-[100px]" placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="sale">For Sale</option>
            <option value="long_rent">For Rent</option>
            <option value="short_rent">Short Stay</option>
          </select>
          <select className="input-field" value={form.currency} onChange={e => set('currency', e.target.value)}>
            <option value="ETB">ETB</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <input className="input-field" type="number" placeholder="Price" value={form.price} onChange={e => set('price', e.target.value)} />
        <div className="grid grid-cols-3 gap-3">
          <input className="input-field" type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
          <input className="input-field" type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
          <input className="input-field" type="number" placeholder="Area (sqm)" value={form.area_sqm} onChange={e => set('area_sqm', e.target.value)} />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">Location</h2>
        <input className="input-field" placeholder="Location name (e.g. Bole, Addis Ababa)" value={form.location_name} onChange={e => set('location_name', e.target.value)} />
        <input className="input-field" placeholder="Subcity" value={form.subcity} onChange={e => set('subcity', e.target.value)} />
        <GPSPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
        <LocationPrivacyPicker value={locationPrivacy} onChange={setLocationPrivacy} />
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">Amenities</h2>
        <div className="grid grid-cols-3 gap-2">
          {AMENITIES_KEYS.map(a => (
            <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={amenities.includes(a)}
                onChange={e => setAmenities(p => e.target.checked ? [...p, a] : p.filter(x => x !== a))} />
              {AMENITY_LABELS[a]}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">Photos</h2>
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Click to upload photos</span>
          <input type="file" multiple accept="image/*" className="hidden"
            onChange={e => setImages(Array.from(e.target.files ?? []))} />
        </label>
        {images.length > 0 && <p className="text-sm text-gray-600">{images.length} photo(s) selected</p>}
      </div>

      <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</> : 'Publish Listing'}
      </button>
    </div>
  );
}

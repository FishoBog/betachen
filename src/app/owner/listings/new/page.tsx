'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Upload, MapPin, Home, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { PriceSuggestion } from '@/components/property/PriceSuggestion';

const REGIONS = [
  'አዲስ አበባ / Addis Ababa', 'ኦሮሚያ / Oromia', 'አማራ / Amhara',
  'ትግራይ / Tigray', 'ደቡብ ብሔሮች / SNNPR', 'ሲዳማ / Sidama',
  'ድሬዳዋ / Dire Dawa', 'ሐረሪ / Harari', 'አፋር / Afar', 'ሶማሌ / Somali',
];

const ADDIS_SUBCITIES = [
  'ቦሌ / Bole', 'ቂርቆስ / Kirkos', 'የካ / Yeka', 'ንፋስ ስልክ / Nifas Silk',
  'አቃቂ / Akaki', 'ሊደታ / Lideta', 'ጉለሌ / Gulele', 'ቆልፈ / Kolfe',
  'አራዳ / Arada', 'አዲስ ከተማ / Addis Ketema', 'ለሚ ኩራ / Lemi Kura',
];

const AMENITIES = [
  { key: 'wifi', label: '📶 WiFi' },
  { key: 'generator', label: '⚡ Generator' },
  { key: 'water_tank', label: '💧 Water Tank' },
  { key: 'security', label: '💂 Security' },
  { key: 'cctv', label: '📹 CCTV' },
  { key: 'gym', label: '🏋️ Gym' },
  { key: 'pool', label: '🏊 Pool' },
  { key: 'elevator', label: '🛗 Elevator' },
  { key: 'furnished', label: '🛋️ Furnished' },
  { key: 'ac', label: '❄️ A/C' },
  { key: 'solar', label: '☀️ Solar' },
  { key: 'garden', label: '🌿 Garden' },
  { key: 'balcony', label: '🏠 Balcony' },
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
    plot_area_sqm: '',
    bathroom_type: 'private',
    kitchen_type: 'none',
    distance_to_road_m: '',
    ground_water: false,
    water_tanker: false,
    parking_spaces: '',
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
          plot_area_sqm: form.plot_area_sqm ? parseFloat(form.plot_area_sqm) : null,
          bathroom_type: form.bathroom_type,
          kitchen_type: form.kitchen_type,
          distance_to_road_m: form.distance_to_road_m ? parseInt(form.distance_to_road_m) : null,
          ground_water: form.ground_water,
          water_tanker: form.water_tanker,
          parking_spaces: form.parking_spaces ? parseInt(form.parking_spaces) : null,
          status: 'pending_review',
          owner_email:

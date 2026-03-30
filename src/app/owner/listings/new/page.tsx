'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/context/LangContext';
import { Upload, MapPin, Home, CheckCircle, ArrowRight, ArrowLeft, X, ChevronDown, Camera, Users, Shield, TrendingUp, PlusCircle, Building2 } from 'lucide-react';
import { PriceSuggestion } from '@/components/property/PriceSuggestion';

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
  { cityEn: 'Jijiga', cityAm: 'ጅጅጋ', subsEn: ['Kebele 01','Kebele 04','Taiwan','Dudaxada','Dudahidhi'], subsAm: ['ቀበሌ 01','ቀበሌ 04','ታይዋን','ዱዳሀዳ','ዱዳሂዲ'] },
  { cityEn: 'Shashemene', cityAm: 'ሻሸመኔ', subsEn: ['Bulchana','Arada','Kuyera','Abosto','Alelu','Haile Selassie'], subsAm: ['ቡልቻና','አራዳ','ኩየራ','አቦስቶ','አለሉ','ኃይለ ሥላሴ'] },
  { cityEn: 'Bishoftu', cityAm: 'ቢሾፍቱ', subsEn: ['Kebele 01','Kebele 02','Kuriftu','Babogaya','Hora'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ኩሪፍቱ','ባቦጋያ','ሆራ'] },
  { cityEn: 'Sodo', cityAm: 'ሶዶ', subsEn: ['Arada','Mehal','Wolaita Sodo Zuria','Gurumu','Kercheche'], subsAm: ['አራዳ','መሀል','ወላይታ ሶዶ ዙሪያ','ጉሩሙ','ቀርጨጬ'] },
  { cityEn: 'Arba Minch', cityAm: 'አርባ ምንጭ', subsEn: ['Secha','Sikela','Kulfo','Limat','Dozo'], subsAm: ['ሰጫ','ሲከላ','ኩልፎ','ልማት','ዶዞ'] },
  { cityEn: 'Hosaena', cityAm: 'ሆሳዕና', subsEn: ['Gojeb','Sech Duna','Lichamba','Bobicho'], subsAm: ['ጎጀብ','ሰጭ ዱና','ሊቻምባ','ቦቢቾ'] },
  { cityEn: 'Nekemte', cityAm: 'ነቀምት', subsEn: ['Bakanisa','Chalalaki','Kumsa Moroda','Cheleleki'], subsAm: ['በቀኒሳ','ጨለለቂ','ኩምሳ ሞሮዳ','ጨለለቂ'] },
  { cityEn: 'Asella', cityAm: 'አሰላ', subsEn: ['Kebele 01','Kebele 02','Arada','Chilalo'], subsAm: ['ቀበሌ 01','ቀበሌ 02','አራዳ','ጭላሎ'] },
  { cityEn: 'Dilla', cityAm: 'ዲላ', subsEn: ['Arada','Mehal','Odey','Chichu'], subsAm: ['አራዳ','መሀል','ኦዴይ','ቺቹ'] },
  { cityEn: 'Ambo', cityAm: 'አምቦ', subsEn: ['Kebele 01','Senkele','Abebe Bikila','Oda Nabee'], subsAm: ['ቀበሌ 01','ሰንቀሌ','አበበ ቢቂላ','ኦዳ ነቤ'] },
  { cityEn: 'Debre Birhan', cityAm: 'ደብረ ብርሃን', subsEn: ['Kebele 01','Kebele 04','Kebele 09','Atse Zerayacob'], subsAm: ['ቀበሌ 01','ቀበሌ 04','ቀበሌ 09','አፄ ዘርዓ ያዕቆብ'] },
  { cityEn: 'Debre Markos', cityAm: 'ደብረ ማርቆስ', subsEn: ['Kebele 03','Kebele 05','Gojjam Ber','Nigus Teklehaimanot'], subsAm: ['ቀበሌ 03','ቀበሌ 05','ጎጃም በር','ንጉሥ ተክለሃይማኖት'] },
  { cityEn: 'Kombolcha', cityAm: 'ኮምቦልቻ', subsEn: ['Kebele 01','Kebele 03','Worka','Millennium'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ወርቃ','ሚሊኒየም'] },
  { cityEn: 'Harar', cityAm: 'ሐረር', subsEn: ['Jugol','Shenkor','Aboker','JinEala','Duk Ber'], subsAm: ['ጁጎል','ሸንኮር','አቦከር','ጅን ኤላ','ዱክ በር'] },
  { cityEn: 'Lalibela', cityAm: 'ላሊበላ', subsEn: ['Kebele 01','Kebele 02','Shimberma','Neakuto Leab'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ሽምብርማ','ነአኩቶ ለአብ'] },
  { cityEn: 'Aksum', cityAm: 'አክሱም', subsEn: ['Hayelom','Hawelti','Nebrid','Kindeya'], subsAm: ['ሃየሎም','ሓወልቲ','ነብሪድ','ክንደያ'] },
  { cityEn: 'Adigrat', cityAm: 'ዓዲግራት', subsEn: ['Kebele 01','Kebele 03','Agazi','GindaAt'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ዓጋዚ','ጊንዳዓት'] },
  { cityEn: 'Shire', cityAm: 'ሽረ እንዳሥላሴ', subsEn: ['Kebele 01','Kebele 02','Kebele 03','Axum Road'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ቀበሌ 03','አክሱም መንገድ'] },
  { cityEn: 'Maychew', cityAm: 'ማይጨው', subsEn: ['Kebele 01','Kebele 02','Adi-Goshu'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ዓዲ ጎሹ'] },
  { cityEn: 'Alamata', cityAm: 'አላማጣ', subsEn: ['Kebele 01','Kebele 02','Garjale'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ጋርጃሌ'] },
  { cityEn: 'Kobo', cityAm: 'ቆቦ', subsEn: ['Kebele 01','Kebele 02','Arada'], subsAm: ['ቀበሌ 01','ቀበሌ 02','አራዳ'] },
  { cityEn: 'Debre Tabor', cityAm: 'ደብረ ታቦር', subsEn: ['Kebele 01','Kebele 03','Kebele 04','Guna'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ቀበሌ 04','ጉና'] },
  { cityEn: 'Debark', cityAm: 'ደባርቅ', subsEn: ['Kebele 01','Kebele 02','Simien Gate'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ስሜን መግቢያ'] },
  { cityEn: 'Woldiya', cityAm: 'ወልድያ', subsEn: ['Piazza','Arada','Gubalafto'], subsAm: ['ፒያሳ','አራዳ','ጉባላፍቶ'] },
  { cityEn: 'Welkite', cityAm: 'ወልቂጤ', subsEn: ['Kebele 01','Kebele 02','Gubre'], subsAm: ['ቀበሌ 01','ቀበሌ 02','ጉብሬ'] },
  { cityEn: 'Goba', cityAm: 'ጎባ', subsEn: ['Arada','Furuna','Kebele 01'], subsAm: ['አራዳ','ፉሩና','ቀበሌ 01'] },
  { cityEn: 'Robe', cityAm: 'ሮቤ', subsEn: ['Mehal Ketema','Beklo Bet','Airport Road'], subsAm: ['መሀል ከተማ','በቅሎ ቤት','አየር መንገድ'] },
  { cityEn: 'Burayu', cityAm: 'ቡራዩ', subsEn: ['Gefersa','Keta','Sansusi'], subsAm: ['ገፈርሳ','ቀታ','ሳንሱሲ'] },
  { cityEn: 'Sululta', cityAm: 'ሱሉልታ', subsEn: ['Sululta Center','Mulu'], subsAm: ['ሱሉልታ መሀል','ሙሉ'] },
  { cityEn: 'Sebeta', cityAm: 'ሰበታ', subsEn: ['Alem Gena','Sebeta Center','Walayte'], subsAm: ['ዓለም ገና','ሰበታ መሀል','ወላይቴ'] },
  { cityEn: 'Legetafo', cityAm: 'ለገጣፎ', subsEn: ['Legedadi','Legetafo Center'], subsAm: ['ለገዳዲ','ለገጣፎ መሀል'] },
  { cityEn: 'Gambela', cityAm: 'ጋምቤላ', subsEn: ['Kebele 01','Kebele 03','Baro River side','Newland'], subsAm: ['ቀበሌ 01','ቀበሌ 03','ባሮ ወንዝ ዳር','ኒውላንድ'] },
  { cityEn: 'Assosa', cityAm: 'አሶሳ', subsEn: ['Kebele 01','Kebele 02','Amba 14','Selga'], subsAm: ['ቀበሌ 01','ቀበሌ 02','አምባ 14','ሰልጋ'] },
  { cityEn: 'Semera', cityAm: 'ሰመራ', subsEn: ['Semera Center','Logia Town','Agat'], subsAm: ['ሰመራ መሀል','ሎጊያ ከተማ','አጋት'] },
];

const CITY_COORDS: Record<string, [number, number]> = {
  'Addis Ababa': [9.0192, 38.7525], 'Dire Dawa': [9.5931, 41.8661],
  'Adama': [8.5400, 39.2700], 'Gondar': [12.6000, 37.4667],
  'Hawassa': [7.0500, 38.4667], 'Bahir Dar': [11.5742, 37.3614],
  'Mekelle': [13.4967, 39.4767], 'Jimma': [7.6667, 36.8333],
  'Dessie': [11.1333, 39.6333], 'Jijiga': [9.3500, 42.8000],
  'Harar': [9.3131, 42.1188],
};

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

function MapPinPicker({ lat, lng, onPick, city, t }: {
  lat: string; lng: string;
  onPick: (lat: number, lng: number) => void;
  city: string; t: any;
}) {
  const defaultCoords = CITY_COORDS[city] || [9.0192, 38.7525];
  const [coordText, setCoordText] = useState(lat && lng ? `${lat}, ${lng}` : '');
  const parseCoords = (text: string) => {
    const parts = text.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const parsedLat = parseFloat(parts[0]);
      const parsedLng = parseFloat(parts[1]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) onPick(parsedLat, parsedLng);
    }
  };
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginBottom: 12 }}>{t.coordTitle}</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {[t.coordStep1, t.coordStep2, t.coordStep3, t.coordStep4, t.coordStep5].map((step: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#006AFF', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>
        <button onClick={() => window.open('https://maps.google.com', '_blank')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '9px 18px', background: '#006AFF', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {t.openMaps}
        </button>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{t.coordPaste}</label>
        <input type="text" value={coordText}
          onChange={e => { setCoordText(e.target.value); parseCoords(e.target.value); }}
          placeholder={`e.g. ${defaultCoords[0].toFixed(4)}, ${defaultCoords[1].toFixed(4)}`}
          style={{ ...inputStyle, fontSize: 15 }} />
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{t.coordHint}</div>
      </div>
      {lat && lng && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>{t.coordSet}</div>
          <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
            {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewListingPage() {
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
    title: '', description: '', type: 'sale', currency: 'ETB',
    price: '', price_negotiable: false, bedrooms: '', bathrooms: '',
    total_rooms: '', area: '', floor: '', total_floors: '', condition: 'good',
    city: '', subcity: '', woreda: '', kebele: '', specific_location: '',
    lat: '', lng: '', whatsapp: '', amenities: [] as string[],
    nearby_landmarks: [] as string[], year_built: '', plot_area_sqm: '',
    bathroom_type: 'private', kitchen_type: 'none', distance_to_road_m: '',
    road_type: 'asphalt', ground_water: false, water_tanker: false,
    parking_spaces: '', has_compound_wall: false, has_guard_house: false,
    internet_type: 'none', electricity_reliability: '24hr',
  });

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));
  const selectedCity = ETHIOPIA_CITIES.find(c => c.cityEn === form.city);
  const filteredCities = ETHIOPIA_CITIES.filter(c =>
    citySearch === '' ||
    c.cityEn.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.cityAm.includes(citySearch)
  );

  const toggleAmenity = (key: string) => setForm(p => ({
    ...p, amenities: p.amenities.includes(key) ? p.amenities.filter(a => a !== key) : [...p.amenities, key]
  }));
  const toggleLandmark = (key: string) => setForm(p => ({
    ...p, nearby_landmarks: p.nearby_landmarks.includes(key) ? p.nearby_landmarks.filter(a => a !== key) : [...p.nearby_landmarks, key]
  }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    const supabase = createBrowserClient();
    const urls: string[] = [];
    for (const file of files.slice(0, 10)) {
      const fileName = `${user?.id}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
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
      const locationParts = [form.specific_location, form.kebele, form.woreda, form.subcity, form.city].filter(Boolean);
      const { data, error: err } = await supabase.from('properties').insert({
        owner_id: user.id, title: form.title, description: form.description,
        type: form.type, currency: form.currency,
        price: form.price_negotiable ? 0 : parseFloat(form.price),
        price_negotiable: form.price_negotiable,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        total_rooms: form.total_rooms ? parseInt(form.total_rooms) : null,
        area: form.area ? parseFloat(form.area) : null,
        area_sqm: form.area ? parseFloat(form.area) : null,
        condition: form.condition, location: locationParts.join(', '), subcity: form.subcity,
        latitude: form.lat ? parseFloat(form.lat) : null,
        longitude: form.lng ? parseFloat(form.lng) : null,
        images: photoUrls, amenities: form.amenities,
        nearby_landmarks: form.nearby_landmarks,
        plot_area_sqm: form.plot_area_sqm ? parseFloat(form.plot_area_sqm) : null,
        bathroom_type: form.bathroom_type, kitchen_type: form.kitchen_type,
        distance_to_road_m: form.distance_to_road_m ? parseInt(form.distance_to_road_m) : null,
        road_type: form.road_type, ground_water: form.ground_water, water_tanker: form.water_tanker,
        parking_spaces: form.parking_spaces ? parseInt(form.parking_spaces) : null,
        has_compound_wall: form.has_compound_wall, has_guard_house: form.has_guard_house,
        internet_type: form.internet_type, electricity_reliability: form.electricity_reliability,
        status: 'pending_review',
        owner_email: user.primaryEmailAddress?.emailAddress,
        owner_whatsapp: form.whatsapp,
      }).select().single();
      if (err) throw err;
      router.push(`/owner/listings/${data.id}/payment`);
    } catch (err: any) {
      setError(err.message); setLoading(false);
    }
  };

  const AMENITIES = [
    { key: 'wifi', label: lang === 'EN' ? 'WiFi' : 'ዋይፋይ' },
    { key: 'generator', label: lang === 'EN' ? 'Generator' : 'ጀነሬተር' },
    { key: 'water_tank', label: lang === 'EN' ? 'Water Tank' : 'የውሃ ታንክ' },
    { key: 'security', label: lang === 'EN' ? 'Security' : 'ደህንነት' },
    { key: 'cctv', label: 'CCTV' },
    { key: 'gym', label: lang === 'EN' ? 'Gym' : 'ጂም' },
    { key: 'pool', label: lang === 'EN' ? 'Pool' : 'መዋኛ' },
    { key: 'elevator', label: lang === 'EN' ? 'Elevator' : 'አሳንሶር' },
    { key: 'furnished', label: lang === 'EN' ? 'Furnished' : 'የታጠቀ' },
    { key: 'ac', label: lang === 'EN' ? 'A/C' : 'ኤ.ሲ' },
    { key: 'solar', label: lang === 'EN' ? 'Solar' : 'ሶላር' },
    { key: 'garden', label: lang === 'EN' ? 'Garden' : 'የአትክልት ቦታ' },
    { key: 'balcony', label: lang === 'EN' ? 'Balcony' : 'በረንዳ' },
  ];

  const LANDMARKS = lang === 'EN'
    ? ['School','University','Hospital','Clinic','Market','Supermarket','Mosque','Church','Bank','ATM','Bus Stop','Main Road','Shopping Mall','Restaurant','Hotel','Police Station']
    : ['ትምህርት ቤት','ዩኒቨርሲቲ','ሆስፒታል','ክሊኒክ','ገበያ','ሱፐርማርኬት','መስጊድ','ቤተክርስቲያን','ባንክ','ኤቲኤም','የባስ ማቆሚያ','ዋና መንገድ','ሸሞንግ ሞል','ሬስቶራንት','ሆቴል','ፖሊስ ጣቢያ'];

  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];

  if (!isLoaded) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>{t.loading}</div>
    </div>
  );

  if (!isSignedIn) return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <Navbar />
      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '64px 24px 72px', textAlign: 'center' as const }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8431A', borderRadius: 20, padding: '6px 18px', marginBottom: 20 }}>
          <Building2 size={13} color="white" />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.8px' }}>{t.postPageTag}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
          {t.postPageTitle1}<br /><span style={{ color: '#FF6B35' }}>{t.postPageTitle2}</span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto 32px' }}>
          {t.postPageDesc}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const, maxWidth: 460, margin: '0 auto' }}>
          <SignInButton mode="modal">
            <button style={{ flex: 1, minWidth: 200, padding: '15px 24px', borderRadius: 12, background: '#E8431A', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <PlusCircle size={17} /> {t.postPageCta1}
            </button>
          </SignInButton>
          <SignInButton mode="modal">
            <button style={{ flex: 1, minWidth: 160, padding: '15px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, fontSize: 15, border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              {t.postPageCta2}
            </button>
          </SignInButton>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>{t.postPageFooter}</p>
        {/* Social proof numbers */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 48, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {[['1,200+', lang === 'EN' ? 'Active Listings' : 'ንቁ ማስታወቂያዎች'], ['500+', lang === 'EN' ? 'Property Owners' : 'ባለቤቶች'], ['24hrs', lang === 'EN' ? 'Review Time' : 'የግምገማ ጊዜ']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' as const }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'white' }}>{num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits grid */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: 40 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            {lang === 'EN' ? 'Everything you need to list successfully' : 'በስኬት ለመዘርዘር የሚያስፈልግዎ ሁሉ'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15 }}>
            {lang === 'EN' ? 'Join hundreds of owners already listing on ጎጆ' : 'አስቀድሞ በጎጆ ላይ ከሚዘረዝሩ በርካታ ባለቤቶች ጋር ይቀላቀሉ'}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { icon: Camera, title: t.postPageB1Title, desc: t.postPageB1Desc, color: '#dbeafe', iconColor: '#1d4ed8' },
            { icon: Users, title: t.postPageB2Title, desc: t.postPageB2Desc, color: '#d1fae5', iconColor: '#065f46' },
            { icon: Shield, title: t.postPageB3Title, desc: t.postPageB3Desc, color: '#fef3c7', iconColor: '#92400e' },
            { icon: TrendingUp, title: t.postPageB4Title, desc: t.postPageB4Desc, color: '#fce7f3', iconColor: '#9d174d' },
          ].map(({ icon: Icon, title, desc, color, iconColor }) => (
            <div key={title} style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' as const }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Icon size={24} color={iconColor} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
        {/* Final CTA */}
        <div style={{ marginTop: 48, textAlign: 'center' as const, background: '#f9fafb', borderRadius: 20, padding: '40px 32px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            {lang === 'EN' ? 'Ready to reach thousands of buyers?' : 'ሺዎችን ገዢዎች ለመድረስ ዝግጁ ነዎት?'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            {lang === 'EN' ? 'Create your free account and post your first listing in minutes.' : 'ነፃ መለያዎን ይፍጠሩ እና የመጀመሪያ ማስታወቂያዎን በደቂቃዎች ውስጥ ይለጥፉ።'}
          </p>
          <SignInButton mode="modal">
            <button style={{ padding: '15px 40px', borderRadius: 12, background: '#E8431A', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <PlusCircle size={18} /> {t.postPageCta1}
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 6 }}>{t.formTitle}</h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>{t.formSubtitle}</p>
        </div>

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

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t.step1}</div>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>{t.propTitle}</label>
                  <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder={t.propTitlePlaceholder} />
                </div>
                <div>
                  <label style={labelStyle}>{t.description}</label>
                  <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' as const }} value={form.description} onChange={e => set('description', e.target.value)} placeholder={t.descPlaceholder} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{t.listingType}</label>
                    <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
                      <option value="sale">{t.forSaleOpt}</option>
                      <option value="long_rent">{t.longRentOpt}</option>
                      <option value="short_rent">{t.shortRentOpt}</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t.condition}</label>
                    <select style={inputStyle} value={form.condition} onChange={e => set('condition', e.target.value)}>
                      <option value="new">{t.condNew}</option>
                      <option value="good">{t.condGood}</option>
                      <option value="needs_renovation">{t.condRenovation}</option>
                    </select>
                  </div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      {lang === 'EN' ? 'Price' : 'ዋጋ'} {form.type === 'long_rent' ? t.pricePerMonth : form.type === 'short_rent' ? t.pricePerNight : ''}
                    </label>
                    {form.type !== 'short_rent' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{t.negotiable}</span>
                        <div onClick={() => set('price_negotiable', !form.price_negotiable)} style={{ width: 44, height: 24, borderRadius: 12, background: form.price_negotiable ? '#006AFF' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: 2, left: form.price_negotiable ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {form.price_negotiable && form.type !== 'short_rent' ? (
                    <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13, color: '#065f46', fontWeight: 500 }}>
                      {t.negotiableNote}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>{t.currency}</label>
                        <select style={inputStyle} value={form.currency} onChange={e => set('currency', e.target.value)}>
                          <option value="ETB">ETB — Ethiopian Birr</option>
                          <option value="USD">USD — US Dollar</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>{t.amount}</label>
                        <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder={form.type === 'sale' ? 'e.g. 5000000' : 'e.g. 15000'} />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>{t.bedrooms}</label><input style={inputStyle} type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="e.g. 3" /></div>
                  <div><label style={labelStyle}>{t.bathrooms}</label><input style={inputStyle} type="number" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="e.g. 2" /></div>
                  <div><label style={labelStyle}>{t.totalRooms}</label><input style={inputStyle} type="number" min="0" value={form.total_rooms} onChange={e => set('total_rooms', e.target.value)} placeholder="e.g. 6" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>{t.houseArea}</label><input style={inputStyle} type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. 120" /></div>
                  <div><label style={labelStyle}>{t.floorNumber}</label><input style={inputStyle} type="number" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="e.g. 3" /></div>
                  <div><label style={labelStyle}>{t.totalFloors}</label><input style={inputStyle} type="number" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} placeholder="e.g. 10" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>{t.yearBuilt}</label><input style={inputStyle} type="number" value={form.year_built} onChange={e => set('year_built', e.target.value)} placeholder="e.g. 2020" /></div>
                  <div><label style={labelStyle}>{t.whatsapp}</label><input style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+251911234567" /></div>
                </div>
              </div>
            </div>
            <button onClick={() => { if (!form.title || (!form.price && !form.price_negotiable)) { setError(t.fillTitlePrice); return; } setError(''); setStep(2); }}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {t.nextLocation} <ArrowRight size={18} />
            </button>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t.step2}</div>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div ref={cityRef} style={{ position: 'relative' }}>
                  <label style={labelStyle}>{t.cityLabel}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={citySearch || (form.city ? `${form.city} (${ETHIOPIA_CITIES.find(c => c.cityEn === form.city)?.cityAm})` : '')}
                      onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); if (!e.target.value) { set('city', ''); set('subcity', ''); } }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder={t.cityPlaceholder}
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
                  <label style={{ ...labelStyle, opacity: selectedCity ? 1 : 0.5 }}>{t.subcityLabel}</label>
                  <select value={form.subcity} onChange={e => set('subcity', e.target.value)} disabled={!selectedCity} style={{ ...inputStyle, opacity: selectedCity ? 1 : 0.5 }}>
                    <option value="">{selectedCity ? (lang === 'EN' ? `All ${selectedCity.cityEn}` : `ሁሉም ${selectedCity.cityAm}`) : (lang === 'EN' ? '— Select city first —' : '— መጀመሪያ ከተማ ይምረጡ —')}</option>
                    {selectedCity?.subsEn.map((sub, i) => (
                      <option key={sub} value={sub}>{lang === 'EN' ? `${sub} — ${selectedCity.subsAm[i]}` : `${selectedCity.subsAm[i]} — ${sub}`}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>{t.woredaLabel}</label><input style={inputStyle} value={form.woreda} onChange={e => set('woreda', e.target.value)} placeholder={t.woredaPlaceholder} /></div>
                  <div><label style={labelStyle}>{t.kebeleLabel}</label><input style={inputStyle} value={form.kebele} onChange={e => set('kebele', e.target.value)} placeholder={t.kebelePlaceholder} /></div>
                </div>
                <div>
                  <label style={labelStyle}>{t.landmarkLabel}</label>
                  <input style={inputStyle} value={form.specific_location} onChange={e => set('specific_location', e.target.value)} placeholder={t.landmarkPlaceholder} />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{t.landmarkHint}</div>
                </div>
                <MapPinPicker lat={form.lat} lng={form.lng} city={form.city} t={t}
                  onPick={(lat, lng) => { set('lat', lat.toFixed(6)); set('lng', lng.toFixed(6)); }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> {t.back}
              </button>
              <button onClick={() => { if (!form.city) { setError(t.selectCity); return; } setError(''); setStep(3); }}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {t.nextDetails} <ArrowRight size={18} />
              </button>
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{t.step3}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{lang === 'EN' ? 'Provide specific details about the property' : 'ስለ ንብረቱ ዝርዝር መረጃ ያቅርቡ'}</div>
              <div style={{ display: 'grid', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>{t.plotArea}</label><input style={inputStyle} type="number" value={form.plot_area_sqm} onChange={e => set('plot_area_sqm', e.target.value)} placeholder="e.g. 300" /></div>
                  <div><label style={labelStyle}>{t.parkingSpaces}</label><input style={inputStyle} type="number" min="0" value={form.parking_spaces} onChange={e => set('parking_spaces', e.target.value)} placeholder="e.g. 2" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{t.bathroomType}</label>
                    <select style={inputStyle} value={form.bathroom_type} onChange={e => set('bathroom_type', e.target.value)}>
                      <option value="private">{t.privateBath}</option>
                      <option value="shared">{t.sharedBath}</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t.kitchenType}</label>
                    <select style={inputStyle} value={form.kitchen_type} onChange={e => set('kitchen_type', e.target.value)}>
                      <option value="none">{t.noKitchen}</option>
                      <option value="private">{t.privateKitchen}</option>
                      <option value="shared">{t.sharedKitchen}</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>{t.distRoad}</label><input style={inputStyle} type="number" min="0" value={form.distance_to_road_m} onChange={e => set('distance_to_road_m', e.target.value)} placeholder="e.g. 50" /></div>
                  <div>
                    <label style={labelStyle}>{t.roadType}</label>
                    <select style={inputStyle} value={form.road_type} onChange={e => set('road_type', e.target.value)}>
                      <option value="asphalt">{t.asphalt}</option>
                      <option value="cobblestone">{t.cobblestone}</option>
                      <option value="dirt">{t.dirtRoad}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t.securityLabel}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div onClick={() => set('has_compound_wall', !form.has_compound_wall)} style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${form.has_compound_wall ? '#006AFF' : '#e5e7eb'}`, background: form.has_compound_wall ? '#f0f6ff' : 'white', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.has_compound_wall ? '#006AFF' : '#374151' }}>{form.has_compound_wall ? '✓ ' : ''}{t.compoundWall}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{t.compoundWallDesc}</div>
                    </div>
                    <div onClick={() => set('has_guard_house', !form.has_guard_house)} style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${form.has_guard_house ? '#006AFF' : '#e5e7eb'}`, background: form.has_guard_house ? '#f0f6ff' : 'white', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.has_guard_house ? '#006AFF' : '#374151' }}>{form.has_guard_house ? '✓ ' : ''}{t.guardHouse}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{t.guardHouseDesc}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t.waterSupply}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div onClick={() => set('ground_water', !form.ground_water)} style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${form.ground_water ? '#059669' : '#e5e7eb'}`, background: form.ground_water ? '#ecfdf5' : 'white', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.ground_water ? '#065f46' : '#374151' }}>{form.ground_water ? '✓ ' : ''}{t.groundWater}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{t.groundWaterDesc}</div>
                    </div>
                    <div onClick={() => set('water_tanker', !form.water_tanker)} style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${form.water_tanker ? '#2563eb' : '#e5e7eb'}`, background: form.water_tanker ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.water_tanker ? '#1e40af' : '#374151' }}>{form.water_tanker ? '✓ ' : ''}{t.waterTanker}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{t.waterTankerDesc}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{t.electricity}</label>
                    <select style={inputStyle} value={form.electricity_reliability} onChange={e => set('electricity_reliability', e.target.value)}>
                      <option value="24hr">{t.elec24hr}</option>
                      <option value="frequent_cuts">{t.elecCuts}</option>
                      <option value="solar_only">{t.elecSolar}</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t.internet}</label>
                    <select style={inputStyle} value={form.internet_type} onChange={e => set('internet_type', e.target.value)}>
                      <option value="none">{t.noInternet}</option>
                      <option value="mobile">{t.mobileData}</option>
                      <option value="fiber">{t.fiberInternet}</option>
                      <option value="both">{t.bothInternet}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{t.nearbyLandmarks}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{t.nearbyLandmarksDesc}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                  {LANDMARKS.map((l, idx) => {
                    const enKey = ['School','University','Hospital','Clinic','Market','Supermarket','Mosque','Church','Bank','ATM','Bus Stop','Main Road','Shopping Mall','Restaurant','Hotel','Police Station'][idx];
                    return (
                      <div key={enKey} onClick={() => toggleLandmark(enKey)} style={{ padding: '8px 12px', borderRadius: 8, border: `2px solid ${form.nearby_landmarks.includes(enKey) ? '#006AFF' : '#e5e7eb'}`, background: form.nearby_landmarks.includes(enKey) ? '#f0f6ff' : 'white', cursor: 'pointer', textAlign: 'center' as const }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: form.nearby_landmarks.includes(enKey) ? '#006AFF' : '#374151' }}>
                          {form.nearby_landmarks.includes(enKey) ? '✓ ' : ''}{l}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{t.amenities}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {AMENITIES.map(a => (
                  <div key={a.key} onClick={() => toggleAmenity(a.key)} style={{ padding: '10px 14px', borderRadius: 10, border: `2px solid ${form.amenities.includes(a.key) ? '#006AFF' : '#e5e7eb'}`, background: form.amenities.includes(a.key) ? '#f0f6ff' : 'white', cursor: 'pointer', textAlign: 'center' as const }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.amenities.includes(a.key) ? '#006AFF' : '#374151' }}>
                      {form.amenities.includes(a.key) ? '✓ ' : ''}{a.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> {t.back}
              </button>
              <button onClick={() => setStep(4)} style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {t.nextPhotos} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={18} color="#E8431A" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t.uploadTitle}</div>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{t.uploadDesc}</div>
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div style={{ border: '2px dashed #d1d5db', borderRadius: 14, padding: '40px 24px', textAlign: 'center', background: '#f9fafb' }}>
                  {uploadingPhotos ? (
                    <div style={{ color: '#006AFF', fontWeight: 600 }}>{t.uploading}</div>
                  ) : (
                    <>
                      <Upload size={36} color="#9ca3af" style={{ marginBottom: 12 }} />
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{t.uploadClick}</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>{t.uploadHint}</div>
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
                <ArrowLeft size={18} /> {t.back}
              </button>
              <button onClick={() => setStep(5)} style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#006AFF', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {t.nextReview} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <PriceSuggestion
                propertyData={{ type: form.type, title: form.title, description: form.description, region: '', city: form.city, subcity: form.subcity, woreda: form.woreda, specific_location: form.specific_location, bedrooms: form.bedrooms, bathrooms: form.bathrooms, area: form.area, floor: form.floor, total_floors: form.total_floors, year_built: form.year_built, amenities: form.amenities }}
                imageUrls={photoUrls}
                onUsePrice={(price) => set('price', price.toString())}
              />
            </div>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} color="#059669" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t.reviewTitle}</div>
              </div>
              <div style={{ display: 'grid', gap: 2 }}>
                {[
                  [lang === 'EN' ? 'Title' : 'ርዕስ', form.title],
                  [lang === 'EN' ? 'Type' : 'አይነት', form.type === 'sale' ? t.forSale : form.type === 'long_rent' ? t.longRentOpt : t.shortRentOpt],
                  [lang === 'EN' ? 'Price' : 'ዋጋ', form.price_negotiable ? t.negotiable : `${form.currency} ${parseFloat(form.price || '0').toLocaleString()}`],
                  [lang === 'EN' ? 'City' : 'ከተማ', form.city || '—'],
                  [lang === 'EN' ? 'Subcity' : 'ክፍለ ከተማ', form.subcity || '—'],
                  [lang === 'EN' ? 'Landmark' : 'ምልክት', form.specific_location || '—'],
                  [lang === 'EN' ? 'Coordinates' : 'መጋጠሚያዎች', form.lat && form.lng ? `${parseFloat(form.lat).toFixed(4)}, ${parseFloat(form.lng).toFixed(4)} ✓` : '—'],
                  [t.bedrooms, form.bedrooms || '—'],
                  [t.bathrooms, `${form.bathrooms || '—'} (${form.bathroom_type === 'private' ? t.privateBath : t.sharedBath})`],
                  [t.kitchenType, form.kitchen_type === 'none' ? t.noKitchen : form.kitchen_type === 'private' ? t.privateKitchen : t.sharedKitchen],
                  [t.houseArea, form.area ? `${form.area} m²` : '—'],
                  [t.roadType, form.road_type === 'asphalt' ? t.asphalt : form.road_type === 'cobblestone' ? t.cobblestone : t.dirtRoad],
                  [t.electricity, form.electricity_reliability === '24hr' ? t.elec24hr : t.elecCuts],
                  [t.groundWater, form.ground_water ? (lang === 'EN' ? 'Yes' : 'አዎ') : (lang === 'EN' ? 'No' : 'አይ')],
                  [t.compoundWall, form.has_compound_wall ? (lang === 'EN' ? 'Yes' : 'አዎ') : (lang === 'EN' ? 'No' : 'አይ')],
                  [t.nearbyLandmarks, form.nearby_landmarks.length > 0 ? form.nearby_landmarks.join(', ') : (lang === 'EN' ? 'None' : 'የለም')],
                  [t.amenities, form.amenities.length > 0 ? form.amenities.join(', ') : (lang === 'EN' ? 'None' : 'የለም')],
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
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{t.listingFeeTitle}</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                • {t.listingFeeDesc1}<br />
                • {t.listingFeeDesc2}<br />
                • {t.listingFeeDesc3}<br />
                • {t.listingFeeDesc4}
              </div>
            </div>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(4)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> {t.back}
              </button>
              <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: 12, background: loading ? '#9ca3af' : '#E8431A', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? t.submitting : t.submitPay}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

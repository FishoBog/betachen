// Authoritative Ethiopian city + subcity data for Betachen.
// Source: curated city list (City_list.docx) with GPS coordinates converted from
// DMS to decimal. Used by:
//   - the listing form's City / Subcity dropdowns
//   - GPSPicker's "is the phone near the selected city?" distance check
//   - the map's approximate-pin (city centroid) fallback
// Keep this file as the single source of truth so all three stay in sync.

export type CityInfo = {
  coords: [number, number];   // [lat, lng] city centre
  region: string;
  subcities: string[];        // administrative subcities / divisions (no per-subcity coords)
};

export const ETHIOPIA_CITIES: Record<string, CityInfo> = {
  'Addis Ababa': {
    coords: [9.03, 38.74],
    region: 'Federal Capital',
    subcities: ['Arada', 'Kirkos', 'Yeka', 'Addis Ketema', 'Gulele', 'Kolfe Keraniyo', 'Nifas Silk-Lafto', 'Akaki Kality', 'Lideta', 'Bole', 'Lemi Kura'],
  },
  'Shaggar': {
    coords: [9.0, 38.75],
    region: 'Oromia',
    subcities: ['Sebeta', 'Burayu', 'Legetafo Legedadi', 'Sululta', 'Gelan', 'Holeta'],
  },
  'Shashemene': {
    coords: [7.2, 38.6],
    region: 'Oromia',
    subcities: ['Kuyera', 'Bishan Guracha'],
  },
  'Hawassa': {
    coords: [7.05, 38.4667],
    region: 'Sidama',
    subcities: ['Hayek Dare', 'Menaharia', 'Tabor', 'Misrak', 'Bahil Adarash', 'Addis Ketema', 'Hawella-Tula', 'Mehal'],
  },
  'Jigjiga': {
    coords: [9.35, 42.8],
    region: 'Somali',
    subcities: [],
  },
  'Mekelle': {
    coords: [13.4833, 39.4667],
    region: 'Tigray',
    subcities: ['Ayder', 'Hadinet', 'Quiha', 'Hawelti', 'Adi Haqi', 'Kedamay Weyane', 'Semien'],
  },
  'Adama': {
    coords: [8.5333, 39.2667],
    region: 'Oromia',
    subcities: ['Aba Geda', 'Bole', 'Boku', 'Dabe Soloke', 'Denbela', 'Lugo'],
  },
  'Dire Dawa': {
    coords: [9.6, 41.85],
    region: 'Federal Charter',
    subcities: ['Bolle', 'Yeka', 'Utaki', 'Wedati'],
  },
  'Gondar': {
    coords: [12.6, 37.4667],
    region: 'Amhara',
    subcities: ['Jantekel', 'Arada', 'Zobel', 'Fasil', 'Maraki', 'Azezo-Tsuda'],
  },
  'Bahir Dar': {
    coords: [11.5833, 37.3833],
    region: 'Amhara',
    subcities: ['Belay Zeleke', 'Dagmawi Menelik', 'Fasilo', 'Gish Abay', 'Atse Tewodros', 'Tana'],
  },
  'Jimma': {
    coords: [7.6667, 36.8333],
    region: 'Oromia',
    subcities: ['Jiren', 'Hirmata Mentina', 'Mendera Kochi', 'Ginjo Guduru', 'Bacho Bore', 'Bore'],
  },
  'Dessie': {
    coords: [11.1333, 39.6333],
    region: 'Amhara',
    subcities: [],
  },
  'Sodo': {
    coords: [6.9, 37.75],
    region: 'South Ethiopia',
    subcities: ['Mehal', 'Arada'],
  },
  'Bishoftu': {
    coords: [8.75, 38.9833],
    region: 'Oromia',
    subcities: [],
  },
  'Harar': {
    coords: [9.3, 42.1333],
    region: 'Harari',
    subcities: ['Aboker', 'Amir Nur', 'Hakim', 'Jenela', 'Shenkor', 'Sofi'],
  },
  'Arba Minch': {
    coords: [6.0333, 37.55],
    region: 'South Ethiopia',
    subcities: ['Secha', 'Sikela'],
  },
  'Hosaena': {
    coords: [7.55, 37.85],
    region: 'Central Ethiopia',
    subcities: [],
  },
};

// Convenience: just the coordinates, for the map + distance check.
export const CITY_COORDS: Record<string, [number, number]> = Object.fromEntries(
  Object.entries(ETHIOPIA_CITIES).map(([name, info]) => [name, info.coords])
) as Record<string, [number, number]>;

// Convenience: ordered city names for dropdowns.
export const CITY_NAMES: string[] = Object.keys(ETHIOPIA_CITIES);

// Subcities for a given city (empty array if unknown).
export function subcitiesFor(city?: string | null): string[] {
  if (!city) return [];
  return ETHIOPIA_CITIES[city]?.subcities ?? [];
}

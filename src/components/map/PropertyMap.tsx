'use client';
import { useEffect, useRef, useState } from 'react';

// Self-contained type so this component does not depend on the shared `Property`
// type. Note: there is no `city` column on properties — the city is derived from
// the `location` string (built as "specific, kebele, woreda, subcity, city").
type MapProperty = {
  id: string | number;
  title: string;
  price: number | string;
  currency: string;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  subcity?: string | null;
  type?: string | null;
};

// City centre coordinates for every city in the listing form's ETHIOPIA_CITIES
// list. Used to place an APPROXIMATE pin when a listing has no exact GPS pin.
const CITY_COORDS: Record<string, [number, number]> = {
  'Addis Ababa': [9.0192, 38.7525],
  'Dire Dawa': [9.5931, 41.8661],
  'Adama': [8.5400, 39.2700],
  'Gondar': [12.6000, 37.4667],
  'Hawassa': [7.0500, 38.4667],
  'Bahir Dar': [11.5742, 37.3614],
  'Mekelle': [13.4967, 39.4753],
  'Jimma': [7.6667, 36.8333],
  'Dessie': [11.1333, 39.6333],
  'Shashemene': [7.2000, 38.6000],
  'Bishoftu': [8.7500, 38.9833],
  'Harar': [9.3133, 42.1180],
};

// Derive a known city from the `location` string. The form builds location as
// "specific_location, kebele, woreda, subcity, city", so the city is usually the
// last comma-separated segment — but we scan all segments for a known city name
// to be safe against missing parts.
function cityFromLocation(location?: string | null): [number, number] | undefined {
  if (!location) return undefined;
  const parts = location.split(',').map(s => s.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    if (CITY_COORDS[parts[i]]) return CITY_COORDS[parts[i]];
  }
  return undefined;
}

interface Props { properties: MapProperty[]; center?: [number, number]; zoom?: number; }

export function PropertyMap({ properties, center = [9.0254, 38.7469], zoom = 12 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);
  const streetTileRef = useRef<any>(null);
  const satTileRef = useRef<any>(null);

  // Map view mode: 'street' (clean road map) or 'satellite' (aerial imagery).
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');

  // ── Place search (geocoding) ──
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  // Fly the map to a typed place name using the free OpenStreetMap Nominatim
  // geocoder. Drops a temporary marker at the result. No API key required.
  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchMsg(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=et&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const map = mapInstanceRef.current;
        if (map && !isNaN(lat) && !isNaN(lng)) {
          const L = (await import('leaflet')).default;
          map.setView([lat, lng], 15);
          if (searchMarkerRef.current) { map.removeLayer(searchMarkerRef.current); }
          searchMarkerRef.current = L.marker([lat, lng]).addTo(map)
            .bindPopup(`<b>${data[0].display_name?.split(',')[0] || q}</b>`).openPopup();
        }
      } else {
        setSearchMsg('No place found. Try a city or neighborhood name.');
      }
    } catch {
      setSearchMsg('Search failed. Please try again.');
    }
    setSearching(false);
  };

  // 1) Initialise the map once.
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !mapRef.current) return;
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);

      // Street tiles via CartoDB Voyager — cleaner and far more reliable than
      // OSM's throttled public servers (which caused the grey tile gaps).
      streetTileRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { attribution: '© OpenStreetMap, © CARTO', maxZoom: 20, subdomains: 'abcd' }
      );
      // Satellite imagery via Esri World Imagery — shows actual buildings/plots.
      satTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Imagery © Esri', maxZoom: 19 }
      );

      // Start in street mode.
      streetTileRef.current.addTo(map);
    })();

    return () => { cancelled = true; mapInstanceRef.current?.remove(); mapInstanceRef.current = null; };
  }, []);

  // Swap the active tile layer when the user toggles street/satellite.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const street = streetTileRef.current;
    const sat = satTileRef.current;
    if (!map || !street || !sat) return;
    if (mapMode === 'satellite') {
      if (map.hasLayer(street)) map.removeLayer(street);
      if (!map.hasLayer(sat)) sat.addTo(map);
    } else {
      if (map.hasLayer(sat)) map.removeLayer(sat);
      if (!map.hasLayer(street)) street.addTo(map);
    }
  }, [mapMode]);

  // 2) Draw / redraw markers whenever properties change.
  useEffect(() => {
    const draw = async () => {
      const map = mapInstanceRef.current;
      const layer = markerLayerRef.current;
      if (!map || !layer) return;
      const L = (await import('leaflet')).default;

      layer.clearLayers();
      const bounds: [number, number][] = [];

      properties.forEach(p => {
        let lat = p.latitude as number | null | undefined;
        let lng = p.longitude as number | null | undefined;
        let approximate = false;

        // Fall back to the city centre (derived from location) when no GPS pin.
        if (lat == null || lng == null) {
          const c = cityFromLocation(p.location);
          if (!c) return; // no coordinates and no recognizable city → skip
          [lat, lng] = c;
          approximate = true;
        }

        const price = typeof p.price === 'number' ? p.price.toLocaleString() : p.price;
        const landmark = p.location ? `<br><span style="color:#6b7280">${p.location}</span>` : '';
        const approxNote = approximate
          ? `<br><span style="color:#b45309;font-size:11px">📍 Approximate area${p.subcity ? ` — ${p.subcity}` : ''}</span>`
          : '';
        const viewLink = `<br><a href="/properties/${p.id}" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#006AFF;color:#fff;border-radius:8px;font-weight:700;text-decoration:none;font-size:12px">View Property →</a>`;

        const marker = L.marker([lat as number, lng as number], approximate ? { opacity: 0.7 } : undefined)
          .bindPopup(`<b>${p.title}</b><br>${price} ${p.currency}${landmark}${approxNote}${viewLink}`);
        layer.addLayer(marker);
        bounds.push([lat as number, lng as number]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    };
    draw();
  }, [properties]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Place search bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '4px 6px 4px 14px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
            placeholder="Search a place — e.g. Bole, Addis Ababa"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#1a1830', background: 'transparent', padding: '9px 0' }}
          />
          <button onClick={runSearch} disabled={searching}
            style={{ padding: '10px 20px', background: searching ? '#9ca3af' : '#006AFF', color: 'white', border: 'none', borderBottom: searching ? 'none' : '4px solid #0047b3', borderRadius: 9, fontWeight: 800, fontSize: 14, cursor: searching ? 'not-allowed' : 'pointer' }}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        {/* Street / Satellite toggle */}
        <div style={{ display: 'inline-flex', background: '#eef1f6', borderRadius: 11, padding: 3, border: '1px solid #e2e6ee' }}>
          {(['street', 'satellite'] as const).map(m => {
            const on = mapMode === m;
            return (
              <button key={m} onClick={() => setMapMode(m)}
                style={{ padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 800, background: on ? '#006AFF' : 'transparent', color: on ? '#fff' : '#5b6472', boxShadow: on ? '0 2px 6px rgba(0,106,255,0.35)' : 'none', transition: 'all 0.15s' }}>
                {m === 'street' ? 'Street' : 'Satellite'}
              </button>
            );
          })}
        </div>
      </div>
      {searchMsg && <div style={{ fontSize: 13, color: '#b45309' }}>{searchMsg}</div>}

      <div ref={mapRef} style={{ height: 'calc(100vh - 230px)', minHeight: 440, width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e5ee' }} />
    </div>
  );
}

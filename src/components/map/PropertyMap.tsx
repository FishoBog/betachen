'use client';
import { useEffect, useRef } from 'react';

// Self-contained type so this component does not depend on the shared `Property`
// type (which may not list city/subcity/location). Only the fields the map uses.
type MapProperty = {
  id: string | number;
  title: string;
  price: number | string;
  currency: string;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  city?: string | null;
  subcity?: string | null;
  type?: string | null;
};

// City centre coordinates for every city in the listing form's ETHIOPIA_CITIES
// list. Used to place an APPROXIMATE pin when a listing has no exact GPS
// coordinates, so the map is never empty just because owners skipped the pin.
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

interface Props { properties: MapProperty[]; center?: [number, number]; zoom?: number; }

export function PropertyMap({ properties, center = [9.0254, 38.7469], zoom = 12 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

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

      // Leaflet's default marker icons break under bundlers because the image
      // paths are resolved relative to the CSS. Point them at the CDN copies so
      // markers actually render.
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !mapRef.current) return;
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
    })();

    return () => { cancelled = true; mapInstanceRef.current?.remove(); mapInstanceRef.current = null; };
  }, []);

  // 2) Draw / redraw markers whenever properties change. The previous version
  // had `[]` deps and read `properties` once, so pins that arrived after mount
  // (which is always, since the page fetches async) were never drawn.
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

        // Fall back to the city centre when there is no exact GPS pin.
        if (lat == null || lng == null) {
          const c = p.city ? CITY_COORDS[p.city] : undefined;
          if (!c) return; // no coordinates and unknown city → can't place it
          [lat, lng] = c;
          approximate = true;
        }

        const price = typeof p.price === 'number' ? p.price.toLocaleString() : p.price;
        const landmark = p.location ? `<br><span style="color:#6b7280">${p.location}</span>` : '';
        const approxNote = approximate
          ? `<br><span style="color:#b45309;font-size:11px">📍 Approximate area${p.subcity ? ` — ${p.subcity}` : ''}</span>`
          : '';

        const marker = L.marker([lat as number, lng as number], approximate ? { opacity: 0.7 } : undefined)
          .bindPopup(`<b>${p.title}</b><br>${price} ${p.currency}${landmark}${approxNote}`);
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

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '16px' }} />;
}

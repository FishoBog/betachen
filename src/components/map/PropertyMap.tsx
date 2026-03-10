'use client';
import { useEffect, useRef } from 'react';
import type { Property } from '@/types';

interface Props { properties: Property[]; center?: [number, number]; zoom?: number; }

export function PropertyMap({ properties, center = [9.0254, 38.7469], zoom = 12 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const load = async () => {
      const L = (await import('leaflet')).default;
      // Add leaflet CSS via link element instead of import
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const map = L.map(mapRef.current!).setView(center, zoom);
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      properties.forEach(p => {
        if (!p.latitude || !p.longitude) return;
        L.marker([p.latitude, p.longitude])
          .bindPopup(`<b>${p.title}</b><br>${p.price.toLocaleString()} ${p.currency}`)
          .addTo(map);
      });
    };
    load();
    return () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null; };
  }, []);

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '16px' }} />;
}

'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

export function GPSPicker({ lat, lng, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { onChange(pos.coords.latitude, pos.coords.longitude); setLoading(false); },
      () => setLoading(false)
    );
  };

  return (
    <div className="space-y-3">
      <button type="button" onClick={getCurrentLocation} disabled={loading}
        className="btn-secondary flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4" />
        {loading ? 'Getting location...' : 'Use Current Location'}
      </button>
      <div className="grid grid-cols-2 gap-3">
        <input type="number" step="any" placeholder="Latitude" value={lat ?? ''}
          onChange={e => onChange(Number(e.target.value), lng ?? 0)} className="input-field text-sm" />
        <input type="number" step="any" placeholder="Longitude" value={lng ?? ''}
          onChange={e => onChange(lat ?? 0, Number(e.target.value))} className="input-field text-sm" />
      </div>
      {lat && lng && <p className="text-xs text-gray-500">📍 {lat.toFixed(6)}, {lng.toFixed(6)}</p>}
    </div>
  );
}

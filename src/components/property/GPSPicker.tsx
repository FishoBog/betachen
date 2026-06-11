'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  // The city the owner selected in the form (e.g. "Hawassa"). Used to sanity-check
  // a GPS reading: if the phone is >150km from the selected city, it's almost
  // certainly not at the property (e.g. listing a Hawassa house from Addis), so we
  // block the GPS capture and steer them to enter the location manually instead.
  city?: string | null;
}

// City centres for the distance check. Must stay in sync with the listing form's
// ETHIOPIA_CITIES list and the map's CITY_COORDS.
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

const MAX_KM_FROM_CITY = 150;

// Haversine distance in km between two lat/lng points.
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function GPSPicker({ lat, lng, onChange, city }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const getCurrentLocation = () => {
    setError(null);
    setOk(false);

    if (!('geolocation' in navigator)) {
      setError('Your browser does not support location. Please enter the location manually below.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const gLat = pos.coords.latitude;
        const gLng = pos.coords.longitude;

        // Distance check against the selected city.
        const c = city ? CITY_COORDS[city] : undefined;
        if (c) {
          const d = distanceKm(gLat, gLng, c[0], c[1]);
          if (d > MAX_KM_FROM_CITY) {
            setLoading(false);
            setError(
              `Your current location is about ${Math.round(d)} km from ${city}. ` +
                `If you're not at the property, please enter the location manually below ` +
                `or pick it on the map instead.`
            );
            return; // block: do not save a clearly-wrong GPS reading
          }
        }

        onChange(gLat, gLng);
        setOk(true);
        setLoading(false);
      },
      err => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission was denied. You can enter the location manually below.');
        } else {
          setError('Could not get your location. Please enter it manually below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <MapPin className="w-4 h-4" />
        {loading ? 'Getting location...' : "I'm at the property — use my location"}
      </button>

      {error && (
        <p className="text-xs" style={{ color: '#b45309' }}>⚠️ {error}</p>
      )}
      {ok && (
        <p className="text-xs" style={{ color: '#047857' }}>✓ Location captured.</p>
      )}

      <p className="text-xs text-gray-500">
        Not at the property? Enter the coordinates manually below (you can copy them from Google Maps).
      </p>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={lat ?? ''}
          onChange={e => onChange(Number(e.target.value), lng ?? 0)}
          className="input-field text-sm"
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={lng ?? ''}
          onChange={e => onChange(lat ?? 0, Number(e.target.value))}
          className="input-field text-sm"
        />
      </div>

      {lat && lng && (
        <p className="text-xs text-gray-500">📍 {lat.toFixed(6)}, {lng.toFixed(6)}</p>
      )}
    </div>
  );
}

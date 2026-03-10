'use client';
import type { LocationPrivacy } from '@/types';

interface Props {
  value: LocationPrivacy;
  onChange: (v: LocationPrivacy) => void;
}

const OPTIONS: { value: LocationPrivacy; label: string; desc: string }[] = [
  { value: 'exact', label: 'Exact Location', desc: 'Show precise location on map' },
  { value: 'approximate', label: 'Approximate', desc: 'Show nearby area (~500m)' },
  { value: 'area_only', label: 'Area Only', desc: 'Show subcity only' },
];

export function LocationPrivacyPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      {OPTIONS.map(opt => (
        <label key={opt.value} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
          <input type="radio" name="location_privacy" value={opt.value} checked={value === opt.value}
            onChange={() => onChange(opt.value)} className="mt-1" />
          <div>
            <div className="font-medium text-sm">{opt.label}</div>
            <div className="text-xs text-gray-500">{opt.desc}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

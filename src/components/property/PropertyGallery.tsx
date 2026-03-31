'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import type { PropertyImage } from '@/types';

const GOJO_IMAGE = 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/Gojo-bete.jpg';

export function PropertyGallery({ images }: { images: PropertyImage[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) return (
    <div style={{ height: 420, borderRadius: 20, overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 120, height: 100, borderRadius: 12, overflow: 'hidden', opacity: 0.5 }}>
        <img src={GOJO_IMAGE} alt="ቤታችን" style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>No photos yet</p>
    </div>
  );

  const prev = () => setCurrent(p => (p - 1 + images.length) % images.length);
  const next = () => setCurrent(p => (p + 1) % images.length);

  return (
    <>
      <div style={{ borderRadius: 20, overflow: 'hidden', background: '#f3f4f6' }}>
        {/* Main image */}
        <div style={{ position: 'relative', height: 420, cursor: 'pointer' }} onClick={() => setLightbox(true)}>
          <img src={images[current].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* Expand button */}
          <button onClick={e => { e.stopPropagation(); setLightbox(true); }} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Expand size={18} color="white" />
          </button>

          {/* Photo counter */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
            {current + 1} / {images.length}
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                <ChevronLeft size={22} color="#111827" />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                <ChevronRight size={22} color="#111827" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 10px', overflowX: 'auto', background: '#f9fafb' }}>
            {images.map((img, i) => (
              <div key={img.id} onClick={() => setCurrent(i)} style={{ flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === current ? '#E8431A' : 'transparent'}`, opacity: i === current ? 1 : 0.6, transition: 'all 0.15s' }}>
                <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLightbox(false)}>
          <button style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} color="white" />
          </button>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <img src={images[current].image_url} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
            {images.length > 1 && (
              <>
                <button onClick={prev} style={{ position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={24} color="white" />
                </button>
                <button onClick={next} style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={24} color="white" />
                </button>
              </>
            )}
          </div>
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: 14, fontWeight: 600 }}>
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
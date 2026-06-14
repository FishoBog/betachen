'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand, Image as ImageIcon } from 'lucide-react';
import type { PropertyImage } from '@/types';

const BETACHEN_IMAGE = 'https://pqmdujnwudahviyvljmg.supabase.co/storage/v1/object/public/property-images/Betachen-bete.jpg';

// Number of thumbnails shown before the "+N more" overlay tile (pisos.com style).
const THUMBS_VISIBLE = 5;

export function PropertyGallery({ images }: { images: PropertyImage[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) return (
    <div style={{ height: 440, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(160deg, #f7f6fb 0%, #efeef6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, border: '1px solid #e7e5ee' }}>
      <div style={{ width: 130, height: 108, borderRadius: 16, overflow: 'hidden', opacity: 0.55, boxShadow: '0 8px 24px rgba(26,24,48,0.12)' }}>
        <img src={BETACHEN_IMAGE} alt="ቤታችን" style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#8b8a9c', fontSize: 14, fontWeight: 600 }}>
        <ImageIcon size={16} /> No photos yet
      </div>
    </div>
  );

  const prev = () => setCurrent(p => (p - 1 + images.length) % images.length);
  const next = () => setCurrent(p => (p + 1) % images.length);

  const extraCount = images.length - THUMBS_VISIBLE;

  return (
    <>
      <div style={{ borderRadius: 20, overflow: 'hidden', background: '#1a1830', boxShadow: '0 4px 24px rgba(26,24,48,0.10)' }}>
        {/* Main image */}
        <div style={{ position: 'relative', height: 440, cursor: 'zoom-in', background: '#1a1830' }} onClick={() => setLightbox(true)}>
          <img src={images[current].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* Gradient scrim so overlay controls stay readable on any photo */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.34) 100%)', pointerEvents: 'none' }} />

          {/* Photo label, if the image carries one */}
          {(images[current] as any).label && (
            <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(255,255,255,0.92)', color: '#1a1830', fontSize: 12.5, fontWeight: 700, padding: '5px 13px', borderRadius: 8, backdropFilter: 'blur(6px)' }}>
              {(images[current] as any).label}
            </div>
          )}

          {/* Expand button — tactile */}
          <button onClick={e => { e.stopPropagation(); setLightbox(true); }} aria-label="View full screen" style={{ position: 'absolute', top: 16, right: 16, width: 42, height: 42, borderRadius: 12, background: 'rgba(26,24,48,0.55)', border: 'none', borderBottom: '3px solid rgba(0,0,0,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
            <Expand size={18} color="white" />
          </button>

          {/* Photo counter */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(26,24,48,0.62)', color: 'white', fontSize: 13, fontWeight: 700, padding: '5px 13px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>
            {current + 1} / {images.length}
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous photo" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', borderBottom: '3px solid rgba(0,0,0,0.16)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={22} color="#1a1830" />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }} aria-label="Next photo" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', borderBottom: '3px solid rgba(0,0,0,0.16)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={22} color="#1a1830" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px', overflowX: 'auto', background: '#15131f' }}>
            {images.slice(0, THUMBS_VISIBLE).map((img, i) => {
              const isLastVisible = i === THUMBS_VISIBLE - 1 && extraCount > 0;
              return (
                <div key={img.id} onClick={() => { if (isLastVisible) { setLightbox(true); } else { setCurrent(i); } }} style={{ position: 'relative', flexShrink: 0, width: 88, height: 64, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === current ? '#E8431A' : 'transparent'}`, opacity: i === current ? 1 : 0.7, transition: 'all 0.15s' }}>
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isLastVisible && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,24,48,0.66)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 800, backdropFilter: 'blur(2px)' }}>
                      +{extraCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,9,18,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLightbox(false)}>
          <button aria-label="Close" style={{ position: 'absolute', top: 20, right: 20, width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.14)', border: 'none', borderBottom: '3px solid rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} color="white" />
          </button>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <img src={images[current].image_url} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
            {images.length > 1 && (
              <>
                <button onClick={prev} aria-label="Previous photo" style={{ position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={24} color="white" />
                </button>
                <button onClick={next} aria-label="Next photo" style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

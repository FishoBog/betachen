'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PropertyImage } from '@/types';

export function PropertyGallery({ images }: { images: PropertyImage[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  if (!images.length) return <div className="h-80 bg-gray-100 rounded-2xl flex items-center justify-center text-6xl">🏠</div>;

  return (
    <>
      <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setLightbox(true)}>
        <Image src={images[current].image_url} alt="" fill className="object-cover" sizes="100vw" />
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); setCurrent(p => (p - 1 + images.length) % images.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={e => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white"><X className="w-8 h-8" /></button>
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image src={images[current].image_url} alt="" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </>
  );
}

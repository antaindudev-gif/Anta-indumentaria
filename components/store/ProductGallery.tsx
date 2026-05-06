"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const validImages = images.filter(Boolean);
  const [mainImage, setMainImage] = useState(validImages[0] || null);

  if (validImages.length === 0) {
    return (
      <div className="flex-1 relative w-full aspect-[3/4] bg-[#111111] overflow-hidden border border-white/5 flex flex-col items-center justify-center text-zinc-600">
        <ImageIcon className="w-12 h-12 opacity-50 mb-4" />
        <span className="font-mono text-xs uppercase tracking-widest text-center">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-[3/4] bg-[#111111] overflow-hidden border border-white/5 flex items-center justify-center">
        {mainImage && (
          <Image src={mainImage} alt={productName} fill className="object-cover" priority />
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`relative flex-shrink-0 w-24 h-32 bg-[#111111] overflow-hidden border transition-all ${
                mainImage === img ? "border-accent opacity-100" : "border-white/10 opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${productName} thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

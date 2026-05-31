"use client";

import Image from "next/image";
import { publicImageSrc } from "@/lib/image-src";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  activeIndex: number;
  fade: boolean;
  onSelect: (index: number) => void;
  onOpenLightbox?: (src: string) => void;
}

export default function ProductGallery({
  images,
  productName,
  activeIndex,
  fade,
  onSelect,
  onOpenLightbox,
}: ProductGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] w-full bg-gray-100 flex items-center justify-center text-gray-400">
        Нет изображения
      </div>
    );
  }

  const main = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100"
        onClick={() => onOpenLightbox?.(main)}
      >
        <Image
          src={publicImageSrc(main)}
          alt={productName}
          fill
          unoptimized
          className={`gallery-main-image object-cover ${fade ? "opacity-100" : "opacity-0"}`}
        />
      </button>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`relative h-16 w-14 shrink-0 overflow-hidden border-2 ${
                idx === activeIndex ? "border-black" : "border-transparent"
              }`}
            >
              <Image src={publicImageSrc(src)} alt="" fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

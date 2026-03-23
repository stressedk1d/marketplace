"use client";

import Image from "next/image";
import Link from "next/link";

const brands = [
  {
    slug: "recrent",
    name: "Recrent",
    image: "/images/celebrities/recrent.jpg",
    description: "Российский streetwear бренд",
  },
];

export default function BrandsPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container-main text-black">
        <h1 className="h32 mb-8">Знаменитости</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/celebrities/${brand.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative w-full aspect-square bg-[#d9d9d9] border border-black/10 overflow-hidden">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <p className="text16 font-semibold">{brand.name}</p>
                <p className="text16 text-gray-500 text-sm">{brand.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

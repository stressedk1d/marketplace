"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_featured: boolean;
}

interface BrandRow {
  id: number;
  name: string;
  slug: string;
}

export default function BrandCollectionsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(apiUrl("/brands"))
      .then((r) => r.json())
      .then((d: BrandRow[]) => {
        const b = Array.isArray(d) ? d.find((x) => x.slug === slug) : undefined;
        if (b) setBrandName(b.name);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    fetch(apiUrl(`/brands/${slug}/collections`))
      .then((r) => {
        if (r.status === 404) {
          setError("Бренд не найден");
          return [];
        }
        return r.json();
      })
      .then((d: Collection[]) =>
        setCollections(Array.isArray(d) ? d : [])
      )
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center mt-10 text20">Загрузка…</div>
    );
  }

  if (error) {
    return (
      <div className="container-main py-10">
        <p className="text20 mb-4">{error}</p>
        <Link href="/brands" className="underline text16">
          Все бренды
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 text-black">
      <div className="container-main">
        <button
          type="button"
          onClick={() => router.push("/brands")}
          className="text16 text-gray-600 hover:text-black mb-4"
        >
          ← Бренды
        </button>
        <h1 className="h32 mb-2">{brandName || slug}</h1>
        <p className="text16 text-gray-600 mb-10">Коллекции бренда</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="border border-black/15 bg-[#f3f3f3] p-6 hover:border-black transition block"
            >
              <h2 className="text20 font-semibold mb-2">{c.name}</h2>
              {c.description && (
                <p className="text16 text-gray-600 line-clamp-3">
                  {c.description}
                </p>
              )}
              {c.is_featured && (
                <span className="inline-block mt-3 text14 px-2 py-0.5 border border-black/30">
                  Избранное
                </span>
              )}
            </Link>
          ))}
        </div>
        {collections.length === 0 && (
          <p className="text16 text-gray-500">Коллекций пока нет.</p>
        )}
      </div>
    </div>
  );
}

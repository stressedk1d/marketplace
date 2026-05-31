import type { Metadata } from "next";
import { apiUrl } from "@/lib/api";

type ProductMeta = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  brand?: { name: string } | null;
};

async function fetchProduct(id: string): Promise<ProductMeta | null> {
  try {
    const res = await fetch(apiUrl(`/products/${id}`), { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) {
    return { title: "Товар не найден" };
  }

  const title = product.brand?.name
    ? `${product.name} — ${product.brand.name}`
    : product.name;
  const description =
    product.description?.slice(0, 160) ||
    `Купить ${product.name} на VogueWay. Цена от ${product.price.toLocaleString("ru-RU")} ₽.`;
  const image = product.image_url?.startsWith("/")
    ? product.image_url
    : product.image_url || "/images/brands/nike/Nike Air Zoom Pegasus 41.webp";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}

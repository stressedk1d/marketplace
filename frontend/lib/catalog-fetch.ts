import { apiUrl } from "@/lib/api";
import type {
  CatalogBrand,
  CatalogCollection,
  CatalogProductBrief,
  ProductListPayload,
} from "@/lib/catalog-types";

const REVALIDATE_SEC = 60;

async function catalogFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(apiUrl(path), {
      next: { revalidate: REVALIDATE_SEC },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchBrands(): Promise<CatalogBrand[]> {
  const data = await catalogFetch<CatalogBrand[]>("/brands", []);
  return Array.isArray(data) ? data : [];
}

export async function fetchCelebrityBrands(): Promise<CatalogBrand[]> {
  const data = await catalogFetch<CatalogBrand[]>("/brands?is_celebrity=true", []);
  return Array.isArray(data) ? data : [];
}

export async function fetchFeaturedCollectionsRetail(): Promise<
  CatalogCollection[]
> {
  const data = await catalogFetch<CatalogCollection[]>(
    "/collections?is_featured=true&exclude_celebrity_brands=true",
    []
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchTrendingProducts(
  limit = 8
): Promise<CatalogProductBrief[]> {
  const data = await catalogFetch<ProductListPayload>(
    `/products?limit=${limit}&sort=popular&offset=0`,
    { items: [], total: 0, limit, offset: 0 }
  );
  return Array.isArray(data.items) ? data.items.slice(0, limit) : [];
}

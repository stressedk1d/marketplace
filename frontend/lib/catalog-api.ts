import { apiUrl } from "@/lib/api";
import { CatalogParams, Product, ProductListResponse } from "@/app/catalog/types";

type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | null | undefined | QueryPrimitive[];

function toStableValues(value: QueryValue): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value
      .filter((v) => v !== null && v !== undefined && String(v) !== "")
      .map((v) => String(v))
      .sort();
  }
  const asString = String(value);
  return asString === "" ? [] : [asString];
}

export function buildCanonicalQuery(
  params: Record<string, QueryValue>
): string {
  const entries = Object.keys(params)
    .sort()
    .flatMap((key) => toStableValues(params[key]).map((value) => [key, value] as const));

  const query = new URLSearchParams();
  for (const [key, value] of entries) query.append(key, value);
  return query.toString();
}

export function buildCatalogQuery(params: CatalogParams): string {
  return buildCanonicalQuery({
    search: params.search,
    brand_slug: params.brand_slug,
    product_type: params.product_type,
    min_price: params.min_price,
    max_price: params.max_price,
    collection_id: params.collection_id,
    sort: params.sort,
    limit: params.limit,
    offset: params.offset,
  });
}

export async function getProducts(
  params: CatalogParams,
  signal?: AbortSignal
): Promise<ProductListResponse> {
  const query = buildCatalogQuery(params);
  const response = await fetch(apiUrl(`/products?${query}`), {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const detail =
      typeof errBody?.detail === "string"
        ? errBody.detail
        : "Не удалось загрузить каталог";
    throw new Error(detail);
  }

  return (await response.json()) as ProductListResponse;
}

export async function uploadVisualSearchImage(
  file: File
): Promise<{ product_ids: number[]; products: Product[] }> {
  const formData = new FormData();
  formData.append("file", file);

  const tryRequest = async (path: string) => {
    const response = await fetch(apiUrl(path), {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const detail =
        typeof errBody?.detail === "string"
          ? errBody.detail
          : "Не удалось выполнить поиск по фото";
      throw new Error(detail);
    }
    return response.json();
  };

  const hydrateProductsByIds = async (ids: number[]): Promise<Product[]> => {
    if (ids.length === 0) return [];
    const response = await fetch(apiUrl("/products?limit=200&offset=0"), {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as ProductListResponse;
    const idsSet = new Set(ids);
    return payload.items.filter((item) => idsSet.has(item.id));
  };

  try {
    const payload = await tryRequest("/search/by-image");
    if (payload && Array.isArray(payload.product_ids)) {
      const product_ids = payload.product_ids.map(Number).filter(Number.isFinite);
      const products = await hydrateProductsByIds(product_ids);
      return { product_ids, products };
    }
    if (Array.isArray(payload)) {
      const products = payload as Product[];
      return { product_ids: products.map((p) => p.id), products };
    }
    return { product_ids: [], products: [] };
  } catch {
    const fallbackPayload = await tryRequest("/ai/search");
    if (!Array.isArray(fallbackPayload)) {
      return { product_ids: [], products: [] };
    }
    const products = fallbackPayload as Product[];
    return { product_ids: products.map((p) => p.id), products };
  }
}

export interface CatalogBrand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  is_celebrity?: boolean;
}

export interface CatalogCollection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  brand_id: number | null;
  is_featured: boolean;
  brand: {
    id: number;
    name: string;
    slug: string;
    is_celebrity?: boolean;
  } | null;
}

export interface CatalogProductBrief {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  views_count?: number;
  brand?: { id: number; name: string; slug: string } | null;
  collection?: { id: number; name: string; slug: string } | null;
}

export interface ProductListPayload {
  items: CatalogProductBrief[];
  total: number;
  limit: number;
  offset: number;
}

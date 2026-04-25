export type ProductSort =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "popular";

export interface BrandBrief {
  id: number;
  name: string;
  slug: string;
  is_celebrity?: boolean;
}

export interface CollectionBrief {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  product_type: string;
  category_id?: number | null;
  brand?: BrandBrief | null;
  collection?: CollectionBrief | null;
}

export interface FacetBrand {
  slug: string;
  count: number;
  selected: boolean;
}

export interface FacetProductType {
  value: string;
  count: number;
  selected: boolean;
}

export interface FacetPriceRange {
  min: number;
  max: number | null;
  count: number;
  selected: boolean;
}

export interface ProductFacets {
  brands: FacetBrand[];
  product_types: FacetProductType[];
  price_ranges: FacetPriceRange[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
  facets: ProductFacets;
}

export interface CatalogFilters {
  search: string;
  brand_slug: string;
  product_type: string;
  min_price: string;
  max_price: string;
  collection_id: string;
  sort: ProductSort;
}

export interface CatalogParams extends CatalogFilters {
  limit: number;
  offset: number;
}

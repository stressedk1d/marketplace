"use client";

import { productTypeLabel, brandDisplayName } from "@/lib/labels";
import { formatPrice } from "@/lib/format";
import { ui } from "@/app/catalog/ui/classes";

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  search: string;
  brandSlug: string;
  brandName?: string;
  productType: string;
  minPrice: string;
  maxPrice: string;
  collectionId?: string;
  collectionName?: string;
  inStockOnly?: boolean;
  minRating?: string;
  onClearSearch: () => void;
  onClearBrand: () => void;
  onClearProductType: () => void;
  onClearCollection?: () => void;
  onClearPrice: () => void;
  onClearInStock?: () => void;
  onClearMinRating?: () => void;
}

export function buildActiveFilterChips(props: ActiveFilterChipsProps): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (props.search.trim()) {
    chips.push({
      key: "search",
      label: `Поиск: «${props.search.trim()}»`,
      onRemove: props.onClearSearch,
    });
  }
  if (props.brandSlug) {
    chips.push({
      key: "brand",
      label: `Бренд: ${brandDisplayName(props.brandSlug, props.brandName)}`,
      onRemove: props.onClearBrand,
    });
  }
  if (props.productType) {
    chips.push({
      key: "type",
      label: `Тип: ${productTypeLabel(props.productType)}`,
      onRemove: props.onClearProductType,
    });
  }
  if (props.collectionId && props.onClearCollection) {
    chips.push({
      key: "collection",
      label: `Коллекция: ${props.collectionName ?? `#${props.collectionId}`}`,
      onRemove: props.onClearCollection,
    });
  }
  if (props.minPrice || props.maxPrice) {
    const parts: string[] = [];
    if (props.minPrice) parts.push(`от ${formatPrice(Number(props.minPrice))}`);
    if (props.maxPrice) parts.push(`до ${formatPrice(Number(props.maxPrice))}`);
    chips.push({
      key: "price",
      label: `Цена: ${parts.join(" ")}`,
      onRemove: props.onClearPrice,
    });
  }
  if (props.inStockOnly && props.onClearInStock) {
    chips.push({
      key: "in_stock",
      label: "Только в наличии",
      onRemove: props.onClearInStock,
    });
  }
  if (props.minRating && props.onClearMinRating) {
    chips.push({
      key: "min_rating",
      label: `Рейтинг ${props.minRating}+`,
      onRemove: props.onClearMinRating,
    });
  }
  return chips;
}

export default function ActiveFilterChips({ chips }: { chips: ActiveFilterChip[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className={`inline-flex items-center gap-1.5 ${ui.chip.base} ${ui.transition.base} hover:border-black/30`}
          aria-label={`Убрать фильтр: ${chip.label}`}
        >
          <span>{chip.label}</span>
          <span className="text-gray-400" aria-hidden>
            ×
          </span>
        </button>
      ))}
    </div>
  );
}

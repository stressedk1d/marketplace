"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductFacets } from "@/app/catalog/types";
import { ui } from "@/app/catalog/ui/classes";
import { tokens } from "@/app/catalog/ui/tokens";
import { productTypeLabel, brandDisplayName } from "@/lib/labels";
import { formatPrice } from "@/lib/format";
import { apiUrl } from "@/lib/api";

export interface CollectionOption {
  id: number;
  name: string;
  slug: string;
}

interface FiltersPanelProps {
  searchDefaultValue: string;
  searchInputKey: string;
  brandSlug: string;
  productType: string;
  minPrice: string;
  maxPrice: string;
  collectionId: string;
  inStockOnly: boolean;
  minRating: string;
  facets: ProductFacets;
  onSearchChange: (value: string) => void;
  onBrandChange: (slug: string) => void;
  onProductTypeChange: (value: string) => void;
  onCollectionChange: (id: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onPriceRangePick: (min: string, max: string) => void;
  onInStockOnlyChange: (value: boolean) => void;
  onMinRatingChange: (value: string) => void;
  onReset: () => void;
}

function formatRange(max: number | null): string {
  if (max === null) return "и выше";
  return formatPrice(max);
}

export default function FiltersPanel({
  searchDefaultValue,
  searchInputKey,
  brandSlug,
  productType,
  minPrice,
  maxPrice,
  collectionId,
  inStockOnly,
  minRating,
  facets,
  onSearchChange,
  onBrandChange,
  onProductTypeChange,
  onCollectionChange,
  onMinPriceChange,
  onMaxPriceChange,
  onPriceRangePick,
  onInStockOnlyChange,
  onMinRatingChange,
  onReset,
}: FiltersPanelProps) {
  const [openSearch, setOpenSearch] = useState(true);
  const [openBrand, setOpenBrand] = useState(true);
  const [openType, setOpenType] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openCollection, setOpenCollection] = useState(true);
  const [openExtra, setOpenExtra] = useState(true);
  const [allCollections, setAllCollections] = useState<CollectionOption[]>([]);

  useEffect(() => {
    const path = brandSlug
      ? `/brands/${encodeURIComponent(brandSlug)}/collections`
      : "/collections";
    fetch(apiUrl(path))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAllCollections(
          Array.isArray(data)
            ? data.map((c: CollectionOption) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
              }))
            : []
        );
      })
      .catch(() => setAllCollections([]));
  }, [brandSlug]);

  const visibleCollections = useMemo(() => allCollections, [allCollections]);

  const panelClass = ui.card.base;
  const sectionBtn =
    `flex w-full items-center justify-between ${tokens.radius.md} px-2 py-2 text-left text15 font-semibold ${ui.transition.base} ${tokens.color.hoverSubtle}`;
  const inputClass = ui.input.base;

  const sectionWrap = (open: boolean, active: boolean) =>
    `${tokens.radius.lg} border p-2 transition-[border-color,background-color] duration-200 ${
      active
        ? `${tokens.color.borderHover} ${tokens.color.surfaceSubtle}`
        : `${tokens.color.borderDefault} ${tokens.color.surfaceBase}`
    } ${open ? "pb-2" : "pb-1"}`;

  const bodyClass = (open: boolean) =>
    `grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
    }`;

  return (
    <div className={`flex h-full flex-col gap-4 p-4 ${panelClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text16 font-semibold">Фильтры</h2>
        <button
          type="button"
          onClick={onReset}
          className={`${ui.button.secondary} px-3 py-1.5 text13 text-gray-600`}
        >
          Сбросить
        </button>
      </div>

      <section className={sectionWrap(openSearch, Boolean(searchDefaultValue))}>
        <button type="button" className={sectionBtn} onClick={() => setOpenSearch((v) => !v)}>
          <span>Поиск</span>
          <span className="text-xs text-gray-400">{openSearch ? "−" : "+"}</span>
        </button>
        <div className={bodyClass(openSearch)}>
          <div className="min-h-0 px-2 pb-2 pt-1">
            <input
              key={searchInputKey}
              defaultValue={searchDefaultValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Название или описание"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={sectionWrap(openBrand, Boolean(brandSlug))}>
        <button type="button" className={sectionBtn} onClick={() => setOpenBrand((v) => !v)}>
          <span>Бренды</span>
          <span className="text-xs text-gray-400">{openBrand ? "−" : "+"}</span>
        </button>
        <div className={bodyClass(openBrand)}>
          <div className="flex max-h-56 min-h-0 flex-col gap-2 overflow-auto px-2 pb-2 pt-1">
            {facets.brands.map((brand) => (
              <button
                key={brand.slug}
                type="button"
                onClick={() => onBrandChange(brand.selected ? "" : brand.slug)}
                className={`${ui.selectable.base} ${
                  brand.selected ? ui.selectable.active : ui.selectable.idle
                }`}
              >
                <span className="truncate">{brandDisplayName(brand.slug, brand.name)}</span>
                <span className="text12 opacity-80">{brand.count}</span>
              </button>
            ))}
          </div>
        </div>
        {brandSlug && !facets.brands.some((b) => b.slug === brandSlug) && (
          <p className="px-2 pb-2 text12 text-gray-500">
            Выбранный бренд: {brandDisplayName(brandSlug)}
          </p>
        )}
      </section>

      <section className={sectionWrap(openType, Boolean(productType))}>
        <button type="button" className={sectionBtn} onClick={() => setOpenType((v) => !v)}>
          <span>Тип товара</span>
          <span className="text-xs text-gray-400">{openType ? "−" : "+"}</span>
        </button>
        <div className={bodyClass(openType)}>
          <div className="min-h-0 flex flex-col gap-2 px-2 pb-2 pt-1">
            {facets.product_types.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => onProductTypeChange(type.selected ? "" : type.value)}
                className={`${ui.selectable.base} ${
                  type.selected ? ui.selectable.active : ui.selectable.idle
                }`}
              >
                <span>{productTypeLabel(type.value)}</span>
                <span className="text12 opacity-80">{type.count}</span>
              </button>
            ))}
          </div>
        </div>
        {productType && !facets.product_types.some((t) => t.value === productType) && (
          <p className="px-2 pb-2 text12 text-gray-500">
            Выбран тип: {productTypeLabel(productType)}
          </p>
        )}
      </section>

      {visibleCollections.length > 0 && (
        <section className={sectionWrap(openCollection, Boolean(collectionId))}>
          <button
            type="button"
            className={sectionBtn}
            onClick={() => setOpenCollection((v) => !v)}
          >
            <span>Коллекции</span>
            <span className="text-xs text-gray-400">{openCollection ? "−" : "+"}</span>
          </button>
          <div className={bodyClass(openCollection)}>
            <div className="flex max-h-48 min-h-0 flex-col gap-2 overflow-auto px-2 pb-2 pt-1">
              <button
                type="button"
                onClick={() => onCollectionChange("")}
                className={`${ui.selectable.base} ${
                  !collectionId ? ui.selectable.active : ui.selectable.idle
                }`}
              >
                <span>Все коллекции</span>
              </button>
              {visibleCollections.map((col) => {
                const selected = collectionId === String(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onCollectionChange(selected ? "" : String(col.id))}
                    className={`${ui.selectable.base} ${
                      selected ? ui.selectable.active : ui.selectable.idle
                    }`}
                  >
                    <span className="truncate text-left">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className={sectionWrap(openPrice, Boolean(minPrice || maxPrice))}>
        <button type="button" className={sectionBtn} onClick={() => setOpenPrice((v) => !v)}>
          <span>Цена</span>
          <span className="text-xs text-gray-400">{openPrice ? "−" : "+"}</span>
        </button>
        <div className={bodyClass(openPrice)}>
          <div className="min-h-0 space-y-3 px-2 pb-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                placeholder="От"
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                placeholder="До"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              {facets.price_ranges.map((range) => (
                <button
                  key={`${range.min}-${range.max ?? "inf"}`}
                  type="button"
                  onClick={() =>
                    onPriceRangePick(
                      range.selected ? "" : String(range.min),
                      range.selected ? "" : range.max === null ? "" : String(range.max)
                    )
                  }
                  className={`${ui.selectable.base} ${
                    range.selected ? ui.selectable.active : ui.selectable.idle
                  }`}
                >
                  <span>
                    {formatPrice(range.min)} – {formatRange(range.max)}
                  </span>
                  <span className="text12 opacity-80">{range.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={sectionWrap(openExtra, inStockOnly || Boolean(minRating))}>
        <button type="button" className={sectionBtn} onClick={() => setOpenExtra((v) => !v)}>
          <span>Наличие и рейтинг</span>
          <span className="text-xs text-gray-400">{openExtra ? "−" : "+"}</span>
        </button>
        <div className={bodyClass(openExtra)}>
          <div className="min-h-0 space-y-3 px-2 pb-2 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text15">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockOnlyChange(e.target.checked)}
                className="h-4 w-4 rounded border-black/30"
              />
              <span>Только в наличии</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text15">
              <input
                type="checkbox"
                checked={minRating === "4"}
                onChange={(e) => onMinRatingChange(e.target.checked ? "4" : "")}
                className="h-4 w-4 rounded border-black/30"
              />
              <span>Рейтинг 4+</span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}

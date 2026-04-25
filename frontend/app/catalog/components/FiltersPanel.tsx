"use client";

import { useState } from "react";
import { ProductFacets } from "@/app/catalog/types";
import { ui } from "@/app/catalog/ui/classes";
import { tokens } from "@/app/catalog/ui/tokens";

interface FiltersPanelProps {
  searchDefaultValue: string;
  searchInputKey: string;
  brandSlug: string;
  productType: string;
  minPrice: string;
  maxPrice: string;
  collectionId: string;
  facets: ProductFacets;
  onSearchChange: (value: string) => void;
  onBrandChange: (slug: string) => void;
  onProductTypeChange: (value: string) => void;
  onCollectionChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onPriceRangePick: (min: string, max: string) => void;
  onReset: () => void;
}

function formatRange(max: number | null): string {
  if (max === null) return "и выше";
  return `${max} ₽`;
}

export default function FiltersPanel({
  searchDefaultValue,
  searchInputKey,
  brandSlug,
  productType,
  minPrice,
  maxPrice,
  collectionId,
  facets,
  onSearchChange,
  onBrandChange,
  onProductTypeChange,
  onCollectionChange,
  onMinPriceChange,
  onMaxPriceChange,
  onPriceRangePick,
  onReset,
}: FiltersPanelProps) {
  // UI governed by design system (tokens.ts + classes.ts)
  const [openSearch, setOpenSearch] = useState(true);
  const [openBrand, setOpenBrand] = useState(true);
  const [openType, setOpenType] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);

  const panelClass = ui.card.base;
  const sectionBtn =
    `flex w-full items-center justify-between ${tokens.radius.md} px-2 py-2 text-left text15 font-semibold ${ui.transition.base} ${tokens.color.hoverSubtle}`;
  const inputClass = ui.input.base;

  const chips = [
    brandSlug ? `Бренд: ${brandSlug}` : "",
    productType ? `Тип: ${productType}` : "",
    minPrice || maxPrice
      ? `Цена: ${minPrice ? `от ${minPrice}` : "от 0"} ${maxPrice ? `до ${maxPrice}` : "и выше"}`
      : "",
  ].filter(Boolean);

  const sectionWrap = (open: boolean, active: boolean) =>
    `${tokens.radius.lg} border p-2 ${ui.transition.base} ${
      active
        ? `${tokens.color.borderHover} ${tokens.color.surfaceSubtle}`
        : `${tokens.color.borderDefault} ${tokens.color.surfaceBase}`
    } ${open ? "pb-2" : "pb-1"}`;

  const bodyClass = (open: boolean) =>
    `grid overflow-hidden ${ui.transition.base} ${
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
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className={ui.chip.base}
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      <section className={sectionWrap(openSearch, Boolean(searchDefaultValue || collectionId))}>
        <button type="button" className={sectionBtn} onClick={() => setOpenSearch((v) => !v)}>
          <span>Поиск</span>
          <span className="text-xs text-gray-400">{openSearch ? "−" : "+"}</span>
        </button>
        <div className={bodyClass(openSearch)}>
          <div className="min-h-0 space-y-3 px-2 pb-2 pt-1">
            <input
              key={searchInputKey}
              defaultValue={searchDefaultValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Название или описание"
              className={inputClass}
            />
            <input
              value={collectionId}
              onChange={(e) => onCollectionChange(e.target.value)}
              placeholder="Collection ID"
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
                  brand.selected
                    ? ui.selectable.active
                    : ui.selectable.idle
                }`}
              >
                <span className="truncate">{brand.slug}</span>
                <span className="text12 opacity-80">{brand.count}</span>
              </button>
            ))}
          </div>
        </div>
        {brandSlug && !facets.brands.some((b) => b.slug === brandSlug) && (
          <p className="px-2 pb-2 text12 text-gray-500">Выбранный бренд: {brandSlug}</p>
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
                  type.selected
                    ? ui.selectable.active
                    : ui.selectable.idle
                }`}
              >
                <span>{type.value}</span>
                <span className="text12 opacity-80">{type.count}</span>
              </button>
            ))}
          </div>
        </div>
        {productType && !facets.product_types.some((t) => t.value === productType) && (
          <p className="px-2 pb-2 text12 text-gray-500">Выбран тип: {productType}</p>
        )}
      </section>

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
                    range.selected
                      ? ui.selectable.active
                      : ui.selectable.idle
                  }`}
                >
                  <span>
                    {range.min} ₽ - {formatRange(range.max)}
                  </span>
                  <span className="text12 opacity-80">{range.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

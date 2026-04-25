"use client";

import { ProductSort } from "@/app/catalog/types";
import { ui } from "@/app/catalog/ui/classes";
import { tokens } from "@/app/catalog/ui/tokens";

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "name_asc", label: "Название А→Я" },
  { value: "name_desc", label: "Название Я→А" },
  { value: "price_asc", label: "Цена: по возрастанию" },
  { value: "price_desc", label: "Цена: по убыванию" },
  { value: "popular", label: "Популярные" },
];

interface SortSelectorProps {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
}

export default function SortSelector({ value, onChange }: SortSelectorProps) {
  // UI governed by design system (tokens.ts + classes.ts)
  const containerClass = `inline-flex flex-wrap gap-2 p-1.5 ${ui.card.base}`;
  return (
    <div className={containerClass}>
      {SORT_OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`${tokens.radius.md} px-3 py-2 text-sm ${ui.transition.base} ${
              active
                ? ui.pill.pageActive
                : `text-gray-600 ${tokens.color.hoverSubtle} hover:text-black`
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

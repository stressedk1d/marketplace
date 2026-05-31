"use client";

import { formatPrice } from "@/lib/format";
import type { ProductVariant } from "@/app/catalog/types";

interface ProductBuyBoxProps {
  price: number;
  variants: ProductVariant[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  onAddToCart: () => void;
  adding: boolean;
  isShoes?: boolean;
  onOpenSizeGuide?: () => void;
}

export default function ProductBuyBox({
  price,
  variants,
  selectedSize,
  onSelectSize,
  onAddToCart,
  adding,
  isShoes,
  onOpenSizeGuide,
}: ProductBuyBoxProps) {
  const hasVariants = variants.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-2xl font-bold">{formatPrice(price)}</p>

      {hasVariants && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text16 font-medium">Размер</p>
            {isShoes && onOpenSizeGuide && (
              <button type="button" onClick={onOpenSizeGuide} className="text14 underline text-gray-600">
                Таблица размеров
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stock <= 0;
              const selected = selectedSize === v.size;
              return (
                <button
                  key={v.size}
                  type="button"
                  disabled={out}
                  onClick={() => onSelectSize(v.size)}
                  className={`min-w-[2.75rem] rounded border px-3 py-2 text15 ${
                    out
                      ? "cursor-not-allowed border-gray-200 text-gray-300 line-through"
                      : selected
                        ? "border-black bg-black text-white"
                        : "border-black/20 hover:border-black"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onAddToCart}
        disabled={adding}
        className="w-full rounded-md bg-black py-3 text16 font-semibold text-white hover:bg-black/90 disabled:opacity-50"
      >
        {adding ? "Добавляем..." : "В корзину"}
      </button>
    </div>
  );
}

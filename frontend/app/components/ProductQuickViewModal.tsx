"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch, apiUrl } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/lib/ToastContext";
import { useI18n } from "@/lib/I18nContext";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { formatPrice } from "@/lib/format";
import { publicImageSrc } from "@/lib/image-src";
import type { Product, ProductVariant } from "@/app/catalog/types";

interface ProductQuickViewModalProps {
  productId: number | null;
  onClose: () => void;
}

export default function ProductQuickViewModal({ productId, onClose }: ProductQuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, !!productId, onClose);
  const { refreshCart, bumpCart } = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setSelectedSize(null);
      return;
    }
    setLoading(true);
    fetch(apiUrl(`/products/${productId}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Product | null) => {
        setProduct(data);
        setSelectedSize(null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (productId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [productId, onClose]);

  const variants: ProductVariant[] = product?.variants ?? [];
  const hasVariants = variants.length > 0;

  const addToCart = useCallback(async () => {
    if (!product) return;
    if (hasVariants && !selectedSize) {
      showToast("Выберите размер", "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Войдите в аккаунт, чтобы добавить товар в корзину", "error");
      return;
    }
    setAdding(true);
    bumpCart(1);
    try {
      const body: Record<string, unknown> = { product_id: product.id, quantity: 1 };
      if (selectedSize) body.size = selectedSize;
      const res = await apiFetch(apiUrl("/cart/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("Товар добавлен в корзину", "success");
        void refreshCart();
        onClose();
      } else {
        bumpCart(-1);
        const data = await res.json().catch(() => ({}));
        showToast(typeof data.detail === "string" ? data.detail : "Не удалось добавить", "error");
      }
    } catch (err) {
      bumpCart(-1);
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        showToast("Сессия истекла, войдите снова", "error");
      } else {
        showToast("Не удалось добавить товар в корзину", "error");
      }
    } finally {
      setAdding(false);
    }
  }, [product, hasVariants, selectedSize, showToast, refreshCart, bumpCart, onClose]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-lg rounded-t-xl border border-black/15 bg-white p-5 shadow-xl sm:rounded-xl dark:border-white/15 dark:bg-neutral-900"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text18 font-semibold">{t("quickView")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-gray-500 hover:text-black dark:hover:text-white"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {loading && <p className="py-8 text-center text15 text-gray-500">Загрузка...</p>}

        {!loading && !product && (
          <p className="py-8 text-center text15 text-red-600">Товар не найден</p>
        )}

        {!loading && product && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={publicImageSrc(product.image_url)}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                {product.brand && (
                  <p className="text12 uppercase tracking-wide text-gray-500">{product.brand.name}</p>
                )}
                <Link href={`/product/${product.id}`} className="text16 font-semibold hover:underline" onClick={onClose}>
                  {product.name}
                </Link>
                <p className="mt-1 text18 font-bold">{formatPrice(product.price)}</p>
              </div>
            </div>

            {hasVariants && (
              <div>
                <p className="mb-2 text14 font-medium">Размер</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const out = v.stock <= 0;
                    const selected = selectedSize === v.size;
                    return (
                      <button
                        key={v.size}
                        type="button"
                        disabled={out}
                        onClick={() => setSelectedSize(v.size)}
                        className={`min-w-[2.5rem] rounded border px-3 py-1.5 text14 ${
                          out
                            ? "cursor-not-allowed border-gray-200 text-gray-300 line-through"
                            : selected
                              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                              : "border-black/20 hover:border-black dark:border-white/30"
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
              onClick={() => void addToCart()}
              disabled={adding}
              className="w-full rounded-md bg-black py-2.5 text16 font-medium text-white hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {adding ? "..." : t("addToCart")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

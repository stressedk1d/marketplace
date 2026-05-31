"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl, apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/CartContext";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { publicImageSrc } from "@/lib/image-src";
import { pageCtaPrimary } from "@/lib/page-classes";
import { pageOutlineButton } from "@/lib/ui";

interface CartLine {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  size?: string;
}

interface MiniCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MiniCartDrawer({ open, onClose }: MiniCartDrawerProps) {
  const { refreshCart } = useCart();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  useFocusTrap(panelRef, open, onClose);

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(apiUrl("/cart"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
      else setItems([]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, load]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Корзина">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <aside
        ref={panelRef}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-neutral-200/90 bg-white shadow-2xl animate-sheet-in-right dark:border-neutral-700 dark:bg-[var(--surface)]"
      >
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-700">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Корзина {count > 0 ? `(${count})` : ""}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-xl transition hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-neutral-500">Загрузка...</p>
          ) : items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">Корзина пуста</p>
              <Link href="/catalog" onClick={onClose} className={`${pageCtaPrimary} !text-sm`}>
                В каталог
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/30"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                    <Image
                      src={publicImageSrc(item.image_url)}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.product_id}`}
                      onClick={onClose}
                      className="line-clamp-2 text-sm font-medium transition hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-neutral-500">
                      {item.quantity} × {formatPrice(item.price)}
                      {item.size ? ` · ${item.size}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-neutral-200/80 px-5 py-4 dark:border-neutral-700">
            <div className="flex justify-between text-base font-semibold">
              <span>Итого</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              className={`block text-center ${pageOutlineButton} !text-sm`}
            >
              Открыть корзину
            </Link>
            <Link
              href="/checkout"
              onClick={() => {
                onClose();
                void refreshCart();
              }}
              className={`block text-center ${pageCtaPrimary} !text-sm`}
            >
              Оформить заказ
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

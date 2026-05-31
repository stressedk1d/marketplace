"use client";

import { useEffect } from "react";

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  isShoes: boolean;
}

export default function SizeGuideModal({ open, onClose, isShoes }: SizeGuideModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-black/20 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="size-guide-title" className="text20 font-semibold">
            Таблица размеров
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-black/20 text-xl hover:bg-gray-50"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        {isShoes ? (
          <table className="w-full border-collapse text16">
            <thead>
              <tr className="border-b border-black/20 bg-gray-50">
                <th className="px-3 py-2 text-left">EU</th>
                <th className="px-3 py-2 text-left">Длина стопы, см</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["38", "24.0"],
                ["39", "24.5"],
                ["40", "25.0"],
                ["41", "25.5"],
                ["42", "26.0"],
                ["43", "26.5"],
                ["44", "27.0"],
              ].map(([eu, cm]) => (
                <tr key={eu} className="border-b border-black/10">
                  <td className="px-3 py-2 font-medium">{eu}</td>
                  <td className="px-3 py-2 text-gray-600">{cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse text16">
            <thead>
              <tr className="border-b border-black/20 bg-gray-50">
                <th className="px-3 py-2 text-left">Размер</th>
                <th className="px-3 py-2 text-left">Грудь, см</th>
                <th className="px-3 py-2 text-left">Талия, см</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["XS", "84–88", "66–70"],
                ["S", "88–92", "70–74"],
                ["M", "92–96", "74–78"],
                ["L", "96–100", "78–82"],
                ["XL", "100–104", "82–86"],
                ["XXL", "104–108", "86–90"],
              ].map(([size, chest, waist]) => (
                <tr key={size} className="border-b border-black/10">
                  <td className="px-3 py-2 font-medium">{size}</td>
                  <td className="px-3 py-2 text-gray-600">{chest}</td>
                  <td className="px-3 py-2 text-gray-600">{waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-4 text14 text-gray-500">
          Если размер на границе — берите больший. При сомнениях напишите в поддержку.
        </p>
      </div>
    </div>
  );
}

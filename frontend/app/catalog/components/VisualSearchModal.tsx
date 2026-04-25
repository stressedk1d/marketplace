"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ui } from "@/app/catalog/ui/classes";
import { tokens } from "@/app/catalog/ui/tokens";

interface VisualSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSearch?: (file: File) => Promise<{ product_ids: number[] }>;
}

export default function VisualSearchModal({ open, onClose, onSearch }: VisualSearchModalProps) {
  // UI governed by design system (tokens.ts + classes.ts)
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const resetState = () => {
    setFile(null);
    setIsDragging(false);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const closeWithAnimation = () => {
    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsClosing(false);
      resetState();
      onClose();
    }, 220);
  };

  if (!open && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Поиск по фото">
      <button
        type="button"
        onClick={closeWithAnimation}
        aria-label="Закрыть поиск по фото"
        className={`${ui.overlay.backdrop} transition-opacity ${tokens.transition.base} ${tokens.transition.easing} ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        ref={dialogRef}
        className={`${ui.card.modal} ${
          isClosing ? "translate-y-4 opacity-0 sm:-translate-y-[46%]" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text20 font-semibold tracking-tight">Поиск по фото</h2>
            <p className="mt-1 text14 text-gray-500">
              Загрузите фото товара, и мы найдём похожие
            </p>
          </div>
          <button
            type="button"
            onClick={closeWithAnimation}
            className={ui.button.secondary}
          >
            Закрыть
          </button>
        </div>

        <label
          className={`group relative block cursor-pointer overflow-hidden ${tokens.radius.lg} border-2 border-dashed p-6 text-center ${ui.transition.base} ${
            isDragging
              ? `${tokens.color.borderHover} ${tokens.color.surfaceSubtle}`
              : `${tokens.color.borderDefault} bg-gray-50/40 ${tokens.color.hoverSubtle}`
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) {
              setErrorMessage(null);
              setFile(dropped);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              setErrorMessage(null);
              setFile(e.target.files?.[0] ?? null);
            }}
          />
          {file ? (
            <div className={ui.transition.base}>
              <p className="text16 font-medium">Изображение добавлено</p>
              <p className="mt-1 text13 text-gray-500">Можно заменить, перетащив другое фото</p>
            </div>
          ) : (
            <div className={ui.transition.base}>
              <p className="text16 font-medium">Перетащите изображение сюда</p>
              <p className="mt-1 text13 text-gray-500">или нажмите, чтобы выбрать файл</p>
            </div>
          )}
        </label>

        {previewUrl && (
          <div className={`mt-4 overflow-hidden ${tokens.radius.lg} border ${tokens.color.borderDefault} ${tokens.color.surfaceSubtle} ${tokens.shadow.sm} ${ui.transition.base}`}>
            <div className={`relative h-56 w-full transition-opacity ${tokens.transition.base} ${tokens.transition.easing}`}>
              <Image
                src={previewUrl}
                alt="Предпросмотр загруженного изображения"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        )}
        {!previewUrl && (
          <p className="mt-4 text-center text13 text-gray-500">
            Загрузите фото товара, и мы найдём похожие
          </p>
        )}
        {isLoading && (
          <div className={`mt-4 ${tokens.radius.lg} border ${tokens.color.borderDefault} ${tokens.color.surfaceSubtle} px-4 py-3 text-center`}>
            <div className="relative inline-flex items-center gap-2 text14 text-gray-700">
              <span className={ui.icon.spinnerDark} />
              Ищем похожие товары...
            </div>
          </div>
        )}
        {errorMessage && (
          <p className={`mt-4 ${ui.state.alertError}`}>
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setErrorMessage(null);
            }}
            disabled={!file}
            className={`${ui.button.secondary} text-gray-600 disabled:opacity-40`}
          >
            Удалить
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`${ui.button.secondary} disabled:opacity-40`}
          >
            Загрузить другое
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!file) return;
              setErrorMessage(null);
              setIsLoading(true);
              try {
                const result = await onSearch?.(file);
                if (!result || result.product_ids.length === 0) {
                  setErrorMessage("Не найдено похожих товаров");
                  return;
                }
                closeWithAnimation();
              } catch {
                setErrorMessage("Не удалось найти товары по фото");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={!file || isLoading}
            className={`inline-flex items-center gap-2 ${ui.button.primary} disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <span className={ui.icon.spinnerLight} />
                Ищем похожие товары...
              </>
            ) : (
              "Искать похожие"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

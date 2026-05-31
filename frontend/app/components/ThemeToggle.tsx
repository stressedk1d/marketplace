"use client";

import { useTheme } from "@/lib/ThemeContext";

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();
  const isDark = mode === "dark";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setMode(isDark ? "light" : "dark")}
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-black/20 bg-white px-2.5 text14 transition hover:bg-gray-100 dark:border-white/20 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
        title={isDark ? "Светлая тема" : "Тёмная тема"}
      >
        {isDark ? "☀" : "🌙"}
      </button>
    );
  }

  return (
    <div
      className="inline-flex rounded-md border border-black/20 bg-white p-0.5 text13 dark:border-white/20 dark:bg-neutral-800"
      role="group"
      aria-label="Тема оформления"
    >
      <button
        type="button"
        onClick={() => setMode("light")}
        className={`rounded px-2.5 py-1.5 transition ${
          !isDark ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700"
        }`}
        aria-pressed={!isDark}
      >
        Светлая
      </button>
      <button
        type="button"
        onClick={() => setMode("dark")}
        className={`rounded px-2.5 py-1.5 transition ${
          isDark ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300"
        }`}
        aria-pressed={isDark}
      >
        Тёмная
      </button>
    </div>
  );
}

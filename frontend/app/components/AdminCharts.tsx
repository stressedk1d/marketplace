"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { pageSummaryCard } from "@/lib/page-classes";

type AnalyticsDay = {
  date: string;
  orders_count: number;
  revenue: number;
};

type StatusCount = {
  status: string;
  count: number;
};

type Analytics = {
  days: AnalyticsDay[];
  orders_by_status: StatusCount[];
};

const STATUS_LABELS: Record<string, string> = {
  created: "Оформлен",
  paid: "Оплачен",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });
}

function BarChart({
  items,
  formatValue,
  barClass,
}: {
  items: { label: string; value: number }[];
  formatValue?: (n: number) => string;
  barClass?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex h-44 items-end justify-between gap-2 sm:gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span className="text-[10px] font-medium text-neutral-500 sm:text-xs">
            {formatValue ? formatValue(item.value) : item.value}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-lg transition-all ${barClass ?? "bg-neutral-900 dark:bg-white"}`}
              style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
              title={`${item.label}: ${formatValue ? formatValue(item.value) : item.value}`}
            />
          </div>
          <span className="w-full truncate text-center text-[10px] text-neutral-500 sm:text-xs">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AdminCharts() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    apiFetch(apiUrl("/admin/analytics?days=7"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) setData(await res.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={`${pageSummaryCard} animate-pulse`}>
        <p className="text-sm text-neutral-500">Загрузка аналитики...</p>
      </div>
    );
  }

  if (!data || (data.days.every((d) => d.orders_count === 0) && data.orders_by_status.length === 0)) {
    return (
      <div className={pageSummaryCard}>
        <h2 className="mb-2 text-base font-semibold">Аналитика за 7 дней</h2>
        <p className="text-sm text-neutral-500">Данных пока мало — оформите тестовые заказы для графиков.</p>
      </div>
    );
  }

  const revenueBars = data.days.map((d) => ({
    label: formatDayLabel(d.date),
    value: d.revenue,
  }));

  const ordersBars = data.days.map((d) => ({
    label: formatDayLabel(d.date),
    value: d.orders_count,
  }));

  const statusBars = data.orders_by_status
    .filter((s) => s.count > 0)
    .map((s) => ({
      label: STATUS_LABELS[s.status] ?? s.status,
      value: s.count,
    }));

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className={pageSummaryCard}>
        <h2 className="mb-1 text-base font-semibold">Выручка за 7 дней</h2>
        <p className="mb-4 text-xs text-neutral-500">Без отменённых заказов</p>
        <BarChart items={revenueBars} formatValue={(v) => formatPrice(v)} barClass="bg-emerald-600 dark:bg-emerald-400" />
      </div>
      <div className={pageSummaryCard}>
        <h2 className="mb-1 text-base font-semibold">Заказы за 7 дней</h2>
        <p className="mb-4 text-xs text-neutral-500">Количество оформленных заказов</p>
        <BarChart items={ordersBars} barClass="bg-neutral-900 dark:bg-white" />
      </div>
      {statusBars.length > 0 && (
        <div className={`${pageSummaryCard} lg:col-span-2`}>
          <h2 className="mb-4 text-base font-semibold">Заказы по статусам</h2>
          <BarChart items={statusBars} barClass="bg-blue-600 dark:bg-blue-400" />
        </div>
      )}
    </div>
  );
}

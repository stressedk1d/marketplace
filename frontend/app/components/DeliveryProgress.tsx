import { formatPrice } from "@/lib/format";

const FREE_DELIVERY_THRESHOLD = 5000;

type DeliveryProgressProps = {
  subtotal: number;
};

export function DeliveryProgress({ subtotal }: DeliveryProgressProps) {
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const unlocked = remaining <= 0;

  return (
    <div className="rounded-xl border border-neutral-200/90 bg-gradient-to-br from-emerald-50/80 to-white p-4 dark:border-neutral-700 dark:from-emerald-950/30 dark:to-[var(--surface)]">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">
          {unlocked ? "Бесплатная доставка" : "До бесплатной доставки"}
        </span>
        <span className="text-neutral-500 dark:text-neutral-400">
          {unlocked ? "✓ активна" : formatPrice(remaining)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out dark:bg-emerald-400"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

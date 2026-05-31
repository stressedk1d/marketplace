type OrderStatus = "created" | "paid" | "shipped" | "delivered" | "cancelled";

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Оформлен",
  paid: "Оплачен",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const PIPELINE: OrderStatus[] = ["created", "paid", "shipped", "delivered"];

export default function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
        Заказ отменён
      </p>
    );
  }

  const activeIdx = PIPELINE.indexOf(status);

  return (
    <ol
      className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4"
      aria-label="Этапы заказа"
    >
      {PIPELINE.map((step, i) => {
        const done = i <= activeIdx;
        const current = i === activeIdx;
        return (
          <li key={step} className="relative flex flex-col items-center text-center">
            {i < PIPELINE.length - 1 && (
              <span
                className={`absolute left-[calc(50%+1rem)] top-4 hidden h-0.5 w-[calc(100%-2rem)] sm:block ${
                  i < activeIdx
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : "bg-neutral-200 dark:bg-neutral-700"
                }`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition ${
                done
                  ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                  : "border-neutral-300 bg-white text-neutral-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-500"
              } ${current ? "animate-pulse ring-2 ring-emerald-500/30 dark:ring-emerald-400/30" : ""}`}
            >
              {done && !current ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span
              className={`mt-2 text-xs font-medium sm:text-sm ${
                done
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-400 dark:text-neutral-500"
              } ${current ? "font-semibold text-emerald-700 dark:text-emerald-400" : ""}`}
            >
              {STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

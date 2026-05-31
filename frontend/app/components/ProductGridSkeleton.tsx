function pulse(className: string) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-300/70 ${className}`}
      aria-hidden
    />
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  columns?: string;
  label?: string;
}

export default function ProductGridSkeleton({
  count = 8,
  columns = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  label = "Загрузка",
}: ProductGridSkeletonProps) {
  return (
    <div
      className="container-main py-8"
      aria-busy="true"
      aria-label={label}
    >
      {pulse("mb-6 h-8 w-48")}
      <div className={`grid gap-4 ${columns}`}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm"
          >
            {pulse("h-52 w-full rounded-none")}
            <div className="space-y-2 p-4">
              {pulse("h-4 w-20")}
              {pulse("h-5 w-full")}
              {pulse("h-4 w-16")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="container-main py-8" aria-busy="true" aria-label="Загрузка товара">
      {pulse("mb-6 h-6 w-48")}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pulse("h-[min(72vw,380px)] sm:h-[380px]")}
            {pulse("h-[min(72vw,380px)] sm:h-[380px]")}
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-black/10 bg-white p-5">
          {pulse("h-8 w-3/4")}
          {pulse("h-6 w-24")}
          {pulse("h-12 w-full")}
          {pulse("h-12 w-full")}
        </div>
      </div>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return <CartPageSkeleton />;
}

export function AccountPageSkeleton() {
  return (
    <div className="container-main py-8" aria-busy="true" aria-label="Загрузка профиля">
      {pulse("mb-6 h-6 w-40")}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-6 space-y-4">
          {pulse("h-8 w-2/3")}
          {pulse("h-4 w-full")}
          {pulse("h-4 w-3/4")}
          {pulse("h-10 w-32")}
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-6 space-y-3">
          {pulse("h-6 w-48")}
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-t border-black/10 pt-3 space-y-2">
              {pulse("h-4 w-full")}
              {pulse("h-4 w-1/2")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrdersPageSkeleton() {
  return (
    <div className="container-main py-8" aria-busy="true" aria-label="Загрузка заказов">
      {pulse("mb-6 h-8 w-56")}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-black/10 bg-white p-5 space-y-3">
            {pulse("h-6 w-40")}
            {pulse("h-4 w-full")}
            {pulse("h-20 w-full")}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthPageSkeleton({ label = "Загрузка" }: { label?: string }) {
  return (
    <div className="min-h-screen py-10" aria-busy="true" aria-label={label}>
      <div className="container-main max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 border border-black/20 min-h-[420px]">
          {pulse("min-h-[200px] md:min-h-full")}
          <div className="p-8 space-y-4">
            {pulse("h-8 w-32 mx-auto")}
            {pulse("h-10 w-full")}
            {pulse("h-10 w-full")}
            {pulse("h-12 w-full")}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimplePageSkeleton({ label = "Загрузка" }: { label?: string }) {
  return (
    <div className="container-main py-10" aria-busy="true" aria-label={label}>
      {pulse("mb-4 h-8 w-48")}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-black/10 p-6 space-y-3">
            {pulse("h-6 w-3/4")}
            {pulse("h-4 w-full")}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="container-main py-8" aria-busy="true" aria-label="Загрузка корзины">
      {pulse("mb-6 h-6 w-32")}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-lg border border-black/10 bg-white p-4"
            >
              {pulse("h-20 w-20 shrink-0")}
              <div className="flex-1 space-y-2">
                {pulse("h-4 w-3/4")}
                {pulse("h-4 w-1/2")}
                {pulse("h-8 w-24")}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          {pulse("mb-4 h-6 w-40")}
          {pulse("mb-2 h-4 w-full")}
          {pulse("mb-6 h-12 w-full")}
          {pulse("h-12 w-full")}
        </div>
      </div>
    </div>
  );
}

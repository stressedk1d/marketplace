function pulseBlock(className: string) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-neutral-300/80 ${className}`}
      aria-hidden
    />
  );
}

export function BrandsSectionSkeleton() {
  return (
    <section className="space-y-6" aria-busy="true" aria-label="Загрузка брендов">
      {pulseBlock("h-8 w-48")}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            {pulseBlock("mx-auto h-24 w-24 rounded-full")}
            {pulseBlock("mx-auto mt-4 h-5 w-24")}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CollectionsSectionSkeleton() {
  return (
    <section
      className="space-y-6"
      aria-busy="true"
      aria-label="Загрузка коллекций"
    >
      {pulseBlock("h-8 w-64")}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            {pulseBlock("mb-3 h-4 w-32")}
            {pulseBlock("mb-4 h-7 w-3/4 max-w-md")}
            {pulseBlock("h-12 w-full")}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CelebritiesSectionSkeleton() {
  return (
    <section
      className="space-y-6"
      aria-busy="true"
      aria-label="Загрузка знаменитостей"
    >
      {pulseBlock("h-8 w-40")}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
          >
            {pulseBlock("aspect-square w-full rounded-none")}
            {pulseBlock("m-4 h-5 w-24 mx-auto")}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductsSectionSkeleton() {
  return (
    <section className="space-y-6" aria-busy="true" aria-label="Загрузка товаров">
      {pulseBlock("h-8 w-56")}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
            {pulseBlock("h-52 w-full rounded-none")}
            <div className="space-y-2 p-4">
              {pulseBlock("h-4 w-20")}
              {pulseBlock("h-5 w-full")}
              {pulseBlock("h-4 w-16")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

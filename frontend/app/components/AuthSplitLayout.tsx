import Image from "next/image";
import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container-main">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-xl dark:border-neutral-700 dark:bg-[var(--surface)] lg:grid-cols-2">
          <div className="relative min-h-[280px] lg:min-h-[520px]">
            <Image
              src="/images/brands/nike/Nike Club Fleece Hoodie.webp"
              alt=""
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
            <div className="relative flex h-full flex-col justify-end p-8 text-white lg:p-10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                VogueWay
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
              {subtitle && (
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80 sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

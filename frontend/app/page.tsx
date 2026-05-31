import { Suspense } from "react";

/** Не блокировать `next build`, если бэкенд недоступен на localhost. */
export const dynamic = "force-dynamic";

import { CelebritiesSection } from "./components/home/CelebritiesSection";
import { FeaturedCollectionsSection } from "./components/home/FeaturedCollectionsSection";
import { HomeEditorialBanner } from "./components/home/HomeEditorialBanner";
import { HomeFinalCta } from "./components/home/HomeFinalCta";
import { HomeHero } from "./components/home/HomeHero";
import { HomeMarquee } from "./components/home/HomeMarquee";
import { HomeValueProps } from "./components/home/HomeValueProps";
import {
  BrandsSectionSkeleton,
  CelebritiesSectionSkeleton,
  CollectionsSectionSkeleton,
  ProductsSectionSkeleton,
} from "./components/home/HomeSkeletons";
import { PopularBrandsSection } from "./components/home/PopularBrandsSection";
import { RecentViewedSection } from "./components/home/RecentViewedSection";
import { RecommendedForYouSection } from "./components/home/RecommendedForYouSection";
import { ScrollReveal } from "./components/home/ScrollReveal";
import { TrendingProductsSection } from "./components/home/TrendingProductsSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-neutral-900 dark:text-[var(--foreground)]">
      <HomeHero />
      <div
        className="h-10 bg-gradient-to-b from-neutral-950 via-neutral-900/80 to-background sm:h-14"
        aria-hidden
      />
      <HomeMarquee />

      <div className="container-main space-y-14 py-12 sm:space-y-20 sm:py-16 md:space-y-24 md:py-20">
        <ScrollReveal>
          <HomeValueProps />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Suspense fallback={<BrandsSectionSkeleton />}>
            <PopularBrandsSection />
          </Suspense>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <HomeEditorialBanner />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Suspense fallback={<CollectionsSectionSkeleton />}>
            <FeaturedCollectionsSection />
          </Suspense>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Suspense fallback={<ProductsSectionSkeleton />}>
            <TrendingProductsSection />
          </Suspense>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Suspense fallback={<CelebritiesSectionSkeleton />}>
            <CelebritiesSection />
          </Suspense>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <RecentViewedSection />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <RecommendedForYouSection />
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <HomeFinalCta />
        </ScrollReveal>
      </div>
    </div>
  );
}

import { Suspense } from "react";

/** Не блокировать `next build`, если бэкенд недоступен на localhost. */
export const dynamic = "force-dynamic";
import { CelebritiesSection } from "./components/home/CelebritiesSection";
import { FeaturedCollectionsSection } from "./components/home/FeaturedCollectionsSection";
import { HomeHero } from "./components/home/HomeHero";
import {
  BrandsSectionSkeleton,
  CelebritiesSectionSkeleton,
  CollectionsSectionSkeleton,
  ProductsSectionSkeleton,
} from "./components/home/HomeSkeletons";
import { PopularBrandsSection } from "./components/home/PopularBrandsSection";
import { RecentViewedSection } from "./components/home/RecentViewedSection";
import { TrendingProductsSection } from "./components/home/TrendingProductsSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-neutral-900">
      <HomeHero />
      <div className="container-main space-y-20 py-16 md:space-y-24 md:py-20">
        <Suspense fallback={<BrandsSectionSkeleton />}>
          <PopularBrandsSection />
        </Suspense>
        <Suspense fallback={<CollectionsSectionSkeleton />}>
          <FeaturedCollectionsSection />
        </Suspense>
        <Suspense fallback={<CelebritiesSectionSkeleton />}>
          <CelebritiesSection />
        </Suspense>
        <Suspense fallback={<ProductsSectionSkeleton />}>
          <TrendingProductsSection />
        </Suspense>
        <RecentViewedSection />
      </div>
    </div>
  );
}

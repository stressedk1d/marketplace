import Image from "next/image";
import Link from "next/link";
import { fetchBrands } from "@/lib/catalog-fetch";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { BrandGrid } from "@/app/components/BrandGrid";
import { PageHero } from "@/app/components/PageHero";
import { pageContent, pageShell } from "@/lib/page-classes";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await fetchBrands();

  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "Бренды" }]} />
        <PageHero
          eyebrow="Партнёры"
          title="Бренды"
          description="Nike, Adidas, New Balance и другие — выберите бренд и откройте коллекции с актуальными товарами."
          variant="light"
        />
        <BrandGrid brands={brands} hrefPrefix="/brands" emptyMessage="Бренды не найдены." />
      </div>
    </div>
  );
}

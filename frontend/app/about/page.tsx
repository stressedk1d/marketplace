import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { PageHero } from "@/app/components/PageHero";
import { AboutApproach, AboutValues } from "@/app/about/AboutSections";
import { pageContent, pageCtaPrimary, pageShell } from "@/lib/page-classes";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "VogueWay — маркетплейс модной одежды, обуви и аксессуаров. Узнайте о нашей миссии и ценностях.",
};

export default function AboutPage() {
  return (
    <div className={pageShell}>
      <div className={`${pageContent} pt-8 sm:pt-10`}>
        <Breadcrumbs items={[{ label: "О нас" }]} />

        <PageHero
          eyebrow="About"
          title="О VogueWay"
          description="Современный маркетплейс моды, где встречаются лучшие бренды и покупатели, ценящие стиль."
          variant="light"
        />

        <section className="max-w-3xl">
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            <strong className="text-neutral-900 dark:text-neutral-50">VogueWay</strong> — платформа,
            на которой удобно находить, сравнивать и покупать одежду, обувь и аксессуары от
            проверенных продавцов. Мы верим, что стиль не зависит от бюджета.
          </p>
        </section>

        <AboutValues />

        <AboutApproach />

        <div className="max-w-3xl">
          <Link href="/catalog" className={`${pageCtaPrimary} !w-auto inline-flex`}>
            Перейти в каталог
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "О компании",
  description: "VogueWay — маркетплейс модной одежды, обуви и аксессуаров. Узнайте о нашей миссии и ценностях.",
};

const values = [
  {
    title: "Качество",
    description:
      "Мы тщательно отбираем бренды и товары, чтобы каждая покупка соответствовала высоким стандартам качества.",
    icon: "✦",
  },
  {
    title: "Стиль",
    description:
      "Актуальные коллекции, тренды и подборки от стилистов — всё, чтобы вы всегда выглядели безупречно.",
    icon: "◈",
  },
  {
    title: "Доступность",
    description:
      "Широкий ценовой диапазон и удобная доставка делают моду доступной для каждого.",
    icon: "○",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-main py-10 sm:py-16">
        <Breadcrumbs items={[{ label: "О нас" }]} />
        <h1 className="h32 mb-6">О нас</h1>

        <section className="mb-12 max-w-3xl">
          <p className="text18 leading-relaxed text-neutral-700">
            <strong>VogueWay</strong> — это современный маркетплейс моды, где
            встречаются лучшие бренды и покупатели, ценящие стиль. Мы создали
            платформу, на которой удобно находить, сравнивать и покупать одежду,
            обувь и аксессуары от проверенных продавцов.
          </p>
          <p className="text16 mt-4 leading-relaxed text-neutral-600">
            Наша цель — сделать качественную моду доступной каждому. Мы верим,
            что стиль не зависит от бюджета, и стремимся предоставить широкий
            выбор товаров на любой вкус и кошелёк.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text24 mb-6 font-semibold">Наши ценности</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <span className="mb-4 block text-3xl">{v.icon}</span>
                <h3 className="text20 mb-2 font-semibold">{v.title}</h3>
                <p className="text16 text-neutral-600">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl">
          <h2 className="text24 mb-4 font-semibold">Наш подход</h2>
          <p className="text16 leading-relaxed text-neutral-600">
            Команда VogueWay — это профессионалы в области электронной коммерции
            и моды. Мы постоянно совершенствуем платформу, внедряем новые
            технологии — от умного поиска по фото до персональных рекомендаций —
            чтобы процесс покупки был простым и приятным.
          </p>
          <p className="text16 mt-4 leading-relaxed text-neutral-600">
            Мы работаем напрямую с брендами и продавцами, контролируя качество
            товаров и скорость доставки. Ваше удовлетворение — наш главный
            приоритет.
          </p>
          <div className="mt-8">
            <Link
              href="/catalog"
              className="inline-block rounded-lg bg-neutral-900 px-6 py-3 text16 font-medium text-white transition hover:bg-neutral-700"
            >
              Перейти в каталог
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

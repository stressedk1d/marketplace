import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог товаров",
  description:
    "Каталог модной одежды, обуви и аксессуаров VogueWay. Фильтры по брендам, типам и ценам. Визуальный поиск по фото.",
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}

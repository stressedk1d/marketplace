import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бренды",
  description:
    "Все бренды на VogueWay — Nike, Adidas, New Balance, Converse и другие. Переходите к коллекциям одним кликом.",
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

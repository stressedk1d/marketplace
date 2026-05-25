import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Ваша корзина покупок на VogueWay.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}

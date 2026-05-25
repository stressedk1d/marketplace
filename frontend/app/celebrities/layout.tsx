import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Знаменитости",
  description:
    "Мерч и коллаборации знаменитостей на VogueWay — эксклюзивные коллекции от артистов и инфлюенсеров.",
};

export default function CelebritiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

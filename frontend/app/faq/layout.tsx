import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Частые вопросы",
  description: "Ответы на часто задаваемые вопросы о покупках, доставке и возврате на VogueWay.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}

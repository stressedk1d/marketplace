import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MaintenanceGate from "./components/MaintenanceGate";
import { CartProvider } from "@/lib/CartContext";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "VogueWay — маркетплейс модной одежды и обуви",
    template: "%s | VogueWay",
  },
  description:
    "Маркетплейс модной одежды, обуви и аксессуаров. Nike, Adidas, New Balance, Converse и коллекции знаменитостей. Доставка по России.",
  keywords: [
    "маркетплейс",
    "одежда",
    "обувь",
    "аксессуары",
    "мода",
    "Nike",
    "Adidas",
    "VogueWay",
  ],
  openGraph: {
    title: "VogueWay — маркетплейс модной одежды и обуви",
    description:
      "Одежда, обувь и аксессуары от ведущих брендов. Коллекции знаменитостей, визуальный поиск по фото.",
    siteName: "VogueWay",
    type: "website",
    locale: "ru_RU",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <CartProvider>
          <MaintenanceGate>
            <Header />
            <main>{children}</main>
            <Footer />
          </MaintenanceGate>
        </CartProvider>
      </body>
    </html>
  );
}

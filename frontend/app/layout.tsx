import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import "./home.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import BackToTop from "./components/BackToTop";
import MobileBottomNav from "./components/MobileBottomNav";
import ScrollToTop from "./components/ScrollToTop";
import MaintenanceGate from "./components/MaintenanceGate";
import { CartProvider } from "@/lib/CartContext";
import { ToastProvider } from "@/lib/ToastContext";
import AppProviders from "@/lib/AppProviders";
import ThemeInitScript from "@/app/components/ThemeInitScript";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.PUBLIC_SITE_URL?.trim() ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    images: [
      {
        url: "/images/brands/nike/Nike Air Zoom Pegasus 41.webp",
        width: 1200,
        height: 630,
        alt: "VogueWay — маркетплейс моды",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VogueWay — маркетплейс модной одежды и обуви",
    description:
      "Одежда, обувь и аксессуары от ведущих брендов. Визуальный поиск по фото.",
    images: ["/images/brands/nike/Nike Air Zoom Pegasus 41.webp"],
  },
  icons: {
    icon: "/favicon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning data-theme="light">
      <head>
        <ThemeInitScript />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AppProviders>
          <CartProvider>
            <ToastProvider>
              <MaintenanceGate>
              <ScrollToTop />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white"
              >
                Перейти к контенту
              </a>
              <Suspense
                fallback={
                  <header className="sticky top-0 z-30 border-b border-black/20 bg-[#f3f3f3]">
                    <div className="container-main h-14 md:h-24" />
                  </header>
                }
              >
                <Header />
              </Suspense>
              <main id="main-content" className="pb-[4.75rem] lg:pb-0">
                {children}
              </main>
              <Footer />
              <MobileBottomNav />
              <BackToTop />
            </MaintenanceGate>
          </ToastProvider>
        </CartProvider>
        </AppProviders>
      </body>
    </html>
  );
}

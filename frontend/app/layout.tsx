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
  title: "VogueWay",
  description: "Маркетплейс одежды",
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

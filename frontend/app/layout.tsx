import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { CartProvider } from "@/lib/CartContext";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "VogueWay",
  description: "Маркетплейс одежды",
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
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

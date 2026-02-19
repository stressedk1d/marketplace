import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header"; // Импорт

export const metadata: Metadata = {
  title: "Savepoint Marketplace",
  description: "Маркетплейс одежды",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased bg-gray-50">
        <Header /> {/* Шапка будет здесь */}
        <main>{children}</main>
      </body>
    </html>
  );
}

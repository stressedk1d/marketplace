"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import { I18nProvider } from "@/lib/I18nContext";
import PwaRegister from "@/app/components/PwaRegister";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <PwaRegister />
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}

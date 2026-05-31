"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "ru" | "en";

const STORAGE_KEY = "vw-locale";

const dict = {
  ru: {
    catalog: "Каталог",
    cart: "Корзина",
    wishlist: "Избранное",
    orders: "Заказы",
    account: "Аккаунт",
    compare: "Сравнение",
    search: "Поиск",
    login: "Войти",
    register: "Регистрация",
    home: "Главная",
    brands: "Бренды",
    celebrities: "Знаменитости",
    checkout: "Оформление",
    theme: "Тема",
    language: "Язык",
    offline: "Нет соединения",
    addToCart: "В корзину",
    quickView: "Быстрый просмотр",
    inStockOnly: "Только в наличии",
    minRating4: "Рейтинг 4+",
    promoCode: "Промокод",
    loyaltyPoints: "Баллы лояльности",
    discount: "Скидка",
    total: "Итого",
  },
  en: {
    catalog: "Catalog",
    cart: "Cart",
    wishlist: "Wishlist",
    orders: "Orders",
    account: "Account",
    compare: "Compare",
    search: "Search",
    login: "Sign in",
    register: "Register",
    home: "Home",
    brands: "Brands",
    celebrities: "Celebrities",
    checkout: "Checkout",
    theme: "Theme",
    language: "Language",
    offline: "Offline",
    addToCart: "Add to cart",
    quickView: "Quick view",
    inStockOnly: "In stock only",
    minRating4: "Rating 4+",
    promoCode: "Promo code",
    loyaltyPoints: "Loyalty points",
    discount: "Discount",
    total: "Total",
  },
} as const;

export type I18nKey = keyof typeof dict.ru;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "ru" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: I18nKey) => dict[locale][key] ?? dict.ru[key] ?? key,
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

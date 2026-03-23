"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiUrl } from "./api";

interface CartContextValue {
  count: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({ count: 0, refreshCart: async () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refreshCart = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setCount(0); return; }
    try {
      const res = await fetch(apiUrl("/cart"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const items: { quantity: number }[] = await res.json();
        setCount(items.reduce((sum, i) => sum + i.quantity, 0));
      } else {
        setCount(0);
      }
    } catch {
      setCount(0);
    }
  }, []);

  return (
    <CartContext.Provider value={{ count, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

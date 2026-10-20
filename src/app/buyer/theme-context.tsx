"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface BuyerThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const BuyerThemeContext = createContext<BuyerThemeContextValue>({
  dark: false,
  toggle: () => {},
});

export function useBuyerTheme() {
  return useContext(BuyerThemeContext);
}

export function BuyerThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  // Read saved preference once on mount
  useEffect(() => {
    const saved = localStorage.getItem("darcho-buyer-theme");
    if (saved === "dark") setDark(true);
  }, []);

  // Persist + apply to <html> so native form controls and scrollbars match too
  useEffect(() => {
    localStorage.setItem("darcho-buyer-theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <BuyerThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </BuyerThemeContext.Provider>
  );
}

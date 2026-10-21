"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

interface FarmerThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const STORAGE_KEY = "darcho-farmer-theme";

const FarmerThemeContext = createContext<FarmerThemeContextValue>({
  dark: false,
  toggle: () => {},
});

export function useFarmerTheme() {
  return useContext(FarmerThemeContext);
}

/** Read the saved preference. Safe to call during render on the client. */
function readSavedTheme(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "dark";
}

export function FarmerThemeProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads the stored preference during the first render,
  // avoiding a post-mount effect that would cause a cascading render.
  const [dark, setDark] = useState<boolean>(readSavedTheme);

  // Apply to <html> so native form controls, scrollbars and dark: variants match
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);

  return (
    <FarmerThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </FarmerThemeContext.Provider>
  );
}

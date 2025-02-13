"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface Locale {
  lang: string;
  lang_name: string;
  url: string;
}

interface LocalesContextProps {
  locales: Locale[];
  setLocales: (locales: Locale[]) => void;
}

const LocalesContext = createContext<LocalesContextProps | undefined>(
  undefined
);

export const LocalesProvider = ({
  children,
  initialLocales,
}: {
  children: ReactNode;
  initialLocales: Locale[];
}) => {
  const [locales, setLocales] = useState<Locale[]>(initialLocales);

  useEffect(() => {
    setLocales(initialLocales);
    console.log("setting locales", initialLocales);
  }, [initialLocales]);

  return (
    <LocalesContext.Provider value={{ locales, setLocales }}>
      {children}
    </LocalesContext.Provider>
  );
};

export const useLocales = () => {
  const context = useContext(LocalesContext);
  if (!context) {
    throw new Error("useLocales must be used within a LocalesProvider");
  }
  return context;
};

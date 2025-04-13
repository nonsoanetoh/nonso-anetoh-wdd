"use client";
import React, { createContext, useContext, useState } from "react";

interface PreloaderContextProps {
  isPreloaded: boolean;
  setIsPreloaded: (isPreloaded: boolean) => void;
}

const PreloaderContext = createContext<PreloaderContextProps | undefined>(
  undefined
);

export const PreloaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isPreloaded, setIsPreloaded] = useState(false);

  return (
    <PreloaderContext.Provider value={{ isPreloaded, setIsPreloaded }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export const usePreloaderContext = () => {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error(
      "usePreloaderContext must be used within a PreloaderProvider"
    );
  }
  return context;
};

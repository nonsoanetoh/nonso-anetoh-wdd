"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface DataContextProps {
  isPreloaded: boolean;
  setIsPreloaded: (value: boolean) => void;
  setSpriteData: (value: {
    spriteSheet: string;
    collisionSheet: string;
  }) => void;
  spriteData: {
    spriteSheet: string;
    collisionSheet: string;
  };
  updateSpriteData: (data: {
    spriteSheet: string;
    collisionSheet: string;
  }) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [spriteData, setSpriteData] = useState({
    spriteSheet: "",
    collisionSheet: "",
  });

  const updateSpriteData = (data: {
    spriteSheet: string;
    collisionSheet: string;
  }) => {
    setSpriteData(data);
  };

  return (
    <DataContext.Provider
      value={{
        isPreloaded,
        setIsPreloaded,
        setSpriteData,
        updateSpriteData,
        spriteData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

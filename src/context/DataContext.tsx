"use client";
import React, { createContext, useContext, useState, ReactNode, RefObject } from "react";
import type { MatterCanvasHandle } from "../../types/matter";
import type { AvatarConfettiHandle } from "@/components/avatar-confetti";

interface DataContextProps {
  isPreloaded: boolean;
  setIsPreloaded: (value: boolean) => void;
  isFirstVisit: boolean;
  setIsFirstVisit: (value: boolean) => void;
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
  matterCanvasRef: RefObject<MatterCanvasHandle | null> | null;
  setMatterCanvasRef: (ref: RefObject<MatterCanvasHandle | null> | null) => void;
  avatarConfettiRef: RefObject<AvatarConfettiHandle | null> | null;
  setAvatarConfettiRef: (ref: RefObject<AvatarConfettiHandle | null> | null) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [spriteData, setSpriteData] = useState({
    spriteSheet: "",
    collisionSheet: "",
  });
  const [matterCanvasRef, setMatterCanvasRef] = useState<RefObject<MatterCanvasHandle | null> | null>(null);
  const [avatarConfettiRef, setAvatarConfettiRef] = useState<RefObject<AvatarConfettiHandle | null> | null>(null);

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
        isFirstVisit,
        setIsFirstVisit,
        setSpriteData,
        updateSpriteData,
        spriteData,
        matterCanvasRef,
        setMatterCanvasRef,
        avatarConfettiRef,
        setAvatarConfettiRef,
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

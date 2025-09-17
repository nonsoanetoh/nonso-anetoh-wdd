"use client";
import { useDataContext } from "@/context/DataContext";
import React, { FC, useEffect } from "react";
import { NavigationDocument } from "../../../prismicio-types";
import { useLenis } from "lenis/react";

interface PCProps {
  children: React.ReactNode;
  data: {
    navigation: NavigationDocument;
    spriteData: {
      spriteSheet: string;
      collisionSheet: string;
    };
  };
}

const PageContent: FC<PCProps> = ({ children, data }) => {
  const { updateSpriteData, isPreloaded } = useDataContext();
  const lenis = useLenis();

  useEffect(() => {
    updateSpriteData(data.spriteData);
  }, [data.spriteData, updateSpriteData]);

  // useEffect(() => {
  //   lenis?.scrollTo(0, { duration: 0 });
  //   lenis?.stop();
  // }, [lenis, isPreloaded]);

  // useEffect(() => {
  //   if (isPreloaded) {
  //     lenis?.start();
  //   }
  // }, [isPreloaded, lenis]);

  return <>{children}</>;
};

export default PageContent;

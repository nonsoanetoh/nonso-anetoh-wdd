"use client";
import { useDataContext } from "@/context/DataContext";
import React, { FC, useEffect } from "react";
import { NavigationDocument } from "../../../prismicio-types";

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
  const { updateSpriteData } = useDataContext();

  useEffect(() => {
    updateSpriteData(data.spriteData);
  }, [data.spriteData, updateSpriteData]);

  return <>{children}</>;
};

export default PageContent;

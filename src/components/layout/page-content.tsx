"use client";
import React, { FC } from "react";

interface PCProps {
  children: React.ReactNode;
}

const PageContent: FC<PCProps> = ({ children }) => {
  return <>{children}</>;
};

export default PageContent;

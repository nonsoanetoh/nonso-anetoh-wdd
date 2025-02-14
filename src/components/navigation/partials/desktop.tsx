"use client";
import React, { FC, useEffect, useState } from "react";
import { createClient } from "@/prismicio";
import { NavigationDocument } from "../../../../prismicio-types";

interface NavigationProps {
  children: React.ReactNode;
}

export const Navigation: FC<NavigationProps> = ({ children }) => {
  const [navigation, setNavigation] = useState<NavigationDocument>();

  useEffect(() => {
    const client = createClient();
    const fetchData = async () => {
      const navigation = await client.getSingle("navigation");
      setNavigation(navigation);
    };
    fetchData();
  }, []);

  return <>{navigation && <>{children}</>}</>;
};

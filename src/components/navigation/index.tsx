"use client";
import React, { useEffect, useState } from "react";
import { Navigation as DesktopNavigation } from "./partials/desktop";
import MobileNavigation from "./partials/mobile";
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { NavigationDocument } from "../../../prismicio-types";

const Navigation = () => {
  const [navigationData, setNavigationData] = useState<NavigationDocument>();

  useEffect(() => {
    const fetchNavigationData = async () => {
      const client = createClient();
      const navigation = await client.getSingle("navigation");
      setNavigationData(navigation);
    };

    fetchNavigationData();
  }, []);

  return (
    <header id="header">
      {navigationData && (
        <SliceZone
          slices={navigationData.data.slices}
          components={components}
        />
      )}
      <DesktopNavigation />
      <MobileNavigation />
    </header>
  );
};

export default Navigation;

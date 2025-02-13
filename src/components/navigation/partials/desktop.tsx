"use client";
import React, { FC, useEffect, useState } from "react";
import { createClient } from "@/prismicio";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NavigationDocument } from "../../../../prismicio-types";

export const Navigation: FC = () => {
  const [navigation, setNavigation] = useState<NavigationDocument>();

  useEffect(() => {
    const client = createClient();
    const fetchData = async () => {
      const navigation = await client.getSingle("navigation");
      setNavigation(navigation);
    };
    fetchData();
  }, []);

  return (
    <>
      {navigation && (
        <div className="text-content">
          <h1>{navigation.data.title}</h1>
          <p>{navigation.data.label}</p>
          <p>{navigation.data.location}</p>
          <LanguageSwitcher />
        </div>
      )}
    </>
  );
};

"use client";

import React from "react";
import { Content } from "@prismicio/client";
import Home from "./variants/home";
import About from "./variants/about";

type HeroSlice = Content.HeroSlice;

interface HeroComponentProps {
  data: HeroSlice;
}

const HeroComponent: React.FC<HeroComponentProps> = ({ data }) => {
  switch (data.variation) {
    case "default": {
      return <Home data={data} />;
    }
    default: {
      return null;
    }
  }
};

export default HeroComponent;

"use client";
import React, { FC, useEffect, useRef } from "react";
import { DataProvider, useDataContext } from "@/context/DataContext";
import PageContent from "./page-content";
import { LenisRef, ReactLenis, useLenis } from "lenis/react";
import Footer from "./footer";
import Header from "./header/header";
import { NavigationDocument } from "../../../prismicio-types";
import Preloader from "../preloader";
import gsap from "gsap";

import "@/utils/load-polyfills";

interface CLProps {
  data: {
    navigation: NavigationDocument;
    spriteData: {
      spriteSheet: string;
      collisionSheet: string;
    };
  };
  children: React.ReactNode;
}

const Layout: FC<CLProps> = ({ children, data }) => {
  const lenisRef = useRef<LenisRef | null>(null);

  useEffect(() => {
    function update(time: number): void {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <DataProvider>
      <ReactLenis
        ref={lenisRef}
        options={{
          easing: (t) => 1 - Math.pow(1 - t, 3),
          autoRaf: false,
        }}
        root
      >
        {/* <Preloader lenis={lenisRef} data={data.navigation} /> */}
        {/* <Header data={data.navigation} /> */}
        <PageContent data={data}>{children}</PageContent>
        {/* <Footer /> */}
      </ReactLenis>
    </DataProvider>
  );
};

export default Layout;

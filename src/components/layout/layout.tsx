"use client";
import React, { FC, useEffect, useRef } from "react";
import { DataProvider, useDataContext } from "@/context/DataContext";
import PageContent from "./page-content";
import { LenisRef, ReactLenis } from "lenis/react";
import Header from "./header/header";
import { NavigationDocument } from "../../../prismicio-types";
import Preloader from "../preloader";
import AvatarConfetti, { AvatarConfettiHandle } from "../avatar-confetti";
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

const LayoutInner: FC<CLProps> = ({ children, data }) => {
  const lenisRef = useRef<LenisRef | null>(null);
  const confettiRef = useRef<AvatarConfettiHandle | null>(null);
  const { setAvatarConfettiRef, isFirstVisit } = useDataContext();

  useEffect(() => {
    setAvatarConfettiRef(confettiRef);
    return () => setAvatarConfettiRef(null);
  }, [setAvatarConfettiRef]);

  // Set initial overflow hidden immediately on mount
  useEffect(() => {
    if (isFirstVisit) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
  }, [isFirstVisit]);

  // Watch for Lenis to become available and control it
  useEffect(() => {
    const checkLenis = setInterval(() => {
      if (lenisRef.current?.lenis) {
        clearInterval(checkLenis);

        if (isFirstVisit) {
          lenisRef.current.lenis.stop();
        } else {
          lenisRef.current.lenis.start();
        }
      }
    }, 50);

    return () => clearInterval(checkLenis);
  }, [isFirstVisit]);

  // Handle scroll state changes
  useEffect(() => {
    if (!isFirstVisit) {
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.start();
      }
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [isFirstVisit]);

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
    <ReactLenis
      ref={lenisRef}
      options={{
        easing: (t) => 1 - Math.pow(1 - t, 3),
        autoRaf: false,
      }}
      root
    >
      <Preloader lenis={lenisRef} />
      {/* <Header data={data.navigation} isVisible={!isFirstVisit} /> */}
      <PageContent data={data}>{children}</PageContent>
      <AvatarConfetti ref={confettiRef} />
      {/* <Footer /> */}
    </ReactLenis>
  );
};

const Layout: FC<CLProps> = ({ children, data }) => {
  return (
    <DataProvider>
      <LayoutInner data={data}>{children}</LayoutInner>
    </DataProvider>
  );
};

export default Layout;

"use client";
import React, { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LenisRef } from "lenis/react";
import Trinket from "../trinket";
import { useDataContext } from "@/context/DataContext";

interface PreloaderProps {
  lenis: React.RefObject<LenisRef | null>;
}

const Preloader: FC<PreloaderProps> = ({ lenis }) => {
  const pathname = usePathname();
  const { isFirstVisit, setIsFirstVisit } = useDataContext();
  const [trinketIndex, setTrinketIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const isHomePage = pathname === "/";

  // Define preloader trinket cycle (same as home hero)
  const preloaderCycle = [
    "avatar__base",
    "avatar__gym",
    "avatar__shower",
    "avatar__work",
    "avatar__music",
    "avatar__sleep",
    "avatar__base",
  ];

  useEffect(() => {
    // Only show preloader on first visit to non-home pages
    if (isHomePage || !isFirstVisit) {
      setIsVisible(false);
      return;
    }

    // Stop scrolling during preloader
    if (lenis.current) {
      lenis.current.lenis?.stop();
    }

    // Cycle through trinkets every 200ms for 1.2 seconds
    const cycleInterval = setInterval(() => {
      setTrinketIndex((prev) => (prev + 1) % preloaderCycle.length);
    }, 200);

    // Stop cycling after 1.2 seconds
    const stopTimeout = setTimeout(() => {
      clearInterval(cycleInterval);
      setTrinketIndex(0);

      // Start fade out after a brief pause
      setTimeout(() => {
        setIsVisible(false);

        // Re-enable scrolling
        if (lenis.current) {
          lenis.current.lenis?.start();
        }

        // Mark first visit as complete after fade
        setTimeout(() => {
          setIsFirstVisit(false);
        }, 600); // Match fade duration
      }, 200);
    }, 1200);

    return () => {
      clearInterval(cycleInterval);
      clearTimeout(stopTimeout);
    };
  }, [isFirstVisit, isHomePage, lenis, preloaderCycle.length, setIsFirstVisit]);

  // Don't render on home page or if not first visit
  if (isHomePage || !isFirstVisit) {
    return null;
  }

  // Don't render if faded out
  if (!isVisible && trinketIndex === 0) {
    return null;
  }

  return (
    <div
      className="preloader preloader--standalone"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="preloader__avatar">
        <Trinket
          id="preloader-standalone"
          name={preloaderCycle[trinketIndex]}
          type="static"
        />
      </div>
    </div>
  );
};

export default Preloader;

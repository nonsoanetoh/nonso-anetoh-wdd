// [Preloader Component]
// For the homepage, I want this to render a preloader below the hero canvas but above all other content
// For other pages, I want this to render a preloader above all content

// Prevent scrolling when preloader is active using Lenis
// One global preloader state to manage preloading across pages using context

// Cell animation for preloader

import React, { FC, useEffect, useState } from "react";
import { NavigationDocument } from "../../../prismicio-types";
import { usePathname } from "next/navigation";
import { LenisRef } from "lenis/react";

interface PreloaderProps {
  lenis: React.RefObject<LenisRef | null>;
  data?: NavigationDocument;
}

const Preloader: FC<PreloaderProps> = ({ lenis, data }) => {
  const pathname = usePathname();

  const [blockCount, setBlockCount] = useState(50);

  console.log("Preloader data:", data);
  console.log("lenis:", lenis.current);

  const isHomePage = pathname === "/";

  const stopScroll = () => {
    if (lenis.current) {
      lenis.current.lenis?.stop();
    }
  };

  const startScroll = () => {
    if (lenis.current) {
      lenis.current.lenis?.start();
    }
  };

  return (
    <>
      <section className="preloader preloader--home">
        {Array.from({ length: blockCount }).map((_, index) => (
          <div className="preloader__block" key={index}></div>
        ))}
      </section>
      {/* {!isPreloaded && (
        <section className="preloader" ref={preloaderRef}>
          preloader
        </section>
      )} */}
    </>
  );
};

export default Preloader;

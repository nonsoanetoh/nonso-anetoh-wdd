import React, { FC, useEffect } from "react";
import { NavigationDocument } from "../../../prismicio-types";
import { usePathname } from "next/navigation";
import { LenisRef } from "lenis/react";

interface PreloaderProps {
  lenis: React.RefObject<LenisRef | null>;
  data?: NavigationDocument;
}

const Preloader: FC<PreloaderProps> = ({ lenis, data }) => {
  const pathname = usePathname();

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
      <section className="preloader">preloader</section>
      {/* {!isPreloaded && (
        <section className="preloader" ref={preloaderRef}>
          preloader
        </section>
      )} */}
    </>
  );
};

export default Preloader;

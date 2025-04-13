"use client";
import React, { FC } from "react";
import Spotify from "../spotify";
import { PreloaderProvider } from "@/context/PreloaderContext";
import Preloader from "../preloader";
import PageContent from "./page-content";
import { ReactLenis } from "lenis/react";
import Footer from "./footer";
import Header from "./header";
import { Providers } from "@/app/providers";
import { NavigationDocument } from "../../../prismicio-types";

interface CLProps {
  data: {
    navigation: NavigationDocument;
  };
  children: React.ReactNode;
}

const Layout: FC<CLProps> = ({ children, data }) => {
  return (
    <PreloaderProvider>
      <ReactLenis
        options={{
          easing: (t) => 1 - Math.pow(1 - t, 3),
        }}
        root
      >
        <Preloader data={data.navigation} />
        <Header data={data.navigation} />
        <Providers>
          <PageContent>{children}</PageContent>
        </Providers>
        {/* <Spotify /> */}
        <Footer />
      </ReactLenis>
    </PreloaderProvider>
  );
};

export default Layout;

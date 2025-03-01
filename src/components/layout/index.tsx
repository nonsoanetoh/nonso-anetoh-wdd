"use client";
import React, { FC, useEffect, useState } from "react";
import { createClient } from "@/prismicio";
import { PreloaderDocument } from "../../../prismicio-types";
import { PrismicNextImage } from "@prismicio/next";
import usePreloader from "@/hooks/usePreloader";
import Spotify from "../spotify";
import PageContent from "./page-context";

interface CLProps {
  children: React.ReactNode;
}

const ContentLayout: FC<CLProps> = ({ children }) => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [preloaderData, setPreloaderData] = useState<PreloaderDocument>();
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { preloaderRef, startAnimation } = usePreloader({
    swapSpeed: 0.35,
  });

  useEffect(() => {
    const client = createClient();

    client.getSingle("preloader").then((response) => {
      setPreloaderData(response);
    });
  }, []);

  useEffect(() => {
    if (preloaderData) {
      const images = document.querySelectorAll(".preloader img");
      if (images.length > 0) {
        setImagesLoaded(true);
      }
    }
  }, [preloaderData]);

  useEffect(() => {
    if (imagesLoaded) {
      const currentPreloaderRef = preloaderRef.current;

      if (currentPreloaderRef) {
        const frames = Array.from(
          currentPreloaderRef.querySelectorAll(".preloader__image img")
        ) as HTMLElement[];

        startAnimation(frames).then(() => {
          setIsPreloaded(true);
        });
      }
    }
  }, [imagesLoaded, preloaderRef, startAnimation]);

  return (
    <>
      {/* {!isPreloaded && (
        <section className="preloader" ref={preloaderRef}>
          {preloaderData?.data?.images?.map((image, index) => {
            return (
              <figure className="preloader__image" key={index}>
                <PrismicNextImage field={image.image} alt="" priority />
              </figure>
            );
          })}
        </section>
      )} */}
      <PageContent>{children}</PageContent>
      <Spotify />
    </>
  );
};

export default ContentLayout;

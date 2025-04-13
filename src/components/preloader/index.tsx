import { usePreloaderContext } from "@/context/PreloaderContext";
import React, { FC, useEffect, useState } from "react";
import { PrismicNextImage } from "@prismicio/next";
import usePreloader from "@/hooks/usePreloader";
import { NavigationDocument } from "../../../prismicio-types";

interface PreloaderProps {
  data?: NavigationDocument;
}

const Preloader: FC<PreloaderProps> = ({ data }) => {
  const { isPreloaded, setIsPreloaded } = usePreloaderContext();

  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { preloaderRef, startAnimation } = usePreloader({
    swapSpeed: 0.35,
  });

  useEffect(() => {
    if (data) {
      const images = document.querySelectorAll(".preloader img");
      if (images.length > 0) {
        setImagesLoaded(true);
      }
    }
  }, [data]);

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
  }, [imagesLoaded, preloaderRef, startAnimation, setIsPreloaded]);

  return (
    <>
      {!isPreloaded && (
        <section className="preloader" ref={preloaderRef}>
          {data?.data.images.map((image, index) => {
            return (
              <figure className="preloader__image" key={index}>
                <PrismicNextImage field={image.image} alt="" priority />
              </figure>
            );
          })}
        </section>
      )}
    </>
  );
};

export default Preloader;

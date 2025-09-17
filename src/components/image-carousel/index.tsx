"use client";

import { Content } from "@prismicio/client";
import React, { FC, useRef } from "react";

interface ImageCarouselComponentProps {
  data: Content.ImageCarouselSlice;
}

const ImageCarouselComponent: FC<ImageCarouselComponentProps> = ({ data }) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="image-carousel"
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
    >
      <figure className="image-container" ref={imageContainerRef}>
        {/* <PrismicNextImage
          fill
          field={data.primary.images[0]?.image}
          fallbackAlt={""}
        /> */}
      </figure>
    </section>
  );
};

export default ImageCarouselComponent;

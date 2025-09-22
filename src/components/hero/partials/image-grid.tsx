import { Content, GroupField } from "@prismicio/client";
import React, { FC } from "react";
import { Simplify } from "../../../../prismicio-types";

interface ImageGridProps {
  images: GroupField<Simplify<Content.HeroSliceAboutPrimaryImageGridItem>>;
}

const ImageGrid: FC<ImageGridProps> = ({ images }) => {
  return <div className="image-grid">ImageGrid</div>;
};

export default ImageGrid;

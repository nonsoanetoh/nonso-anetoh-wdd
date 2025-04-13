import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import ImageCarouselComponent from "@/components/image-carousel";

/**
 * Props for `ImageCarousel`.
 */
export type ImageCarouselProps =
  SliceComponentProps<Content.ImageCarouselSlice>;

/**
 * Component for "ImageCarousel" Slices.
 */
const ImageCarousel: FC<ImageCarouselProps> = ({ slice }) => {
  return <ImageCarouselComponent data={slice} />;
};

export default ImageCarousel;

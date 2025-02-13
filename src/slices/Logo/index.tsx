import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Props for `Logo`.
 */
export type LogoProps = SliceComponentProps<Content.LogoSlice>;

/**
 * Component for "Logo" Slices.
 */
const Logo: FC<LogoProps> = ({ slice }) => {
  return (
    <div
      id="logo"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {/* {slice.primary.alternate_frame && (
        <figure>
          <PrismicNextImage
            data-name="alternate-frame"
            field={slice.primary.alternate_frame}
          />
        </figure>
      )}
      {slice.primary.animated_frame.map((item, index) => (
        <figure key={index}>
          <PrismicNextImage
            data-name="animated-frame"
            key={index}
            field={item.frame}
          />
        </figure>
      ))} */}
      {slice.primary.interaction_frame && (
        <figure>
          <PrismicNextImage
            data-name="interaction-frame"
            field={slice.primary.interaction_frame}
          />
        </figure>
      )}
    </div>
  );
};

export default Logo;

"use client";
import { FC, useEffect } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import useLogo from "@/hooks/useLogo";

/**
 * Props for `Logo`.
 */
export type LogoProps = SliceComponentProps<Content.LogoSlice> & {
  context: ContextInterface;
};

interface ContextInterface {
  logoRef: React.RefObject<HTMLDivElement>;
  titleRef: React.RefObject<HTMLHeadingElement>;
  backgroundRef: React.RefObject<HTMLDivElement>;
  labelRef: React.RefObject<HTMLParagraphElement>;
  locationRef: React.RefObject<HTMLParagraphElement>;
  navLinksRef: React.RefObject<(HTMLLIElement | null)[]>;
  separatorRef: React.RefObject<HTMLSpanElement>;
}

/**
 * Component for "Logo" Slices.
 */
const Logo: FC<LogoProps> = ({
  slice,
  context,
}: {
  slice: Content.LogoSlice;
  context: ContextInterface;
}) => {
  const { logoRef, startAnimation, setFrame, reset } = useLogo({
    swapSpeed: 0.25,
    titleRef: context.titleRef,
    backgroundRef: context.backgroundRef,
    labelRef: context.labelRef,
    locationRef: context.locationRef,
    navLinksRef: context.navLinksRef,
    separatorRef: context.separatorRef,
  });

  useEffect(() => {
    const currentLogoRef = logoRef.current;
    if (currentLogoRef) {
      const frames = Array.from(
        currentLogoRef.querySelectorAll("[data-name='animated-frame']")
      ) as HTMLElement[];
      startAnimation(frames).then(() => {
        if (currentLogoRef) {
          currentLogoRef.addEventListener("mouseover", () =>
            setFrame("interaction")
          );
          currentLogoRef.addEventListener("mouseleave", reset);
        }
      });
    }

    return () => {
      if (currentLogoRef) {
        currentLogoRef.removeEventListener("mouseover", () =>
          setFrame("interaction")
        );
        currentLogoRef.removeEventListener("mouseleave", reset);
      }
    };
  }, [logoRef, startAnimation, setFrame, reset]);

  return (
    <div
      id="logo"
      ref={logoRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {slice.primary.alternate_frame && (
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
      ))}
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

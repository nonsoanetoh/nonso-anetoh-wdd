import { Content, isFilled } from "@prismicio/client";
import React, { CSSProperties, FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import CTA from "@/components/button/variants/cta";
import Copy from "@/components/copy";

type SpaceBetweenSlice = Extract<
  Content.TextBlockSlice,
  { variation: "spaceBetween" }
>;

interface SpaceBetweenProps {
  data: SpaceBetweenSlice;
}

const SpaceBetween: FC<SpaceBetweenProps> = ({ data }) => {
  const {
    heading,
    heading_gif,
    gif_offset,
    heading_indent,
    text_content,
    cta,
  } = data.primary;

  // Split text_content by ** to create separate paragraphs
  const textParagraphs = text_content ? text_content.split("**") : [];

  return (
    <div className="inner inner--space-between">
      <div
        className="heading"
        style={
          heading_indent
            ? ({
                "--text-indent": heading_indent,
                "--gif-offset": gif_offset,
              } as CSSProperties)
            : undefined
        }
      >
        <h2>{heading}</h2>
        {isFilled.image(heading_gif) && (
          <div className="heading__gif">
            <PrismicNextImage field={heading_gif} />
          </div>
        )}
      </div>
      <div className="content">
        <Copy>
          {textParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Copy>
        {isFilled.link(cta) && (
          <div className="cta-wrapper">
            <CTA label={cta.text || ""} link={cta} />
            {/* <PrismicNextLink field={cta} className="cta" /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceBetween;

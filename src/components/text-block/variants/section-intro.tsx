import { Content, isFilled } from "@prismicio/client";
import React, { FC } from "react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

type SectionIntroSlice = Extract<Content.TextBlockSlice, { variation: "default" }>;

interface SectionIntroProps {
  data: SectionIntroSlice;
}

const SectionIntro: FC<SectionIntroProps> = ({ data }) => {
  const { heading, heading_gif, heading_indent, cta, text_content } = data.primary;

  return (
    <div className="inner inner--section-intro">
      {heading && (
        <div className="heading-wrapper" style={{ paddingLeft: heading_indent ? `${heading_indent}%` : 0 }}>
          <h2 className="heading" style={{ whiteSpace: 'pre-line' }}>{heading}</h2>
          {isFilled.image(heading_gif) && (
            <div className="heading-gif">
              <PrismicNextImage field={heading_gif} />
            </div>
          )}
        </div>
      )}

      {text_content && (
        <div className="text-content">
          <p>{text_content}</p>
        </div>
      )}

      {isFilled.link(cta) && (
        <div className="cta-wrapper">
          <PrismicNextLink field={cta} className="cta" />
        </div>
      )}
    </div>
  );
};

export default SectionIntro;

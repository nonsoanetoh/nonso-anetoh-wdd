import { Content } from "@prismicio/client";
import React, { FC } from "react";
import SectionIntro from "./variants/section-intro";
import SpaceBetween from "./variants/space-between";

interface TextBlockProps {
  data: Content.TextBlockSlice;
}

const TextBlockComponent: FC<TextBlockProps> = ({ data }) => {
  const { variation } = data;

  switch (variation) {
    case "spaceBetween":
      return (
        <section
          className="text-block"
          data-slice-type={data.slice_type}
          data-slice-variation={data.variation}
        >
          <SpaceBetween data={data} />
        </section>
      );

    case "default":
    default:
      return (
        <section
          className="text-block"
          data-slice-type={data.slice_type}
          data-slice-variation={data.variation}
        >
          <SectionIntro data={data} />
        </section>
      );
  }
};

export default TextBlockComponent;

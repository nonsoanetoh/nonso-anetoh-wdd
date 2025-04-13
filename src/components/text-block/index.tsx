import { Content } from "@prismicio/client";
import React, { FC } from "react";
import Default from "./variants/default";
import SpaceBetween from "./variants/space-between";

interface TextBlockProps {
  data: Content.TextBlockSlice;
}

const TextBlockComponent: FC<TextBlockProps> = ({ data }) => {
  const { variation } = data;

  if (variation === "spaceBetween" && "items" in data) {
    return (
      <section
        className="text-block"
        data-slice-type={data.slice_type}
        data-slice-variation={data.variation}
      >
        <SpaceBetween data={data} />
      </section>
    );
  }

  return (
    <section
      className="text-block"
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
    >
      <Default data={data} />
    </section>
  );
};

export default TextBlockComponent;

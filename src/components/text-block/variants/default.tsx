import { Content } from "@prismicio/client";
import React, { FC } from "react";

interface DefaultTextBlockProps {
  data: Content.TextBlockSliceDefault;
}

const Default: FC<DefaultTextBlockProps> = ({ data }) => {
  return <div>{data.variation}</div>;
};

export default Default;

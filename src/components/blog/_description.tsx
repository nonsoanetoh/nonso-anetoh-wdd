import React, { FC } from "react";
import * as prismic from "@prismicio/client";
import Label from "./_label";

type DescriptionProps = {
  text: string;
};

const Description: FC<DescriptionProps> = ({ text }) => {
  return (
    <div className="description">
      <Label text="Description" />
      <p>{text}</p>
    </div>
  );
};

export default Description;

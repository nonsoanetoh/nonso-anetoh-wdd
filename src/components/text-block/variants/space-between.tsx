import Button from "@/components/button";
import { Content } from "@prismicio/client";
import React, { FC } from "react";

interface TextBlockSpaceBetweenProps {
  data: Content.TextBlockSliceSpaceBetween;
}

const SpaceBetween: FC<TextBlockSpaceBetweenProps> = ({ data }) => {
  return (
    <div className="space-between">
      <div className="title">
        <h2>{data.primary.title}</h2>
      </div>
      <div className="content">
        <div className="text">
          {data.primary.text.map((item, index) => {
            return (
              <p key={index} className="text">
                {item.paragraph}
              </p>
            );
          })}
        </div>
        <Button
          label={data.primary.cta.text ?? "Call to Action"}
          link={"#work"}
          type="cta"
          linkType="within-page"
        />
      </div>
    </div>
  );
};

export default SpaceBetween;

import Button from "@/components/button";
import IndentedSectionTitle from "@/components/text/indented-section-title";
import { Content } from "@prismicio/client";
import React, { FC } from "react";

interface TextBlockSpaceBetweenProps {
  data: Content.TextBlockSliceSpaceBetween;
}

const SpaceBetween: FC<TextBlockSpaceBetweenProps> = ({ data }) => {
  return (
    <div className="inner inner--space-between">
      <div className="title">
        <IndentedSectionTitle text={data.primary.title ?? ""} />
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

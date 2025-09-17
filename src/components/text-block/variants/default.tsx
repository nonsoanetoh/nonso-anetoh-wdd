import Button from "@/components/button";
import { Content } from "@prismicio/client";
import React, { FC } from "react";

interface DefaultTextBlockProps {
  data:
    | Content.TextBlockSliceDefault
    | {
        primary: {
          title?: string;
          text: { paragraph: string }[];
          cta: { text?: string };
        };
      };
}

const Default: FC<DefaultTextBlockProps> = ({ data }) => {
  return (
    <div className="inner inner--default">
      <div className="title">Title</div>
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

export default Default;

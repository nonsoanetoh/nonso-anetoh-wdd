"use client";
import { FC, useState } from "react";
import { asText, Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { RichTextComponent } from "@/components/richtext";
import { calculateReadTime } from "@/utils/readTime";

/**
 * Props for `RichText`.
 */
export type RichTextProps = SliceComponentProps<Content.RichTextSlice>;
/**
 * Component for "RichText" Slices.
 */
interface ContextProps {
  publicationDate: string;
}

const RichText: FC<
  SliceComponentProps<Content.RichTextSlice, ContextProps>
> = ({ slice, context }) => {
  const [articleContent] = useState(asText(slice.primary.body));
  const [readTime] = useState(calculateReadTime(articleContent));
  return (
    <>
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
      >
        <div className="text-group">
          <span className="read-time">{readTime}</span>
          <span className="publication-date">{context.publicationDate}</span>
        </div>
        <RichTextComponent field={slice.primary.body} />
      </section>
    </>
  );
};

export default RichText;

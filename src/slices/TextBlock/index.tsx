import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import TextBlockComponent from "@/components/text-block";

/**
 * Props for `TextBlock`.
 */
export type TextBlockProps = SliceComponentProps<Content.TextBlockSlice>;

/**
 * Component for "TextBlock" Slices.
 */
const TextBlock: FC<TextBlockProps> = ({ slice }) => {
  return <TextBlockComponent data={slice} />;
};

export default TextBlock;

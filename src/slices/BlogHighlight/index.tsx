import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import BlogHighlightComponent from "@/components/blog-highlight";

/**
 * Props for `BlogHighlight`.
 */
export type BlogHighlightProps =
  SliceComponentProps<Content.BlogHighlightSlice>;

/**
 * Component for "BlogHighlight" Slices.
 */
const BlogHighlight: FC<BlogHighlightProps> = ({ slice }) => {
  return <BlogHighlightComponent data={slice} />;
};

export default BlogHighlight;

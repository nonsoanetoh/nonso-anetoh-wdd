import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `BlogList`.
 */
export type BlogListProps = SliceComponentProps<Content.BlogListSlice>;

/**
 * Component for "BlogList" Slices.
 */
const BlogList: FC<BlogListProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for blog_list (variation: {slice.variation}) Slices
    </section>
  );
};

export default BlogList;

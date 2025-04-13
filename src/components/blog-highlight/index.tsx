import { asDate, Content } from "@prismicio/client";
import React, { FC } from "react";
import Button from "../button";
import { PrismicNextLink } from "@prismicio/next";

interface BHProps {
  data: Content.BlogHighlightSlice;
}

const BlogHighlightComponent: FC<BHProps> = ({ data }) => {
  return (
    <section
      className="blog-highlight"
      data-slice-type={data.slice_type}
      data-slice-variation={data.variation}
    >
      <div className="text-content">
        <h2>{data.primary.title}</h2>
        <div className="group">
          <p>{data.primary.description}</p>
          <Button
            label={data.primary.cta.text ?? "View more posts"}
            link={"/blog"}
            type="cta"
            linkType="external"
          />
        </div>
      </div>
      <ul className="posts">
        {data.primary.posts.map((post, index) => {
          const date = asDate(post.post?.first_publication_date) ?? "";
          return (
            <li key={index} className="post">
              <PrismicNextLink field={post.post}>
                <article className="entry">
                  <h3>{post.post.text}</h3>
                  <span>
                    {new Date(date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </article>
              </PrismicNextLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default BlogHighlightComponent;

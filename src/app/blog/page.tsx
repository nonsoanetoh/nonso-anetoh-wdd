/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
import { PrismicNextLink } from "@prismicio/next";

export async function generateMetadata() {
  const client = createClient();
  const home = await client.getByUID("page", "blog");

  return {
    title: prismic.asText(home.data.title),
    description: home.data.meta_description,
    openGraph: {
      title: home.data.meta_title || undefined,
      images: [
        {
          url: home.data.meta_image.url ?? "",
        },
      ],
    },
  };
}

export default async function Index() {
  const client = createClient();
  const posts = await client.getAllByType("blog_post", {
    orderings: [
      { field: "my.blog_post.publication_date", direction: "desc" },
      { field: "document.first_publication_date", direction: "desc" },
    ],
  });
  return (
    <section className="page--blog-list">
      <div className="inner">
        <p className="description">
          A collection of articles detailing my journey — ideas, experiments,
          and lessons learned while building projects.
        </p>
        <div className="posts">
          {posts.map((post) => (
            <PrismicNextLink className="post" key={post.id} field={post}>
              <article>
                <header>
                  <h3>{prismic.asText(post.data.title)}</h3>
                </header>
              </article>
            </PrismicNextLink>
          ))}
        </div>
      </div>
    </section>
  );
}

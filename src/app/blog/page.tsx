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
    <section className="page page--blog-list">
      <div className="inner">
        <div className="header">
          <div className="title">All Posts</div>
          <p className="description">
            A collection of articles detailing my journey — ideas, experiments,
            and lessons learned while building projects.
          </p>
        </div>
        <ul className="posts">
          {posts.map((post) => (
            <li key={post.id}>
              <PrismicNextLink className="post" field={post}>
                <article
                  className="post__face post__face--front"
                  style={{ backgroundColor: post.data.background_color }}
                >
                  <header className="front">
                    <h3 className="title">{prismic.asText(post.data.title)}</h3>
                  </header>
                  <div className="back">dsadsa</div>
                </article>
              </PrismicNextLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
{
}

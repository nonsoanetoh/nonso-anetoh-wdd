/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
import { RichTextComponent } from "@/components/richtext";
import Image from "next/image";

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
  // const blog = await client.getByUID("page", "blog");
  const posts = await client.getAllByType("blog_post", {
    orderings: [
      { field: "my.blog_post.publication_date", direction: "desc" },
      { field: "document.first_publication_date", direction: "desc" },
    ],
  });
  return (
    <section className="page--blog-list">
      <section className="blog-hero">
        <Image
          src="/blog-hero.png"
          width={300}
          height={440}
          alt="Nonso Anetoh - Web Designer & Developer"
        />
      </section>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <a href={`/blog/${post.uid}`}>
              <RichTextComponent field={post.data.title} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ./src/app/blog/[uid]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { SliceZone } from "@prismicio/react";
import * as prismic from "@prismicio/client";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { RichTextComponent } from "@/components/richtext";
import JumpLinks from "@/components/jump-links";
import BackButton from "@/components/back-button";

type Params = { uid: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const client = createClient();
  const param = await params;

  const page = await client
    .getByUID("blog_post", param.uid)
    .catch(() => notFound());

  return {
    title: prismic.asText(page.data.title),
    description: page.data.meta_description,
    openGraph: {
      title: page.data.meta_title || undefined,
      images: [
        {
          url: page.data.meta_image.url || "",
        },
      ],
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const client = createClient();

  const param = await params;

  const page = await client
    .getByUID("blog_post", param.uid)
    .catch(() => notFound());

  const posts = await client
    .getAllByType("blog_post", {
      predicates: [prismic.filter.not("my.blog_post.uid", param.uid)],
      orderings: [
        { field: "my.blog_post.publication_date", direction: "desc" },
        { field: "document.first_publication_date", direction: "desc" },
      ],
      limit: 2,
    })
    .then((response) => console.log(response));

  const { slices, title, publication_date } = page.data;

  return (
    <div className="page page--blog">
      <article className="blog-content">
        <header>
          <BackButton />
          <RichTextComponent field={title} />
        </header>
        <SliceZone
          slices={slices}
          components={components}
          context={{
            publicationDate: new Date(
              publication_date || ""
            ).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          }}
        />
      </article>
      <JumpLinks />

      {/* Display the Recommended Posts section using the posts we requested earlier
      <h2 className="font-bold text-3xl">Recommended Posts</h2>
      <section className="grid grid-cols-1 gap-8 max-w-3xl w-full">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      */}
    </div>
  );
}

export async function generateStaticParams() {
  const client = createClient();

  /**
   * Query all Documents from the API, except the homepage.
   */
  const pages = await client.getAllByType("blog_post");

  /**
   * Define a path for every Document.
   */
  return pages.map((page) => {
    return { uid: page.uid };
  });
}

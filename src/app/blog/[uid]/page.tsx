/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { notFound } from "next/navigation";

import { SliceZone } from "@prismicio/react";
import * as prismic from "@prismicio/client";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { RichTextComponent } from "@/components/richtext";
import JumpLinks from "@/components/jump-links";
import Image from "next/image";

export async function generateMetadata({ params }) {
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

export default async function Page({ params }) {
  const client = createClient();

  const param = await params;

  const page = await client
    .getByUID("blog_post", param.uid)
    .catch(() => notFound());

  const { slices, title, publication_date } = page.data;

  return (
    <div className="page page--blog">
      <section className="blog-hero">
        <Image
          src="/blog-hero.png"
          width={300}
          height={440}
          alt="Nonso Anetoh - Web Designer & Developer"
        />
      </section>
      <article className="blog-content">
        <header className="blog-content__header">
          <RichTextComponent field={title} />
        </header>
        <JumpLinks />
        <div className="blog-content__body">
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
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const client = createClient();

  const pages = await client.getAllByType("blog_post");

  return pages.map((page) => {
    return { uid: page.uid };
  });
}

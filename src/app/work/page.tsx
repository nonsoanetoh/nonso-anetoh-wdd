/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
// import { RichTextComponent } from "@/components/richtext";
import Image from "next/image";

export async function generateMetadata() {
  const client = createClient();
  const work = await client.getByUID("page", "work");

  return {
    description: work.data.meta_description,
    title: prismic.asText(work.data.title),
    openGraph: {
      title: work.data.meta_title || undefined,
      images: [
        {
          url: work.data.meta_image.url ?? "",
        },
      ],
    },
  };
}

export default async function Index() {
  // const client = createClient();
  // const posts = await client.getAllByType("project", {
  //   orderings: [
  //     { field: "project.publication_date", direction: "desc" },
  //     { field: "document.first_publication_date", direction: "desc" },
  //   ],
  // });
  return (
    <section className="page--work-list">
      <section className="work-hero">
        <Image
          src="/blog-hero.png"
          width={300}
          height={440}
          alt="Nonso Anetoh - Web Designer & Developer"
        />
      </section>
      {/* <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <a href={`/work/${post.uid}`}>
              <RichTextComponent field={post.data.title} />
            </a>
          </li>
        ))}
      </ul> */}
    </section>
  );
}

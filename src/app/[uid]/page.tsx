import type { Metadata } from "next";
import * as prismic from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { notFound } from "next/navigation";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

type PageParams = { params: { uid: string } };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { uid } = params; // <- no await here
  const client = createClient();

  const page = await client.getByUID("page", uid).catch(() => notFound());

  return {
    title: prismic.asText(page.data.title),
    description: page.data.meta_description ?? "",
    openGraph: {
      title: page.data.meta_title ?? "",
      images: page.data.meta_image?.url
        ? [{ url: page.data.meta_image.url }]
        : [],
    },
  };
}

export default async function Page({ params }: PageParams) {
  const { uid } = params;
  const client = createClient();

  const page = await client.getByUID("page", uid).catch(() => notFound());

  return (
    <div className={`page page--${uid}`}>
      <div className="inner">
        <SliceZone slices={page.data.slices} components={components} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("page");

  return pages.map((page) => ({ uid: page.uid }));
}

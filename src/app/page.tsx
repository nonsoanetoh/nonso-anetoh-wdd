/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { SliceZone } from "@prismicio/react";
import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
// import TrinketIcon from "@/components/trinket-icon";

export async function generateMetadata() {
  const client = createClient();
  const home = await client.getByUID("page", "home");

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
  const home = await client.getByUID("page", "home");
  return (
    <div className="page page--home">
      <div className="inner">
        <SliceZone slices={home.data.slices} components={components} />
      </div>
    </div>
  );
}

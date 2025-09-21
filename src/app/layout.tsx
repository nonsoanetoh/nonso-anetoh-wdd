import "@/utils/load-polyfills";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import "@/styles/main.scss";
import { Inter } from "next/font/google";
import Script from "next/script";
import Layout from "@/components/layout/layout";
import { createClient } from "@/prismicio";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = createClient();
  const navigation = await client.getSingle("navigation");
  const spriteData = await client.getSingle("spritesheet");

  const data = {
    navigation,
    spriteData: {
      spriteSheet: spriteData.data.media_spritesheet.url ?? "",
      collisionSheet: spriteData.data.media_collision.url ?? "",
    },
  };

  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Layout data={data}>{children}</Layout>
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          type="text/javascript"
          async
        />
        <SpeedInsights />
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}

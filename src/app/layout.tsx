import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import "@/styles/main.scss";
import { Inter } from "next/font/google";
import Script from "next/script";
import Layout from "@/components/layout/layout";
import { createClient } from "@/prismicio";
import EasterEgg from "@/components/easter-egg";

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

  const data = {
    navigation,
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
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}

import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import "@/styles/main.scss";
import ContentLayout from "@/components/layout";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <ContentLayout>{children}</ContentLayout>
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

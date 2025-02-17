import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import "@/styles/main.scss";
import ContentLayout from "@/components/layout";
import { Inter } from "next/font/google";

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
      <body>
        <ContentLayout>{children}</ContentLayout>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}

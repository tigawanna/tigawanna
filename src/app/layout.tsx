import { PageContainer } from "@/components/shared/container/PageContainer";
import { siteConfig } from "@/components/shared/container/site";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../state/md/markdown.css";
import "./globals.css";
import "@/components/pagination/pagination.css"



const inter = Inter({ subsets: ["latin"] });
const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Add the following metadata:

  keywords:
    "fullstack developer, JavaScript, React, Next.js, web development, Nairobi",
  authors: [{ name: "Dennis Kinuthia" }],

  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(getBaseUrl()),
  twitter: {
    card: "summary",
    site: "@tigawanna", // Replace with your Twitter handle
    creator: "@tigawanna", // Replace with your Twitter handle
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PageContainer>{children}</PageContainer>
        <Analytics />
      </body>
    </html>
  );
}

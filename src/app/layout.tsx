import { PageContainer } from "@/components/shared/container/PageContainer";
import "./globals.css";
import { Inter } from "next/font/google";
import { siteConfig } from "@/components/shared/container/site";
import { Metadata } from "next";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  // Add the following metadata:

  keywords: "fullstack developer, JavaScript, React, Next.js, web development, Nairobi",
  authors: [{ name: "Dennis Kinuthia" }],

  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    site: "@tigawanna", // Replace with your Twitter handle
    creator: "@tigawanna", // Replace with your Twitter handle
  },

};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className+"bg-red-400"}>
        <PageContainer>{children}</PageContainer>
      </body>
    </html>
  );
}

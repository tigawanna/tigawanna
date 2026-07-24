import { Fraunces, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import {
  siteConfig,
  siteSeoDescription,
  siteSeoKeywords,
  siteSeoTitle,
} from "@repo/site-constants";
import "./styles.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteConfig.links.website),
  title: siteSeoTitle,
  description: siteSeoDescription,
  keywords: siteSeoKeywords,
  icons: {
    icon: [{ url: siteConfig.assets.favicon }, { url: siteConfig.assets.icon, type: "image/png" }],
    apple: [{ url: siteConfig.assets.appleTouchIcon }],
  },
  openGraph: {
    title: siteSeoTitle,
    description: siteSeoDescription,
    images: [{ url: siteConfig.assets.ogImage, alt: siteConfig.assets.ogImageAlt }],
  },
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en" data-theme="wanna" className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}

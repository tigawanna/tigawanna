import localFont from "next/font/local";
import { Toaster } from "sonner";
import {
  siteConfig,
  siteSeoDescription,
  siteSeoKeywords,
  siteSeoTitle,
} from "@repo/site-constants";
import { getSiteUrl } from "@/lib/site-url";
import "./styles.css";

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght.woff2",
  variable: "--font-sans-loaded",
  display: "swap",
  weight: "300 700",
});

const fraunces = localFont({
  src: "./fonts/fraunces-latin-wght.woff2",
  variable: "--font-serif-loaded",
  display: "swap",
  weight: "400 700",
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
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

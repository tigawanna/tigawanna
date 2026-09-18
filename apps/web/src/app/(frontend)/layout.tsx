import localFont from "next/font/local";
import { Analytics } from '@vercel/analytics/next'

import { Toaster } from "sonner";
import {
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
  // favicon.ico, icon.svg, apple-icon.png, opengraph-image.png — file conventions in app/
  openGraph: {
    title: siteSeoTitle,
    description: siteSeoDescription,
  },
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en" data-theme="wanna" className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}

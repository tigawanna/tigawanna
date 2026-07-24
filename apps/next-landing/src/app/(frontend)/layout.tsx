import { Fraunces, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "Dennis Waweru — tigawanna",
  description:
    "Full-stack TypeScript engineer building warm interfaces, strict systems, and occasional creature features.",
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

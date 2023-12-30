import { PageContainer } from "@/components/shared/container/PageContainer";
import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dennis Kinuthis",
  description: "Dennis kinuthia's portfolio website  ",
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

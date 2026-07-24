import { LandingPage } from "@/components/landing/LandingPage";

/**
 * Landing route — sync shell. Data is fetched inside section Server Components
 * (`use cache` + Suspense) so Cache Components can prerender the static shell
 * and stream only the parts that need request-time work.
 */
export default function HomePage() {
  return <LandingPage />;
}

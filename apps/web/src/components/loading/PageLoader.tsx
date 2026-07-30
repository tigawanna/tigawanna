import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { CenteredLoader } from "./CenteredLoader";

type PageLoaderProps = {
  label?: string;
};

/**
 * Full-page loading shell with site chrome + centered brand mark.
 */
export function PageLoader({ label = "Loading…" }: PageLoaderProps) {
  return (
    <div
      data-test="page-loader"
      className="min-h-svh bg-base-100 text-base-content"
      aria-busy="true"
    >
      <LandingNavbar />
      <CenteredLoader label={label} fullPage size="lg" className="min-h-[calc(100svh-5rem)]" />
    </div>
  );
}

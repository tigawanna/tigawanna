import { CenteredLoader } from "@/components/loading/CenteredLoader";

/**
 * Landing grid loading placeholder — centered brand mark (shared loader).
 */
export function PortfolioGridSkeleton({ count: _count = 3 }: { count?: number }) {
  return (
    <div data-test="portfolio-grid-skeleton">
      <CenteredLoader label="Loading…" size="md" className="min-h-64 text-landing-cream/80" />
    </div>
  );
}

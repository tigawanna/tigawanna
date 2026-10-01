import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { TigawannaComponent } from "@/components/icons/tigawanna-icon";
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
      className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-base-100 px-6 pt-20 text-base-content md:gap-8"
      aria-busy="true"
    >
      <LandingNavbar />
      <TigawannaComponent animate />
      <CenteredLoader label={label} size="lg" />
    </div>
  );
}

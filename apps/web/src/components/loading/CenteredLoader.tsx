import { TigawannaMarkIcon } from "@/components/landing/stubs/tigawanna-mark";
import { twMerge } from "tailwind-merge";

type CenteredLoaderProps = {
  /** Accessible status label (sr-only). */
  label?: string;
  className?: string;
  /** Fill the viewport — route / page transitions. */
  fullPage?: boolean;
  /** Mark size hint: section vs page. */
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "h-12 w-20",
  md: "h-16 w-24",
  lg: "h-20 w-32 md:h-24 md:w-40",
} as const;

/**
 * Shared loading indicator — brand mark, centered. Use everywhere instead of
 * ad-hoc “Loading…” text or mismatched skeletons.
 */
export function CenteredLoader({
  label = "Loading…",
  className,
  fullPage = false,
  size = "md",
}: CenteredLoaderProps) {
  return (
    <div
      data-test="centered-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={twMerge(
        "flex w-full flex-col items-center justify-center text-base-content/45",
        fullPage ? "min-h-svh px-6" : "min-h-48 py-16",
        className,
      )}
    >
      <TigawannaMarkIcon
        className={twMerge("loader-mark text-current", SIZE_CLASS[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

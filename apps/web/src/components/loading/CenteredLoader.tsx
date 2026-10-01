import { twMerge } from "tailwind-merge";

type CenteredLoaderProps = {
  /** Accessible status label (sr-only). */
  label?: string;
  className?: string;
  /** Fill the viewport — route / page transitions. */
  fullPage?: boolean;
  /** Orbit size hint: section vs page. */
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "size-8",
  md: "size-12",
  lg: "size-14 md:size-16",
} as const;

/**
 * Shared loading indicator — paired-orbit dots, centered. Use everywhere
 * instead of ad-hoc “Loading…” text or mismatched skeletons.
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
        "flex w-full flex-col items-center justify-center text-base-content/80",
        fullPage && "min-h-svh px-6",
        className,
      )}
    >
      <div className={twMerge("loader-orbit", SIZE_CLASS[size])} aria-hidden="true">
        <span className="loader-orbit__core" />
        <span className="loader-orbit__dot" />
        <span className="loader-orbit__dot loader-orbit__dot--trail" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

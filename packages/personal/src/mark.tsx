import type { ComponentProps } from "react";

type MarkProps = ComponentProps<"svg"> & {
  size?: number;
};

/**
 * Compact brand mark for the credit badge.
 */
export function TigawannaMark({ size = 18, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 220 140"
      width={size}
      height={Math.round(size * (140 / 220))}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M28 70C28 42 48 22 76 22C92 22 106 30 114 42"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M192 70C192 98 172 118 144 118C128 118 114 110 106 98"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="110" cy="70" r="22" stroke="currentColor" strokeWidth="8" />
    </svg>
  );
}

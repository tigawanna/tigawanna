/**
 * Scroll restoration key helper (Next.js App Router manages scroll differently).
 * Kept for parity with the TanStack landing package API surface.
 */
export function getScrollRestorationKey(pathname: string) {
  return pathname;
}

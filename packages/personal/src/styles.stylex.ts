import * as stylex from "@stylexjs/stylex";

/**
 * Fixed-corner placement. Spacing prefers Astryx/host tokens, then rem fallbacks.
 */
export const styles = stylex.create({
  anchor: {
    position: "fixed",
    zIndex: 2147483000,
  },
  bottomRight: {
    bottom: "var(--spacing-5, 1.25rem)",
    right: "var(--spacing-5, 1.25rem)",
  },
  bottomLeft: {
    bottom: "var(--spacing-5, 1.25rem)",
    left: "var(--spacing-5, 1.25rem)",
  },
  topRight: {
    top: "var(--spacing-5, 1.25rem)",
    right: "var(--spacing-5, 1.25rem)",
  },
  topLeft: {
    top: "var(--spacing-5, 1.25rem)",
    left: "var(--spacing-5, 1.25rem)",
  },
});

import * as stylex from "@stylexjs/stylex";

/**
 * Host tokens first (shadcn / Tailwind v4), then `light-dark()` so embeds
 * follow system/host color-scheme when those vars are missing.
 * `classNamePrefix: "twc"` keeps atomics from colliding with host StyleX.
 */
const fg = "var(--foreground, var(--color-foreground, light-dark(#0a0a0a, #fafaf9)))";
const card = "var(--card, var(--color-card, light-dark(#ffffff, #1c1917)))";
const cardFg =
  "var(--card-foreground, var(--color-card-foreground, light-dark(#0a0a0a, #fafaf9)))";
const muted = "var(--muted, var(--color-muted, light-dark(#f5f5f5, #292524)))";
const mutedFg =
  "var(--muted-foreground, var(--color-muted-foreground, light-dark(#737373, #a8a29e)))";
const border = "var(--border, var(--color-border, light-dark(#e5e5e5, #44403c)))";
const primary = "var(--primary, var(--color-primary, light-dark(#171717, #fafaf9)))";
const primaryFg =
  "var(--primary-foreground, var(--color-primary-foreground, light-dark(#fafafa, #171717)))";
const radiusMd = "var(--radius, var(--radius-md, 0.5rem))";
const radiusLg = "var(--radius, var(--radius-lg, 0.75rem))";

export const styles = stylex.create({
  root: {
    // Inherit host dark/light so `light-dark()` fallbacks resolve correctly.
    colorScheme: "inherit",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: 1.5,
    boxSizing: "border-box",
    color: fg,
  },

  anchor: {
    position: "fixed",
    zIndex: 2147483000,
  },
  /** Normal document flow — e.g. footer; only visible when that section is on screen. */
  inline: {
    position: "static",
    zIndex: "auto",
    display: "inline-flex",
  },
  bottomRight: {
    bottom: "1.25rem",
    right: "1.25rem",
  },
  bottomLeft: {
    bottom: "1.25rem",
    left: "1.25rem",
  },
  topRight: {
    top: "1.25rem",
    right: "1.25rem",
  },
  topLeft: {
    top: "1.25rem",
    left: "1.25rem",
  },

  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: 0,
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: border,
    borderRadius: radiusMd,
    backgroundColor: card,
    color: cardFg,
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.25,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgb(0 0 0 / 6%), 0 4px 12px rgb(0 0 0 / 8%)",
    backdropFilter: "blur(8px)",
  },
  triggerHover: {
    ":hover": {
      backgroundColor: muted,
    },
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 2147483001,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "rgb(0 0 0 / 45%)",
  },

  panel: {
    position: "fixed",
    zIndex: 2147483002,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    margin: 0,
    padding: "1.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: border,
    backgroundColor: card,
    color: cardFg,
    boxShadow: "0 16px 48px rgb(0 0 0 / 18%)",
    boxSizing: "border-box",
  },
  panelDialog: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(24rem, calc(100vw - 2rem))",
    maxHeight: "min(32rem, calc(100vh - 2rem))",
    borderRadius: radiusLg,
    overflowY: "auto",
  },
  panelSheet: {
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxHeight: "min(70vh, 32rem)",
    borderTopLeftRadius: radiusLg,
    borderTopRightRadius: radiusLg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflowY: "auto",
    paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  headerMain: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    minWidth: 0,
    flex: "1 1 auto",
  },
  avatar: {
    flexShrink: 0,
    width: "2.75rem",
    height: "2.75rem",
    borderRadius: "9999px",
    objectFit: "cover",
    display: "block",
    backgroundColor: muted,
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  subtitle: {
    margin: 0,
    fontSize: "0.875rem",
    color: mutedFg,
  },
  close: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "2rem",
    height: "2rem",
    margin: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: radiusMd,
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: "1.25rem",
    lineHeight: 1,
  },

  brand: {
    margin: 0,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: primary,
  },
  body: {
    margin: 0,
    fontSize: "0.9375rem",
  },
  meta: {
    margin: 0,
    fontSize: "0.8125rem",
    color: mutedFg,
  },

  socialRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
  },
  socialLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.25rem",
    height: "2.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: border,
    borderRadius: radiusMd,
    backgroundColor: muted,
    color: "inherit",
    textDecoration: "none",
  },

  cta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    boxSizing: "border-box",
    margin: 0,
    marginTop: "0.25rem",
    paddingBlock: "0.65rem",
    paddingInline: "1rem",
    borderWidth: 0,
    borderRadius: radiusMd,
    backgroundColor: primary,
    color: primaryFg,
    fontSize: "0.875rem",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },
});

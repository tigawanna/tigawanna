import * as stylex from "@stylexjs/stylex";

/**
 * Embed-safe StyleX styles.
 * Uses host tokens (shadcn / Tailwind v4) when present, with literal fallbacks.
 * Compiled with `classNamePrefix: "twc"` so atomics never collide with host StyleX.
 */
export const styles = stylex.create({
  root: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: 1.5,
    boxSizing: "border-box",
    color: "var(--foreground, var(--color-foreground, #0a0a0a))",
  },

  anchor: {
    position: "fixed",
    zIndex: 2147483000,
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
    borderColor: "var(--border, var(--color-border, #e5e5e5))",
    borderRadius: "var(--radius, var(--radius-md, 0.5rem))",
    backgroundColor: "var(--card, var(--color-card, #ffffff))",
    color: "var(--card-foreground, var(--color-card-foreground, #0a0a0a))",
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.25,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgb(0 0 0 / 6%), 0 4px 12px rgb(0 0 0 / 8%)",
  },
  triggerHover: {
    ":hover": {
      backgroundColor: "var(--muted, var(--color-muted, #f5f5f5))",
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
    borderColor: "var(--border, var(--color-border, #e5e5e5))",
    backgroundColor: "var(--card, var(--color-card, #ffffff))",
    color: "var(--card-foreground, var(--color-card-foreground, #0a0a0a))",
    boxShadow: "0 16px 48px rgb(0 0 0 / 18%)",
    boxSizing: "border-box",
  },
  panelDialog: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(24rem, calc(100vw - 2rem))",
    maxHeight: "min(32rem, calc(100vh - 2rem))",
    borderRadius: "var(--radius, var(--radius-lg, 0.75rem))",
    overflowY: "auto",
  },
  panelSheet: {
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxHeight: "min(70vh, 32rem)",
    borderTopLeftRadius: "var(--radius, var(--radius-lg, 0.75rem))",
    borderTopRightRadius: "var(--radius, var(--radius-lg, 0.75rem))",
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
    color: "var(--muted-foreground, var(--color-muted-foreground, #737373))",
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
    borderRadius: "var(--radius, var(--radius-md, 0.5rem))",
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
    color: "var(--primary, var(--color-primary, #171717))",
  },
  body: {
    margin: 0,
    fontSize: "0.9375rem",
  },
  meta: {
    margin: 0,
    fontSize: "0.8125rem",
    color: "var(--muted-foreground, var(--color-muted-foreground, #737373))",
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
    borderColor: "var(--border, var(--color-border, #e5e5e5))",
    borderRadius: "var(--radius, var(--radius-md, 0.5rem))",
    backgroundColor: "var(--muted, var(--color-muted, #f5f5f5))",
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
    borderRadius: "var(--radius, var(--radius-md, 0.5rem))",
    backgroundColor: "var(--primary, var(--color-primary, #171717))",
    color: "var(--primary-foreground, var(--color-primary-foreground, #fafafa))",
    fontSize: "0.875rem",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },
});

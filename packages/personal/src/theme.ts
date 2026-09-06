import { defineTheme, type DefinedTheme } from "@astryxdesign/core/theme";

/**
 * Nested `var()` chain: prefer host tokens, then a literal fallback.
 * Supports classic shadcn (`--primary`) and Tailwind v4 (`--color-primary`).
 */
function token(...parts: string[]): string {
  if (parts.length < 2) {
    throw new Error("token() requires at least one CSS variable and a fallback");
  }
  const fallback = parts.at(-1)!;
  return parts.slice(0, -1).reduceRight((acc, name) => `var(${name}, ${acc})`, fallback);
}

/**
 * Astryx theme that reads shadcn / host CSS variables when present,
 * with self-contained fallbacks for embeds that have no design tokens yet.
 */
export const creditTheme: DefinedTheme = defineTheme({
  name: "tigawanna-credit",
  tokens: {
    "--color-accent": token("--primary", "--color-primary", "#171717"),
    "--color-accent-muted": token("--muted", "--color-muted", "#f5f5f5"),
    "--color-on-accent": token(
      "--primary-foreground",
      "--color-primary-foreground",
      "#fafafa",
    ),
    "--color-background-body": token("--background", "--color-background", "#fafafa"),
    "--color-background-surface": token(
      "--card",
      "--color-card",
      "--background",
      "--color-background",
      "#ffffff",
    ),
    "--color-background-card": token(
      "--card",
      "--color-card",
      "--background",
      "--color-background",
      "#ffffff",
    ),
    "--color-background-popover": token(
      "--popover",
      "--color-popover",
      "--card",
      "--color-card",
      "#ffffff",
    ),
    "--color-background-muted": token("--muted", "--color-muted", "#f5f5f5"),
    "--color-text-primary": token(
      "--card-foreground",
      "--color-card-foreground",
      "--foreground",
      "--color-foreground",
      "#0a0a0a",
    ),
    "--color-text-secondary": token(
      "--muted-foreground",
      "--color-muted-foreground",
      "#737373",
    ),
    "--color-text-accent": token("--primary", "--color-primary", "#171717"),
    "--color-border": token("--border", "--color-border", "#e5e5e5"),
    "--color-border-emphasized": token("--border", "--color-border", "#d4d4d4"),
    "--color-overlay": token("--foreground", "--color-foreground", "#0a0a0a66"),
    "--color-icon-primary": token("--foreground", "--color-foreground", "#0a0a0a"),
    "--color-icon-secondary": token(
      "--muted-foreground",
      "--color-muted-foreground",
      "#737373",
    ),
    "--color-icon-accent": token("--primary", "--color-primary", "#171717"),
    "--radius-container": token("--radius", "--radius-lg", "0.75rem"),
    "--radius-element": token("--radius", "--radius-md", "0.5rem"),
    "--radius-inner": token("--radius-sm", "--radius", "0.375rem"),
  },
});

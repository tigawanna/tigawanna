import type { GlobalProvider } from "@ladle/react";
import "../src/ladle-styles";

/**
 * Shared Ladle shell — Astryx theme CSS + StyleX via unplugin-stylex.
 * @see https://ladle.dev/docs/setup
 * @see https://astryx.atmeta.com/docs/getting-started
 */
export const Provider: GlobalProvider = ({ children }) => (
  <div style={{ minHeight: "100vh", position: "relative" }}>{children}</div>
);

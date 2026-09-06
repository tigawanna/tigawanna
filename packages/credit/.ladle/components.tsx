import type { GlobalProvider } from "@ladle/react";

/**
 * Shared Ladle shell. StyleX is compiled by `unplugin-stylex/vite`
 * (see `vite.config.mjs`); published CSS is also mirrored to `/credit.css`.
 */
export const Provider: GlobalProvider = ({ children }) => (
  <div style={{ minHeight: "100vh", position: "relative" }}>{children}</div>
);

"use client";

import dynamic from "next/dynamic";

const LandingScrollFab = dynamic(
  () => import("./LandingScrollFab").then((mod) => ({ default: mod.LandingScrollFab })),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * Below-the-fold FAB — code-split and skip SSR (not in LCP).
 */
export function LandingScrollFabDeferred() {
  return <LandingScrollFab />;
}

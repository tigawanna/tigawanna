import type { ReactNode } from "react";
import { ViewTransition } from "react";

interface DirectionalPageTransitionProps {
  children: ReactNode;
}

/**
 * Page-level enter/exit slides keyed to Next `transitionTypes` (`nav-forward` / `nav-back`).
 * Place on page components — not layouts — so nested page VTs still fire.
 */
export function DirectionalPageTransition({ children }: DirectionalPageTransitionProps) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}

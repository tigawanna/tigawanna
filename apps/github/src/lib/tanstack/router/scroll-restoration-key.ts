import type { ParsedLocation } from "@tanstack/react-router";

/**
 * Provides the key TanStack Router uses to save/restore scroll positions.
 */
export function getScrollRestorationKey(location: ParsedLocation) {
  return location.pathname;
}

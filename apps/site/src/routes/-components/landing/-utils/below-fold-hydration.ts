import type { HydrateOptions } from "@tanstack/react-start";
import { visible } from "@tanstack/react-start/hydration";

export const belowFoldHydration = {
  when: visible({ rootMargin: "400px" }),
} satisfies HydrateOptions;

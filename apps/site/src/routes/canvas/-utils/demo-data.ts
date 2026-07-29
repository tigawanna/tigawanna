import { queryOptions } from "@tanstack/react-query";

export const DEMO_COLORS = [
  { name: "red", value: "#FF0000" },
  { name: "green", value: "#00FF00" },
  { name: "blue", value: "#0000FF" },
  { name: "yellow", value: "#FFFF00" },
] as const;

/**
 * Artificial delay so Suspense / isFetching is easy to see in demos.
 */
export function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Fake list fetch keyed by color (search-param style).
 */
export async function fetchDemoItems(color: string) {
  await delay(900);
  return [1, 2, 3].map((n) => ({
    id: `${color}-${n}`,
    label: `${color} item ${n}`,
    value: DEMO_COLORS.find((c) => c.name === color)?.value ?? color,
  }));
}

/**
 * Query options for the canvas Suspense demos.
 */
export function demoItemsQueryOptions(color: string) {
  return queryOptions({
    queryKey: ["canvas-demo-items", color],
    queryFn: () => fetchDemoItems(color),
    staleTime:1000 * 60 * 60
  });
}

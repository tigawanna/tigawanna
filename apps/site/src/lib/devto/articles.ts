import type { DevtoArticles } from "@/types/devto";
import { getWorkerEnv } from "@/lib/worker-env";
import { createServerFn } from "@tanstack/react-start";

export const getDevtoArticles = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = getWorkerEnv().DEV_TO_KEY;
  if (!apiKey) {
    return [] as DevtoArticles;
  }

  try {
    const response = await fetch("https://dev.to/api/articles?username=tigawanna&per_page=4", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return [] as DevtoArticles;
    }

    return (await response.json()) as DevtoArticles;
  } catch {
    return [] as DevtoArticles;
  }
});

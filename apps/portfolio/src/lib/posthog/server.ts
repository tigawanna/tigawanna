import { getServerEnv } from "@/lib/envs/server-env";
import { DEFAULT_POSTHOG_HOST } from "@/lib/posthog/constants";
import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

/**
 * Returns a singleton PostHog server client for trusted server-side analytics.
 * Returns `null` when `POSTHOG_API_KEY` is not configured.
 */
export function getPostHogClient(): PostHog | null {
  const env = getServerEnv();
  const apiKey = env.POSTHOG_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(apiKey, {
      host: env.POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

import { PostHogUserIdentity } from "@/components/posthog/PostHogUserIdentity";
import { clientEnv } from "@/lib/envs/client-env";
import { DEFAULT_POSTHOG_HOST } from "@/lib/posthog/constants";
import { PostHogProvider } from "@posthog/react";

/**
 * Enables PostHog client analytics when `VITE_POSTHOG_KEY` is configured.
 */
export function PostHogRoot({ children }: { children: React.ReactNode }) {
  const apiKey = clientEnv.VITE_POSTHOG_KEY;

  if (!apiKey) {
    return children;
  }

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{
        api_host: clientEnv.VITE_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
        defaults: "2026-05-30",
        capture_exceptions: true,
      }}
    >
      <PostHogUserIdentity />
      {children}
    </PostHogProvider>
  );
}

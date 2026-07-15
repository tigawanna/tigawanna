import { usePostHog } from "@posthog/react";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";

const rootRoute = getRouteApi("__root__");

/**
 * Links the current route viewer to PostHog and clears identity on sign-out.
 */
export function PostHogUserIdentity() {
  const posthog = usePostHog();
  const { viewer } = rootRoute.useRouteContext();

  useEffect(() => {
    if (!posthog) {
      return;
    }

    if (viewer) {
      posthog.identify(viewer.id, {
        email: viewer.email,
        name: viewer.name,
        role: viewer.role,
      });
      return;
    }

    posthog.reset();
  }, [posthog, viewer]);

  return null;
}

import { usePostHog } from "@posthog/react";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const rootRoute = getRouteApi("__root__");

/**
 * Links the current route viewer to PostHog and clears identity on sign-out.
 */
export function PostHogUserIdentity() {
  const posthog = usePostHog();
  const { viewer } = rootRoute.useRouteContext();
  const lastIdentifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog) {
      return;
    }

    const viewerId = viewer?.id ?? null;

    if (viewerId === lastIdentifiedRef.current) {
      return;
    }

    lastIdentifiedRef.current = viewerId;

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

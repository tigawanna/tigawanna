import {
  pinnedReposQueryOptions,
  recentReposQueryOptions,
} from "@/data-access-layer/portfolio/landng-page-query-options";
import { sendContactMessage } from "@/routes/-components/landing/sections/contact/contact.functions";
import type { LandingRuntime } from "@repo/ui/landing";

/**
 * Host adapters for `@repo/ui/landing` — query options + contact server fn.
 * Presentation lives in the package; apps only wire data.
 */
export function createLandingRuntime(): LandingRuntime {
  return {
    pinnedReposQueryOptions: {
      queryKey: pinnedReposQueryOptions.queryKey,
      queryFn: pinnedReposQueryOptions.queryFn,
      staleTime: pinnedReposQueryOptions.staleTime,
    },
    recentReposQueryOptions: {
      queryKey: recentReposQueryOptions.queryKey,
      queryFn: recentReposQueryOptions.queryFn,
      staleTime: recentReposQueryOptions.staleTime,
    },
    sendContactMessage: async (values) => sendContactMessage({ data: values }),
  };
}

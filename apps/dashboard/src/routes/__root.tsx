import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import appCss from "../styles.css?url";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TanstackDevtools } from "@/lib/tanstack/devtools/devtools";
import type { QueryClient } from "@tanstack/react-query";
import { z } from "zod";
import type { TViewer } from "@/data-access-layer/auth/viewer";
import { rootServerMiddleware } from "@/middleware/root.server";

interface MyRouterContext {
  queryClient: QueryClient;
  viewer?: TViewer;
  testValue?: string;
}

const searchparams = z.object({
  globalPage: z.number().optional(),
  globalSearch: z.string().optional(),
});

/**
 * Dashboard preview shell — minimal head, noindex.
 * Canonical SEO + PostHog live in `apps/portfolio`.
 */
export const Route = createRootRouteWithContext<MyRouterContext>()({
  server: {
    middleware: [...rootServerMiddleware],
  },

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dashboard (preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  validateSearch: (search) => searchparams.parse(search),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="wanna" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          {children}
          <TanstackDevtools />
          <Toaster />
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  );
}

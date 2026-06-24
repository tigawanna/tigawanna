import type { TViewer } from "@/data-access-layer/auth/viewer";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import appCss from "../styles.css?url";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TanstackDevtools } from "@/lib/tanstack/devtools/devtools";
import { AppConfig } from "@/utils/system";
import type { QueryClient } from "@tanstack/react-query";
import { z } from "zod";

interface MyRouterContext {
  queryClient: QueryClient;
  viewer?: TViewer;
  testValue?: string;
}

const searchparams = z.object({
  globalPage: z.number().optional(),
  globalSearch: z.string().optional(),
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: AppConfig.name,
        description: AppConfig.description,
        keywords:
          "fullstack developer, JavaScript, React, TanStack Start, TypeScript, web development, Nairobi, tigawanna",
        og: {
          title: AppConfig.name,
          description: AppConfig.description,
          url: AppConfig.links.website,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          site: "@tigawanna",
          creator: "@tigawanna",
        },
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
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

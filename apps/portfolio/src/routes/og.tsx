import { JournalOgImage } from "@/lib/takumi/journal-og-image";
import { formatLessonTypeLabel, truncateSeoText } from "@/utils/lesson-seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/og")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { ImageResponse } = await import("takumi-js/response");
        const { googleFonts } = await import("takumi-js/helpers");

        const url = new URL(request.url);
        const title = truncateSeoText(url.searchParams.get("title") ?? "Today I Learned", 110);
        const description = truncateSeoText(
          url.searchParams.get("description") ?? "Pearls of wisdom gathered along the way.",
          160,
        );
        const typeLabel = formatLessonTypeLabel(url.searchParams.get("type") ?? "Journal");

        const response = new ImageResponse(
          <JournalOgImage
            title={title}
            description={description}
            typeLabel={typeLabel}
            siteLabel="tigawanna"
          />,
          {
            width: 1200,
            height: 630,
            fonts: googleFonts([
              { name: "Fraunces", weight: [600, 700] },
              { name: "Space Grotesk", weight: [400, 500] },
            ]),
            headers: {
              "Cache-Control": "public, max-age=86400, s-maxage=604800",
              // Browser OG inspectors fetch the image cross-origin to render a preview.
              "Access-Control-Allow-Origin": "*",
              "Cross-Origin-Resource-Policy": "cross-origin",
            },
          },
        );

        try {
          await response.ready;
          return response;
        } catch {
          return new Response("Failed to generate OG image", { status: 500 });
        }
      },
    },
  },
});

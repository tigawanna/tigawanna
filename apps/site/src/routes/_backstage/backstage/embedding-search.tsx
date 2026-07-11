import { projectEmbeddingSearchStatsQueryOptions } from "@/data-access-layer/backstage/enrich/embedding-search-query-options";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const EmbeddingSearchLab = lazy(() =>
  import("@/routes/_backstage/backstage/-components/embeddings/EmbeddingSearchLab").then(
    (module) => ({ default: module.EmbeddingSearchLab }),
  ),
);

export const Route = createFileRoute("/_backstage/backstage/embedding-search")({
  beforeLoad: ({ context }) => {
    if (context.viewer?.role !== "admin") {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(projectEmbeddingSearchStatsQueryOptions),
  component: BackstageEmbeddingSearchPage,
});

function BackstageEmbeddingSearchPage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={<p className="text-base-content/60 text-sm">Loading embedding search lab…</p>}
      >
        <EmbeddingSearchLab />
      </Suspense>
    </div>
  );
}

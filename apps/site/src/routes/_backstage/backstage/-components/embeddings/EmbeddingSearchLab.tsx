import {
  projectEmbeddingSearchStatsQueryOptions,
  searchProjectEmbeddingsByVectorMutationOptions,
} from "@/data-access-layer/backstage/embedding-search-query-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoadEmbeddingGemma } from "@/lib/embedding-gemma/use-load-embedding-gemma";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Backstage lab: embed queries in the browser, search indexed projects on the server.
 */
export function EmbeddingSearchLab() {
  const { data: stats } = useSuspenseQuery(projectEmbeddingSearchStatsQueryOptions);
  const [query, setQuery] = useState("");
  const { model, modelStatus, modelProgress, loadModel } = useLoadEmbeddingGemma();

  const searchMutation = useMutation({
    ...searchProjectEmbeddingsByVectorMutationOptions,
    onError(err) {
      toast.error("Search failed", { description: unwrapUnknownError(err).message });
    },
  });

  const runSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("Enter a search query");
      return;
    }
    if (!model?.isLoaded()) {
      toast.error("Load the browser model first");
      return;
    }
    if (stats.indexedCount === 0) {
      toast.error("No indexed embeddings in the database yet");
      return;
    }

    try {
      console.time("embedQuery");
      const { embedQuery } = await import("@repo/gemma-embedding/web");
      const queryEmbedding = await embedQuery(model, trimmed);
      searchMutation.mutate({ queryEmbedding, query: trimmed, limit: 10 });
      console.timeEnd("embedQuery");
    } catch (err: unknown) {
      toast.error("Failed to embed query", { description: unwrapUnknownError(err).message });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Embedding search lab</CardTitle>
          <CardDescription>
            Test semantic search: embed your query in the browser (WASM), then rank{" "}
            <code className="text-xs">project_embeddings</code> on the server. Run the embed CLI
            locally to index repos first.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-base-content/70 text-sm" data-test="embedding-search-stats">
            Indexed projects: <strong>{stats.indexedCount}</strong> · model{" "}
            <strong>{stats.modelId}</strong> · {stats.dimensions} dimensions
          </p>

          <div className="flex flex-wrap items-end gap-3">
            <Button
              type="button"
              variant="outline"
              data-test="embedding-search-load-model"
              disabled={modelStatus === "loading" || modelStatus === "ready"}
              onClick={loadModel}
            >
              {modelStatus === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading model…
                </>
              ) : modelStatus === "ready" ? (
                "Model ready"
              ) : (
                "Load browser model"
              )}
            </Button>
            {modelProgress ? (
              <span className="text-base-content/60 text-sm">{modelProgress}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="embedding-search-query">Search query</Label>
            <div className="flex gap-2">
              <Input
                id="embedding-search-query"
                data-test="embedding-search-query"
                value={query}
                placeholder="e.g. react monorepo portfolio site"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void runSearch();
                  }
                }}
              />
              <Button
                type="button"
                data-test="embedding-search-submit"
                disabled={searchMutation.isPending || modelStatus !== "ready"}
                onClick={() => void runSearch()}
              >
                {searchMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searchMutation.data ? (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Query:{" "}
              <span className="font-medium">{searchMutation.data.query ?? "(vector only)"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {searchMutation.data.results.length === 0 ? (
              <p className="text-base-content/60 text-sm">No matches.</p>
            ) : (
              searchMutation.data.results.map((hit) => (
                <div
                  key={hit.githubRepoId}
                  className="border-base-content/10 rounded-lg border p-4"
                  data-test="embedding-search-result"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to="/backstage/projects/$owner/$repo"
                      params={{
                        owner: hit.repoFullName.split("/")[0] ?? "",
                        repo: hit.repoFullName.split("/")[1] ?? "",
                      }}
                      className="font-medium hover:underline"
                    >
                      {hit.repoFullName}
                    </Link>
                    <span className="text-base-content/60 text-sm">
                      score {(hit.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  {hit.description ? (
                    <p className="text-base-content/80 mt-2 text-sm">{hit.description}</p>
                  ) : null}
                  {hit.topics.length > 0 ? (
                    <p className="text-base-content/60 mt-2 text-xs">{hit.topics.join(", ")}</p>
                  ) : null}
                  <p className="text-base-content/50 mt-2 line-clamp-2 text-xs">{hit.embedText}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

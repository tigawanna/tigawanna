import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  projectEmbeddingSearchStatsQueryOptions,
  searchProjectEmbeddingsByVectorQueryOptions,
  type SearchProjectEmbeddingsRequest,
} from "@/data-access-layer/backstage/enrich/embedding-search-query-options";
import { useLoadEmbeddingGemma } from "@/lib/embedding-gemma/use-load-embedding-gemma";
import { unwrapUnknownError } from "@/utils/errors";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Backstage lab: embed queries in the browser, search indexed projects on the server.
 */
export function EmbeddingSearchLab() {
  const { data: stats } = useSuspenseQuery(projectEmbeddingSearchStatsQueryOptions);
  const [query, setQuery] = useState("");
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [searchRequest, setSearchRequest] = useState<SearchProjectEmbeddingsRequest | null>(null);
  const { model, modelStatus, modelProgress, loadModel } = useLoadEmbeddingGemma();

  const searchQuery = useQuery(searchProjectEmbeddingsByVectorQueryOptions(searchRequest));

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

    setIsEmbedding(true);
    try {
      const { embedQuery } = await import("@repo/gemma-embedding/web");
      const queryEmbedding = await embedQuery(model, trimmed);
      setSearchRequest({
        input: { queryEmbedding, query: trimmed, limit: 10 },
        requestId: Date.now(),
      });
    } catch (err: unknown) {
      toast.error("Failed to embed query", { description: unwrapUnknownError(err).message });
    } finally {
      setIsEmbedding(false);
    }
  };

  const isSearching = isEmbedding || searchQuery.isFetching;

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
              />
              <Button
                type="button"
                data-test="embedding-search-submit"
                disabled={isSearching || modelStatus !== "ready"}
                onClick={() => void runSearch()}
              >
                {isSearching ? (
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

      {searchQuery.isError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              {unwrapUnknownError(searchQuery.error).message}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {searchQuery.data ? (
        <Card>
          <CardHeader>
            <CardTitle>Raw results</CardTitle>
            <CardDescription>
              Query:{" "}
              <span className="font-medium">{searchQuery.data.query ?? "(vector only)"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre
              className="bg-base-200 max-h-128 overflow-auto rounded-lg p-4 text-xs"
              data-test="embedding-search-raw-results"
            >
              {JSON.stringify(searchQuery.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

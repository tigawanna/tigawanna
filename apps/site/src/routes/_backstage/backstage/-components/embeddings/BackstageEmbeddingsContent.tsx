import {
  projectEmbeddingsListQueryOptions,
  projectEmbeddingStatsQueryOptions,
} from "@/data-access-layer/embeddings/query-options";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearProjectEmbeddings,
  indexProjectEmbeddingsBatch,
  searchProjectEmbeddings,
  warmEmbeddingModel,
} from "@/modules/backstage/embeddings.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SearchResult = Awaited<ReturnType<typeof searchProjectEmbeddings>>["results"][number];

function formatSimilarity(value: number) {
  return value.toFixed(3);
}

export function BackstageEmbeddingsContent() {
  const queryClient = useQueryClient();
  const { data: stats } = useSuspenseQuery(projectEmbeddingStatsQueryOptions);
  const { data: indexedProjects } = useSuspenseQuery(projectEmbeddingsListQueryOptions);

  const [indexLimit, setIndexLimit] = useState("100");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [indexProgress, setIndexProgress] = useState<{
    processed: number;
    remaining: number;
  } | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [queryKeyPrefixes.backstage, "embeddings"] });
  };

  const warmModelMutation = useMutation({
    mutationFn: () => warmEmbeddingModel(),
    onSuccess(result) {
      toast.success("Embedding model ready", {
        description: `${result.modelId} · ${result.dimensions} dimensions`,
      });
    },
    onError(err: unknown) {
      toast.error("Failed to load embedding model", {
        description: unwrapUnknownError(err).message,
      });
    },
  });

  const indexMutation = useMutation({
    mutationFn: async () => {
      const limit = Number.parseInt(indexLimit, 10);
      if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
        throw new Error("Limit must be between 1 and 100");
      }

      setIndexProgress({ processed: 0, remaining: limit });

      let remaining = limit;
      let processedTotal = 0;

      while (remaining > 0) {
        const result = await indexProjectEmbeddingsBatch({
          data: { limit, batchSize: 5 },
        });

        processedTotal += result.processed.length;
        remaining = result.remaining;
        setIndexProgress({ processed: processedTotal, remaining });

        if (result.processed.length === 0) {
          break;
        }
      }

      return { processedTotal };
    },
    onSuccess(result) {
      toast.success("Indexing complete", {
        description: `${result.processedTotal} project${result.processedTotal === 1 ? "" : "s"} embedded`,
      });
      setIndexProgress(null);
      invalidate();
    },
    onError(err: unknown) {
      toast.error("Indexing failed", {
        description: unwrapUnknownError(err).message,
      });
      setIndexProgress(null);
    },
  });

  const searchMutation = useMutation({
    mutationFn: (query: string) => searchProjectEmbeddings({ data: { query, limit: 10 } }),
    onSuccess(result) {
      setSearchResults(result.results);
      if (result.results.length === 0) {
        toast.message("No matches", { description: "Try a different query." });
      }
    },
    onError(err: unknown) {
      toast.error("Search failed", {
        description: unwrapUnknownError(err).message,
      });
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => clearProjectEmbeddings(),
    onSuccess() {
      toast.success("Embeddings cleared");
      setSearchResults([]);
      invalidate();
    },
    onError(err: unknown) {
      toast.error("Failed to clear embeddings", {
        description: unwrapUnknownError(err).message,
      });
    },
  });

  const isIndexing = indexMutation.isPending;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-embeddings">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Embeddings</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Local EmbeddingGemma experiment — index GitHub projects in Turso and search by semantic
          similarity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Indexed projects</CardDescription>
            <CardTitle className="text-3xl">{stats.indexedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Model</CardDescription>
            <CardTitle className="text-lg">{stats.modelId}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dimensions</CardDescription>
            <CardTitle className="text-3xl">{stats.dimensions}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card data-test="embedding-index-panel">
        <CardHeader>
          <CardTitle>Index projects</CardTitle>
          <CardDescription>
            Fetches your most recently pushed public GitHub repos, embeds them with document mode,
            and stores vectors in Turso.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="index-limit">Repo limit</Label>
              <Input
                id="index-limit"
                type="number"
                min={1}
                max={100}
                value={indexLimit}
                onChange={(event) => setIndexLimit(event.target.value)}
                className="w-32"
                data-test="embedding-index-limit"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => warmModelMutation.mutate()}
              disabled={warmModelMutation.isPending || isIndexing}
              data-test="embedding-warm-model"
            >
              {warmModelMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading model…
                </>
              ) : (
                "Preload model"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => indexMutation.mutate()}
              disabled={isIndexing}
              data-test="embedding-start-index"
            >
              {isIndexing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Indexing…
                </>
              ) : (
                "Index from GitHub"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || stats.indexedCount === 0}
              data-test="embedding-clear"
            >
              Clear all
            </Button>
          </div>

          {indexProgress ? (
            <p className="text-base-content/60 text-sm" data-test="embedding-index-progress">
              Embedded {indexProgress.processed}
              {indexProgress.remaining > 0 ? ` · ${indexProgress.remaining} remaining` : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card data-test="embedding-search-panel">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Embeds your query in search mode and ranks indexed projects by cosine similarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            className="flex flex-wrap gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const query = searchQuery.trim();
              if (!query) {
                return;
              }
              searchMutation.mutate(query);
            }}
          >
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="e.g. react dashboard, mobile app, machine learning"
              className="max-w-xl flex-1"
              data-test="embedding-search-input"
            />
            <Button
              type="submit"
              disabled={searchMutation.isPending || stats.indexedCount === 0}
              data-test="embedding-search-submit"
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Searching…
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>

          {searchResults.length > 0 ? (
            <div className="divide-base-content/10 divide-y rounded-lg border border-base-content/10">
              {searchResults.map((result) => (
                <div
                  key={result.githubRepoId}
                  className="space-y-1 px-4 py-3"
                  data-test="embedding-search-result"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{result.repoFullName}</p>
                    <span className="text-base-content/60 font-mono text-sm">
                      {formatSimilarity(result.similarity)}
                    </span>
                  </div>
                  {result.description ? (
                    <p className="text-base-content/70 text-sm">{result.description}</p>
                  ) : null}
                  {result.topics.length > 0 ? (
                    <p className="text-base-content/50 text-xs">{result.topics.join(" · ")}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {indexedProjects.length > 0 ? (
        <Card data-test="embedding-indexed-list">
          <CardHeader>
            <CardTitle>Indexed corpus</CardTitle>
            <CardDescription>{indexedProjects.length} projects stored in Turso.</CardDescription>
          </CardHeader>
          <CardContent className="divide-base-content/10 max-h-96 divide-y overflow-y-auto rounded-lg border border-base-content/10 p-0">
            {indexedProjects.map((project) => (
              <div key={project.githubRepoId} className="space-y-1 px-4 py-3">
                <p className="font-medium">{project.repoFullName}</p>
                <p className="text-base-content/60 line-clamp-2 text-sm">{project.embedText}</p>
                <p className="text-base-content/40 text-xs">
                  Embedded {format(new Date(project.embeddedAt), "PP p")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

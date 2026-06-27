import {
  approveProjectEnrichmentSuggestion,
  rejectProjectEnrichmentSuggestion,
} from "@/modules/backstage/projects-enrichment.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type Suggestion = Awaited<
  ReturnType<
    typeof import("@/modules/backstage/projects-enrichment.functions").listProjectEnrichmentSuggestions
  >
>[number];

export function SuggestionReviewCard({
  suggestion,
  onDone,
}: {
  suggestion: Suggestion;
  onDone: () => void;
}) {
  const [description, setDescription] = useState(suggestion.suggestedDescription ?? "");
  const [homepage, setHomepage] = useState(suggestion.suggestedHomepage ?? "");
  const [topics, setTopics] = useState(suggestion.suggestedTopics.join(", "));

  const approve = useMutation({
    mutationFn: approveProjectEnrichmentSuggestion,
    onSuccess() {
      toast.success("Applied to GitHub");
      onDone();
    },
    onError(err: unknown) {
      toast.error("Approve failed", { description: unwrapUnknownError(err).message });
    },
    meta: {
      invalidates: [["backstage", "project-enrichment"]],
    },
  });

  const reject = useMutation({
    mutationFn: rejectProjectEnrichmentSuggestion,
    onSuccess() {
      toast.success("Suggestion rejected");
      onDone();
    },
    onError(err: unknown) {
      toast.error("Reject failed", { description: unwrapUnknownError(err).message });
    },
    meta: {
      invalidates: [["backstage", "project-enrichment"]],
    },
  });

  return (
    <Card data-test="enrichment-suggestion-card">
      <CardHeader>
        <CardTitle>{suggestion.repoFullName}</CardTitle>
        <CardDescription>
          Current topics: {suggestion.currentTopics.join(", ") || "(none)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-base-content/60 text-xs font-medium uppercase">Current</p>
          <p className="text-sm">{suggestion.currentDescription || "(no description)"}</p>
          <p className="text-base-content/60 text-sm">
            {suggestion.currentHomepage || "(no homepage)"}
          </p>
          {suggestion.currentOgImageUrl ? (
            <img
              src={suggestion.currentOgImageUrl}
              alt=""
              className="max-h-32 rounded-lg border border-base-content/10 object-cover"
            />
          ) : null}
        </div>

        <div className="space-y-3">
          <p className="text-base-content/60 text-xs font-medium uppercase">Suggested</p>
          <Textarea
            data-test="suggestion-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />
          <Input
            data-test="suggestion-homepage"
            placeholder="https://..."
            value={homepage}
            onChange={(event) => setHomepage(event.target.value)}
          />
          <Input
            data-test="suggestion-topics"
            placeholder="topic-one, topic-two"
            value={topics}
            onChange={(event) => setTopics(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              data-test="approve-suggestion"
              disabled={approve.isPending || reject.isPending || description.trim().length === 0}
              onClick={() =>
                approve.mutate({
                  data: {
                    suggestionId: suggestion.id,
                    description,
                    homepage,
                    topics: topics
                      .split(",")
                      .map((topic) => topic.trim())
                      .filter((topic) => topic.length > 0),
                  },
                })
              }
            >
              Approve & apply
            </Button>
            <Button
              data-test="reject-suggestion"
              variant="outline"
              disabled={approve.isPending || reject.isPending}
              onClick={() => reject.mutate({ data: { suggestionId: suggestion.id } })}
            >
              Reject
            </Button>
          </div>
          {suggestion.applyError ? (
            <p className="text-error text-sm">{suggestion.applyError}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

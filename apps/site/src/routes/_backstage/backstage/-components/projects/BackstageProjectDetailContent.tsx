import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backstageProjectDetailQueryOptions } from "@/data-access-layer/backstage/projects/projects-query-options";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { cn } from "@/lib/utils";
import { triggerProjectEnrichmentRun } from "@/modules/backstage/projects-enrichment.functions";
import type {
  BackstageProject,
  BackstageProjectDetail,
  BackstageProjectEmbedding,
} from "@/modules/backstage/projects.functions";
import { EnrichmentReviewDialog } from "@/routes/_backstage/backstage/-components/projects/EnrichmentReviewDialog";
import { MonorepoPackagesList } from "@/routes/_backstage/backstage/-components/projects/MonorepoPackagesList";
import { attendanceLabel } from "@/routes/_backstage/backstage/-components/projects/helpers";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ExternalLink, Github, Globe, Loader, Pencil, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type BackstageProjectDetailContentProps = {
  repoFullName: string;
};

const readableBadgeClass = "border-base-content/25 bg-base-100/90 text-base-content shadow-sm";

/**
 * Returns high-contrast badge classes for project attendance states.
 */
function attendanceBadgeClass(attendance: BackstageProject["attendance"]) {
  switch (attendance) {
    case "complete":
      return "border-emerald-400/60 bg-emerald-950 text-emerald-50";
    case "pending_review":
      return "border-amber-400/60 bg-amber-950 text-amber-50";
    case "applied":
      return "border-sky-400/60 bg-sky-950 text-sky-50";
    default:
      return "border-base-content/30 bg-base-300 text-base-content";
  }
}

function TagList({ tags, testId }: { tags: string[]; testId?: string }) {
  if (tags.length === 0) {
    return <p className="text-base-content/60 text-sm">(none)</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2" data-test={testId}>
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant="outline" className={readableBadgeClass}>
            {tag}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function ProjectStatusBadges({
  project,
  embedding,
}: {
  project: BackstageProject;
  embedding: BackstageProjectEmbedding | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className={readableBadgeClass} data-test="project-status-badge">
        Imported
      </Badge>
      <Badge
        variant="outline"
        className={cn("capitalize", attendanceBadgeClass(project.attendance))}
        data-test="project-attendance-badge"
      >
        {attendanceLabel(project.attendance)}
      </Badge>
      {project.hasCustomSocialPreview ? (
        <Badge variant="outline" className={readableBadgeClass}>
          custom preview
        </Badge>
      ) : null}
      {project.enrichedByAi ? (
        <Badge
          variant="outline"
          className="border-violet-400/60 bg-violet-950 text-violet-50"
          data-test="project-ai-enriched-badge"
        >
          AI enriched
        </Badge>
      ) : null}
      {embedding ? (
        <Badge
          variant="outline"
          className="border-violet-400/60 bg-violet-950 text-violet-50"
          data-test="project-embedding-badge"
        >
          Embedded · {embedding.sourceCount} vectors
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border-base-content/20 bg-base-200/80 text-base-content/70"
          data-test="project-embedding-badge"
        >
          Not embedded
        </Badge>
      )}
    </div>
  );
}

/**
 * Returns high-contrast badge classes for enrichment source labels.
 */
function enrichmentSourceBadgeClass(
  source: NonNullable<BackstageProjectDetail["enrichment"]>["source"],
) {
  switch (source) {
    case "ai_suggestion":
    case "ai_record":
      return "border-violet-400/60 bg-violet-950 text-violet-50";
    default:
      return readableBadgeClass;
  }
}

/**
 * Human-readable label for how enrichment was resolved.
 */
function enrichmentSourceLabel(enrichment: NonNullable<BackstageProjectDetail["enrichment"]>) {
  switch (enrichment.source) {
    case "ai_suggestion":
      return "AI enriched";
    case "ai_record":
      return "AI enriched";
    default:
      return "Metadata complete";
  }
}

function EnrichmentSection({
  repoFullName,
  project,
  enrichment,
  embedding,
}: {
  repoFullName: string;
  project: BackstageProject;
  enrichment: BackstageProjectDetail["enrichment"];
  embedding: BackstageProjectEmbedding | null;
}) {
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);

  const needsReview = enrichment?.status === "pending_review" && enrichment.suggestionId != null;

  const enrichMutation = useMutation({
    mutationFn: () =>
      triggerProjectEnrichmentRun({
        data: { repos: [repoFullName], force: true },
      }),
    onSuccess() {
      toast.success("Enrichment workflow started", { description: repoFullName });
      void queryClient.invalidateQueries({
        queryKey: [queryKeyPrefixes.backstage, "projects", "detail", repoFullName],
      });
    },
    onError(err: unknown) {
      toast.error("Failed to start enrichment", {
        description: unwrapUnknownError(err).message,
      });
    },
  });

  const enrichButton = (
    <Button
      size="sm"
      className="gap-1.5"
      data-test="project-enrich-now"
      disabled={enrichMutation.isPending}
      onClick={() => enrichMutation.mutate()}
    >
      {enrichMutation.isPending ? (
        <Loader className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {enrichment ? "Re-run enrichment" : "Enrich now"}
    </Button>
  );

  const reviewButton = needsReview ? (
    <Button
      size="sm"
      variant="default"
      className="gap-1.5"
      data-test="project-review-enrichment"
      onClick={() => setReviewOpen(true)}
    >
      <Pencil className="size-3.5" />
      Review & apply
    </Button>
  ) : null;

  if (!enrichment) {
    return (
      <Card data-test="project-detail-enrichment">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Enrichment</CardTitle>
            <CardDescription>
              No description, tags, or vectors stored yet. Run enrichment to generate a brief
              summary, tags, and homepage suggestions.
            </CardDescription>
          </div>
          {enrichButton}
        </CardHeader>
      </Card>
    );
  }

  const showSuggestedDescription =
    enrichment.suggestedDescription != null &&
    enrichment.suggestedDescription.trim() !== "" &&
    enrichment.source !== "metadata";

  const showSuggestedTags =
    enrichment.suggestedTopics.length > 0 && enrichment.source !== "metadata";

  return (
    <>
      <Card data-test="project-detail-enrichment">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Enrichment</CardTitle>
              <Badge
                variant="outline"
                className={cn(enrichmentSourceBadgeClass(enrichment.source))}
                data-test="project-enrichment-source-badge"
              >
                {enrichmentSourceLabel(enrichment)}
              </Badge>
              {enrichment.source === "ai_suggestion" ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    enrichment.status === "pending_review"
                      ? attendanceBadgeClass("pending_review")
                      : readableBadgeClass,
                  )}
                >
                  {enrichment.status.replaceAll("_", " ")}
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              {needsReview ? (
                <>
                  AI suggestions are ready but not applied to GitHub yet. Use{" "}
                  <span className="text-base-content font-medium">Review & apply</span> to edit and
                  publish.
                </>
              ) : (
                <>
                  {enrichment.isAiEnriched ? "Enriched" : "Recorded"}{" "}
                  {format(new Date(enrichment.enrichedAt), "PPp")}
                  {enrichment.confidence ? (
                    <>
                      {" "}
                      · confidence desc {Math.round(enrichment.confidence.description * 100)}% /
                      tags {Math.round(enrichment.confidence.topics * 100)}%
                    </>
                  ) : null}
                  {embedding ? (
                    <> · embedded {format(new Date(embedding.embeddedAt), "PP")}</>
                  ) : null}
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {reviewButton}
            {enrichButton}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {enrichment.briefSummary ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">
                {enrichment.isAiEnriched ? "Enriched summary" : "Project summary"}
              </h3>
              <p
                className="text-base-content/80 text-sm leading-relaxed"
                data-test="project-brief-summary"
              >
                {enrichment.briefSummary}
              </p>
            </section>
          ) : null}

          <MonorepoPackagesList
            packages={enrichment.monorepoPackages}
            testId="project-monorepo-packages"
          />

          {showSuggestedDescription ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Suggested description</h3>
              <p className="text-base-content/80 text-sm leading-relaxed">
                {enrichment.suggestedDescription}
              </p>
            </section>
          ) : null}

          {showSuggestedTags ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Suggested tags</h3>
              <TagList tags={enrichment.suggestedTopics} testId="project-suggested-tags" />
            </section>
          ) : null}

          {enrichment.suggestedHomepage && enrichment.source !== "metadata" ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Suggested homepage</h3>
              <a
                href={enrichment.suggestedHomepage}
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
              >
                {enrichment.suggestedHomepage}
                <ExternalLink className="size-3.5" />
              </a>
            </section>
          ) : null}

          {embedding ? (
            <p className="text-base-content/60 text-sm">
              Vectors indexed {format(new Date(embedding.embeddedAt), "PPp")} via{" "}
              {embedding.modelId}.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {needsReview ? (
        <EnrichmentReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          repoFullName={repoFullName}
          project={project}
          enrichment={enrichment}
        />
      ) : null}
    </>
  );
}

export function BackstageProjectDetailContent({
  repoFullName,
}: BackstageProjectDetailContentProps) {
  const { data } = useSuspenseQuery(backstageProjectDetailQueryOptions(repoFullName));
  const { project, github, enrichment, embedding, readmeHtml } = data;
  const githubUrl = `https://github.com/${project.repoFullName}`;

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6"
      data-test="backstage-project-detail"
    >
      <Link
        to="/backstage/projects"
        className="text-primary text-sm hover:underline"
        data-test="project-detail-back"
      >
        ← Back to projects
      </Link>

      <div className="overflow-hidden rounded-lg border border-base-content/10 bg-base-200/30">
        {project.currentOgImageUrl ? (
          <img
            src={project.currentOgImageUrl}
            alt=""
            className="h-48 w-full object-cover md:h-64"
          />
        ) : null}

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight">{project.repoFullName}</h1>
              <ProjectStatusBadges project={project} embedding={embedding} />
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              {project.currentHomepage ? (
                <a
                  href={project.currentHomepage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  <Globe className="size-4" />
                  Homepage
                </a>
              ) : null}
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-1 hover:underline"
              >
                <Github className="size-4" />
                GitHub
              </a>
            </div>
          </div>

          <p className="text-base-content/90 text-base leading-relaxed">
            {project.currentDescription || github?.description || "(no description)"}
          </p>

          <TagList tags={project.currentTopics} testId="project-current-tags" />

          <div className="text-base-content/60 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>Synced {format(new Date(project.lastGithubSyncAt), "PP")}</span>
            <span>Added {format(new Date(project.createdAt), "PP")}</span>
            {project.lastAppliedAt ? (
              <span>Applied {format(new Date(project.lastAppliedAt), "PP")}</span>
            ) : null}
            {embedding ? (
              <span>
                Embedded {format(new Date(embedding.embeddedAt), "PP")} · {embedding.modelId}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <EnrichmentSection
        repoFullName={repoFullName}
        project={project}
        enrichment={enrichment}
        embedding={embedding}
      />

      <Card data-test="project-detail-readme">
        <CardHeader>
          <CardTitle>README</CardTitle>
          <CardDescription>Rendered from the repository default branch.</CardDescription>
        </CardHeader>
        <CardContent>
          {readmeHtml ? (
            <section
              className="markdown max-w-none"
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          ) : (
            <p className="text-base-content/60 text-sm">No README found on main or master.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

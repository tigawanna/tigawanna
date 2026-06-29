import { contactMessagesQueryOptions } from "@/data-access-layer/backstage/query-options";
import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/journal-query-options";
import {
  backstageGithubReposQueryOptions,
  backstageProjectsQueryOptions,
} from "@/data-access-layer/backstage/projects-query-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Inbox, LayoutGrid } from "lucide-react";

interface BackstageStatCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  value: number;
  valueLabel: string;
  highlights?: Array<{ label: string; value: number }>;
  actions: React.ReactNode;
  "data-test"?: string;
}

function BackstageStatCard({
  title,
  description,
  icon: Icon,
  value,
  valueLabel,
  highlights = [],
  actions,
  "data-test": dataTest,
}: BackstageStatCardProps) {
  return (
    <Card className="border-base-content/10 bg-base-200/30" data-test={dataTest}>
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="text-right">
            <p className="text-4xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="text-base-content/50 text-xs uppercase tracking-[0.14em]">{valueLabel}</p>
          </div>
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-1.5">{description}</CardDescription>
        </div>
        {highlights.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {highlights.map((highlight) => (
              <span
                key={highlight.label}
                className="bg-base-300/80 text-base-content/70 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums"
              >
                {highlight.value} {highlight.label}
              </span>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className={cn("flex flex-wrap gap-2")}>{actions}</CardContent>
    </Card>
  );
}

export function BackstageHomeContent() {
  const { data: messages } = useSuspenseQuery(contactMessagesQueryOptions);
  const { data: journalEntries } = useSuspenseQuery(journalEntriesQueryOptions);
  const { data: projects } = useSuspenseQuery(backstageProjectsQueryOptions);
  const { data: githubRepos } = useSuspenseQuery(backstageGithubReposQueryOptions);

  const importedRepoNames = new Set(projects.map((project) => project.repoFullName));
  const importableRepoCount = githubRepos.repos.filter(
    (repo) => !importedRepoNames.has(repo.nameWithOwner),
  ).length;
  const pinnedJournalCount = journalEntries.filter((entry) => entry.pinned).length;
  const completeProjectCount = projects.filter(
    (project) => project.attendance === "complete",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6" data-test="backstage-admin-home">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Backstage</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          {messages.length} messages · {projects.length} projects · {journalEntries.length} journal
          entries
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BackstageStatCard
          title="Messages"
          description="Contact form submissions saved to D1."
          icon={Inbox}
          value={messages.length}
          valueLabel="total"
          data-test="backstage-home-messages"
          actions={
            <Link to="/backstage/messages" className="btn btn-primary btn-sm">
              View messages
            </Link>
          }
        />

        <BackstageStatCard
          title="Projects"
          description="Repos imported into the database."
          icon={LayoutGrid}
          value={projects.length}
          valueLabel="imported"
          highlights={[
            ...(importableRepoCount > 0
              ? [{ label: "on GitHub to import", value: importableRepoCount }]
              : []),
            ...(completeProjectCount > 0
              ? [{ label: "complete on GitHub", value: completeProjectCount }]
              : []),
          ]}
          data-test="backstage-home-projects"
          actions={
            <>
              <Link to="/backstage/projects" className="btn btn-primary btn-sm">
                View projects
              </Link>
              <Link to="/backstage/repos" className="btn btn-ghost btn-sm">
                Import repos
              </Link>
            </>
          }
        />

        <BackstageStatCard
          title="Journal"
          description="Today-I-learned entries for the landing page and /lessons."
          icon={BookOpen}
          value={journalEntries.length}
          valueLabel="entries"
          highlights={
            pinnedJournalCount > 0 ? [{ label: "pinned", value: pinnedJournalCount }] : []
          }
          data-test="backstage-home-journal"
          actions={
            <Link to="/backstage/journal" className="btn btn-primary btn-sm">
              Manage journal
            </Link>
          }
        />
      </div>
    </div>
  );
}

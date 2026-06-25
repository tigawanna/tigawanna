import { getRepoDetail, getRepoReadmeHtml } from "@/lib/github/repo-detail";
import { LandingNavbar } from "@/routes/-components/landing/LandingNavbar";
import { LandingFooter } from "@/routes/-components/landing/LandingFooter";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { Github, Globe } from "lucide-react";
import { Suspense } from "react";

function parseProjectName(name: string) {
  const [owner, repo] = name.split("=>");
  if (!owner || !repo) {
    return null;
  }
  return { owner, repo };
}

const repoDetailQueryOptions = (owner: string, repo: string) =>
  queryOptions({
    queryKey: ["github", "repo", owner, repo],
    queryFn: async () => {
      const detail = await getRepoDetail({ data: { owner, repo } });
      if (!detail || detail.isPrivate) {
        throw new Error("Repository not found");
      }
      return detail;
    },
  });

const repoReadmeQueryOptions = (owner: string, repo: string) =>
  queryOptions({
    queryKey: ["github", "readme", owner, repo],
    queryFn: () => getRepoReadmeHtml({ data: { owner, repo } }),
  });

export const Route = createFileRoute("/project/$name")({
  loader: async ({ context, params }) => {
    const parsed = parseProjectName(params.name);
    if (!parsed) {
      throw redirect({ to: "/" });
    }

    try {
      await context.queryClient.ensureQueryData(repoDetailQueryOptions(parsed.owner, parsed.repo));
    } catch {
      throw redirect({ to: "/" });
    }
  },
  component: ProjectDetailPage,
});

function ProjectDetailContent({ owner, repo }: { owner: string; repo: string }) {
  const { data: project } = useSuspenseQuery(repoDetailQueryOptions(owner, repo));
  const { data: readmeHtml } = useSuspenseQuery(repoReadmeQueryOptions(owner, repo));

  const topics = project.repositoryTopics?.edges?.map((edge) => edge.node.topic.name) ?? [];
  const languages = project.languages?.edges ?? [];

  return (
    <article className="mx-auto max-w-5xl space-y-8" data-test="project-detail">
      <Link to="/" hash="projects" className="inline-flex text-sm text-primary hover:underline">
        Back to projects
      </Link>

      <div className="overflow-hidden rounded-[2rem] border border-base-content/10 bg-base-300/40">
        {project.openGraphImageUrl ? (
          <img
            src={project.openGraphImageUrl}
            alt={project.name}
            className="h-56 w-full object-cover md:h-72"
          />
        ) : null}

        <div className="space-y-6 p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-5xl font-semibold tracking-[-0.04em]">
                {project.name}
              </h1>
              <p className="mt-2 text-base-content/70">{project.nameWithOwner}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {project.homepageUrl ? (
                <a
                  href={project.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="size-4" />
                  Site
                </a>
              ) : null}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <Github className="size-4" />
                GitHub
              </a>
            </div>
          </div>

          {project.description ? (
            <p className="text-lg leading-8 text-base-content/80">{project.description}</p>
          ) : null}

          {topics.length ? (
            <ul className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <li
                  key={topic}
                  className="rounded-full border border-base-content/10 bg-base-content/5 px-3 py-1 text-xs"
                >
                  {topic}
                </li>
              ))}
            </ul>
          ) : null}

          {languages.length ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold tracking-[0.2em] text-base-content/60 uppercase">
                Languages
              </h2>
              <div className="flex h-3 overflow-hidden rounded-full bg-base-200">
                {languages.map((lang) => (
                  <div
                    key={lang.node.name}
                    style={{
                      width: `${(lang.size / project.languages.totalSize) * 100}%`,
                      backgroundColor: lang.node.color,
                    }}
                    title={lang.node.name}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {readmeHtml ? (
        <section className="markdown rounded-[2rem] border border-base-content/10 bg-base-300/40 p-6 md:p-10">
          <div dangerouslySetInnerHTML={{ __html: readmeHtml }} />
        </section>
      ) : null}
    </article>
  );
}

function ProjectDetailPage() {
  const { name } = Route.useParams();
  const parsed = parseProjectName(name);

  if (!parsed) {
    return null;
  }

  return (
    <div data-test="project-detail-page" className="min-h-screen bg-base-100 text-base-content">
      <LandingNavbar />
      <main className="container py-24">
        <Suspense
          fallback={
            <div className="mx-auto max-w-5xl animate-pulse space-y-4">
              <div className="h-72 rounded-[2rem] bg-base-300" />
              <div className="h-40 rounded-[2rem] bg-base-300" />
            </div>
          }
        >
          <ProjectDetailContent owner={parsed.owner} repo={parsed.repo} />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}

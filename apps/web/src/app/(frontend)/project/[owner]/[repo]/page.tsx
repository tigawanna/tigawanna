import { Suspense, ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Github, Globe } from "lucide-react";
import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/components/landing/data/static";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import type { GithubRepoNode } from "@/components/landing/types/github";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";
import { projectImageVtName } from "@/components/view-transitions/names";

/**
 * Resolves owner/repo path segments to a static fixture.
 */
function findStaticRepo(owner: string, repo: string): GithubRepoNode | null {
  const nameWithOwner = `${decodeURIComponent(owner)}/${decodeURIComponent(repo)}`;
  const all = [...STATIC_PINNED_PROJECTS, ...STATIC_RECENT_PROJECTS];
  return all.find((item) => item.nameWithOwner === nameWithOwner || item.name === repo) ?? null;
}

async function ProjectDetail({ params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = await params;
  const project = findStaticRepo(owner, repo);
  if (!project) notFound();

  const topics = project.repositoryTopics?.nodes?.map((node) => node.topic.name) ?? [];

  return (
    <ViewTransition enter="slide-up" default="none">
      <div data-test="project-detail-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen py-24">
          <article className="mx-auto max-w-5xl space-y-8 px-6" data-test="project-detail">
            <Link
              href="/#projects"
              transitionTypes={["nav-back"]}
              className="inline-flex text-sm text-primary hover:underline"
            >
              Back to projects
            </Link>

            <div className="overflow-hidden rounded-none border border-base-content/10 bg-base-300/40">
              <ViewTransition
                name={projectImageVtName(project.nameWithOwner)}
                share="morph"
                default="none"
              >
                {project.openGraphImageUrl ? (
                  <img
                    src={project.openGraphImageUrl}
                    alt={project.name}
                    className="h-56 w-full object-cover md:h-72"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-base-200 md:h-72">
                    <Github className="size-10 text-base-content/20" />
                  </div>
                )}
              </ViewTransition>

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
              </div>
            </div>
          </article>
        </main>
        <LandingFooter />
      </div>
    </ViewTransition>
  );
}

/**
 * Project detail from static fixtures — enough for landing card → detail e2e.
 */
export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  return (
    <DirectionalPageTransition>
      <Suspense
        fallback={
          <ViewTransition exit="slide-down" default="none">
            <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24">
              <p className="text-sm text-base-content/60">Loading project…</p>
            </main>
          </ViewTransition>
        }
      >
        <ProjectDetail params={params} />
      </Suspense>
    </DirectionalPageTransition>
  );
}

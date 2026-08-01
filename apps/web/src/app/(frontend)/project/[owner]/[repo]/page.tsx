import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Github, Globe } from "lucide-react";
import { getCachedGithubRepoByName } from "@/data-access/github-landing-repos";
import {
  getCachedProjectDetail,
  getCachedRepositoryByName,
  getRepositoryStaticParams,
} from "@/data-access/repositories";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { LandingScrollFabDeferred } from "@/components/landing/layout/LandingScrollFabDeferred";
import { ProjectReadmeTabs } from "@/components/projects/ProjectReadmeTabs";
import { RichText } from "@/components/richtext/RichText";
import { CenteredLoader } from "@/components/loading/CenteredLoader";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";
import { projectImageVtName } from "@/components/view-transitions/names";
import { ProjectMedia } from "@/components/projects/ProjectMedia";
import type { GithubRepoNode } from "@/components/landing/types/github";

type Args = {
  params: Promise<{ owner: string; repo: string }>;
};

/**
 * Prefers live/~15m-cached GitHub fields (especially OG image) over Payload so
 * detail media matches the landing card that just transitioned in.
 */
function mergeProjectWithGithubLive(
  project: GithubRepoNode,
  live: GithubRepoNode | null,
): GithubRepoNode {
  if (!live) return project;
  return {
    ...project,
    openGraphImageUrl: live.openGraphImageUrl || project.openGraphImageUrl,
    description: live.description ?? project.description,
    descriptionHTML: live.descriptionHTML || project.descriptionHTML,
    homepageUrl: live.homepageUrl || project.homepageUrl,
    stargazerCount: live.stargazerCount ?? project.stargazerCount,
    forkCount: live.forkCount ?? project.forkCount,
    pushedAt: live.pushedAt || project.pushedAt,
    repositoryTopics:
      live.repositoryTopics.nodes.length > 0 ? live.repositoryTopics : project.repositoryTopics,
  };
}

export async function generateStaticParams() {
  return getRepositoryStaticParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { owner, repo } = await params;
  const decodedOwner = decodeURIComponent(owner);
  const decodedRepo = decodeURIComponent(repo);
  const project = await getCachedRepositoryByName(decodedOwner, decodedRepo);
  if (!project) {
    return { title: "Project" };
  }

  return {
    title: project.name,
    description: project.description,
    alternates: {
      canonical: `/project/${encodeURIComponent(decodedOwner)}/${encodeURIComponent(decodedRepo)}`,
    },
  };
}

async function ProjectDetail({ params }: Args) {
  const { owner, repo } = await params;
  const decodedOwner = decodeURIComponent(owner);
  const decodedRepo = decodeURIComponent(repo);
  const [detail, liveGithub] = await Promise.all([
    getCachedProjectDetail(decodedOwner, decodedRepo),
    getCachedGithubRepoByName(decodedOwner, decodedRepo),
  ]);
  if (!detail) notFound();

  const project = mergeProjectWithGithubLive(detail.project, liveGithub);
  const { isMonorepo, packages, readme } = detail;
  const topics = project.repositoryTopics?.nodes?.map((node) => node.topic.name) ?? [];

  return (
    <ViewTransition enter="slide-up" default="none">
      <div data-test="project-detail-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar backHref="/#projects" backLabel="Back to projects" />
        <main className="min-h-screen py-24">
          <article className="mx-auto max-w-5xl space-y-8 px-6" data-test="project-detail">
            <div className="overflow-hidden rounded-none border border-base-content/10 bg-base-300/40">
              <ViewTransition
                name={projectImageVtName(project.nameWithOwner)}
                share="morph"
                default="none"
              >
                <ProjectMedia
                  name={project.name}
                  nameWithOwner={project.nameWithOwner}
                  description={project.description}
                  stargazerCount={project.stargazerCount}
                  forkCount={project.forkCount}
                  openGraphImageUrl={project.openGraphImageUrl}
                  size="hero"
                />
              </ViewTransition>

              <div className="space-y-5 p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                      {project.name}
                    </h1>
                    <p className="mt-1.5 text-sm text-base-content/65">{project.nameWithOwner}</p>
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
                  <p className="text-lg leading-8 text-base-content/80 md:text-xl md:leading-9">
                    {project.description}
                  </p>
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

            {isMonorepo && packages.length > 0 ? (
              <section
                className="rounded-none border border-base-content/10 bg-base-300/40 p-6 md:p-10"
                data-test="project-detail-readme"
              >
                <ProjectReadmeTabs packages={packages} />
              </section>
            ) : readme ? (
              <section
                className="rounded-none border border-base-content/10 bg-base-300/40 p-6 md:p-10"
                data-test="project-detail-readme"
              >
                <RichText data={readme} enableGutter={false} />
              </section>
            ) : null}
          </article>
        </main>
        <LandingFooter />
        <LandingScrollFabDeferred />
      </div>
    </ViewTransition>
  );
}

/**
 * Project detail — Payload for READMEs; short-lived GitHub cache for card/hero media.
 */
export default function ProjectDetailPage({ params }: Args) {
  return (
    <DirectionalPageTransition>
      <Suspense
        fallback={
          <ViewTransition exit="slide-down" default="none">
            <CenteredLoader label="Loading project…" fullPage size="lg" />
          </ViewTransition>
        }
      >
        <ProjectDetail params={params} />
      </Suspense>
    </DirectionalPageTransition>
  );
}

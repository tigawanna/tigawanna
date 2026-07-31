"use client";

import { ViewTransition } from "react";
import { TimeCompponent } from "../stubs/time";
import { useLandingCardMotion } from "../hooks/use-landing-card-motion";
import type { GithubRepoNode } from "../types/github";
import { ProjectMedia } from "@/components/projects/ProjectMedia";
import { projectImageVtName } from "@/components/view-transitions/names";
import Link from "next/link";
import { Github, Globe, Lock } from "lucide-react";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";

/**
 * Builds the project detail href for a `owner/repo` slug.
 */
function projectDetailHref(nameWithOwner: string) {
  const [owner, repo] = nameWithOwner.split("/");
  if (!owner || !repo) return "/";
  return `/project/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

interface ProjectCardProps {
  repo: GithubRepoNode;
  className?: string;
}

export function PrivateProjectCard({ repo, className }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  useLandingCardMotion(cardRef);

  return (
    <article
      ref={cardRef}
      data-test="private-project-card"
      className={twMerge(
        "landing-card flex min-h-80 flex-col items-center justify-center gap-4 overflow-hidden p-7 text-center",
        className,
      )}
    >
      <div className="grid size-14 place-items-center rounded-none border border-landing-cream/10 bg-landing-cream/5 text-landing-sage/50">
        <Lock className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-serif text-lg text-landing-cream/70">Private project</p>
        <p className="font-mono text-sm tracking-wider text-landing-sage/40">
          {repo.name.slice(0, 3)}
          <span className="opacity-40">•••</span>
          {repo.name.slice(-2)}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-landing-sage/40">
        <span>Updated</span>
        <TimeCompponent time={repo.pushedAt} relative className="p-0 text-xs font-normal" />
      </div>
    </article>
  );
}

export function ProjectCard({ repo, className }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  useLandingCardMotion(cardRef);

  return (
    <article
      ref={cardRef}
      data-test="project-card"
      className={twMerge("landing-card group relative flex flex-col overflow-hidden", className)}
    >
      <ViewTransition name={projectImageVtName(repo.nameWithOwner)} share="morph" default="none">
        <ProjectMedia
          name={repo.name}
          nameWithOwner={repo.nameWithOwner}
          description={repo.description}
          stargazerCount={repo.stargazerCount}
          forkCount={repo.forkCount}
          openGraphImageUrl={repo.openGraphImageUrl}
          size="card"
        />
      </ViewTransition>

      <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-serif text-xl leading-snug text-landing-cream">{repo.name}</h3>
          <TimeCompponent
            time={repo.pushedAt}
            relative
            className="p-0 text-xs font-normal text-landing-sage/45"
          />
        </div>

        {repo.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-landing-sage/80">{repo.description}</p>
        ) : null}

        {repo.repositoryTopics?.nodes?.length ? (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {repo.repositoryTopics.nodes.slice(0, 4).map((topic) => (
              <li key={topic.topic.name} className="landing-card-tag">
                {topic.topic.name}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-landing-cream/8 pt-4">
          <div className="flex items-center gap-4 text-sm">
            {repo.homepageUrl ? (
              <a
                href={repo.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-landing-sage/60 transition-colors hover:text-landing-cream"
              >
                <Globe className="size-3.5" />
                Site
              </a>
            ) : null}
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-landing-sage/60 transition-colors hover:text-landing-cream"
            >
              <Github className="size-3.5" />
              Source
            </a>
          </div>

          <Link
            href={projectDetailHref(repo.nameWithOwner)}
            prefetch
            transitionTypes={["nav-forward"]}
            className="rounded-none border border-landing-cream/15 px-3.5 py-1.5 text-xs font-medium text-landing-sage/75 transition-all hover:border-landing-cream/30 hover:bg-landing-cream/5 hover:text-landing-cream"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function renderProjectCard(repo: GithubRepoNode) {
  if (repo.isPrivate) {
    return <PrivateProjectCard key={repo.nameWithOwner} repo={repo} />;
  }
  return <ProjectCard key={repo.nameWithOwner} repo={repo} />;
}

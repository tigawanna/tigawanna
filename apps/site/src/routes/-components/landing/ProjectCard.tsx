import { TimeCompponent } from "@/components/wrappers/TimeCompponent";
import type { GithubRepoNode } from "@/types/github";
import { Link } from "@tanstack/react-router";
import { Github, Globe, Lock } from "lucide-react";
import { twMerge } from "tailwind-merge";

function projectRouteParam(nameWithOwner: string) {
  return nameWithOwner.replace("/", "=>");
}

interface ProjectCardProps {
  repo: GithubRepoNode;
  className?: string;
}

export function PrivateProjectCard({ repo, className }: ProjectCardProps) {
  return (
    <article
      data-test="private-project-card"
      className={twMerge(
        "flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[2rem] border border-base-content/10 bg-base-300/60 p-7 text-center shadow-xl shadow-black/10",
        className,
      )}
    >
      <div className="flex items-center gap-1 font-serif text-2xl">
        <span>{repo.name.slice(0, 2)}</span>
        <span className="inline-block h-3 min-w-14 rounded bg-base-content/20" />
        <span>{repo.name.slice(-1)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-base-content/70">
        <span>Private project</span>
        <Lock className="size-3" />
      </div>
      <div className="flex items-center gap-1 text-xs text-base-content/60">
        <span>Last updated</span>
        <TimeCompponent time={repo.pushedAt} relative className="p-0 text-xs font-normal" />
      </div>
    </article>
  );
}

export function ProjectCard({ repo, className }: ProjectCardProps) {
  const imageUrl =
    repo.openGraphImageUrl && repo.openGraphImageUrl.length > 0 ? repo.openGraphImageUrl : null;

  return (
    <article
      data-test="project-card"
      className={twMerge(
        "group overflow-hidden rounded-[2rem] border border-base-content/10 bg-base-300/60 shadow-xl shadow-black/10 transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative h-48 overflow-hidden bg-base-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={repo.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-base-content/40">
            <Github className="size-10" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-serif text-2xl leading-tight">{repo.name}</h3>
          <TimeCompponent
            time={repo.pushedAt}
            relative
            className="p-0 text-xs font-normal text-base-content/60"
          />
        </div>

        {repo.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-base-content/70">{repo.description}</p>
        ) : null}

        {repo.repositoryTopics?.nodes?.length ? (
          <ul className="flex flex-wrap gap-2">
            {repo.repositoryTopics.nodes.slice(0, 4).map((topic) => (
              <li
                key={topic.topic.name}
                className="rounded-full border border-base-content/10 bg-base-content/5 px-3 py-1 text-xs text-base-content/70"
              >
                {topic.topic.name}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {repo.homepageUrl ? (
              <a
                href={repo.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-base-content/70 transition-colors hover:text-primary"
              >
                <Globe className="size-4" />
                Site
              </a>
            ) : null}
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-base-content/70 transition-colors hover:text-primary"
            >
              <Github className="size-4" />
              Source
            </a>
          </div>

          <Link
            to="/project/$name"
            params={{ name: projectRouteParam(repo.nameWithOwner) }}
            className="rounded-full border border-primary/30 px-4 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
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

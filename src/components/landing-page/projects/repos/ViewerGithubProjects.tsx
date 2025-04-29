"use client";
import { SectionHeader } from "@/components/landing-page/shared/SectionHeader";
import { TimeCompponent } from "@/components/landing-page/shared/TimeCompponent";
import { RequestError, ViewerPinnedRepoData } from "@/state/api/repos";
import { RepoListCard } from "./RepoListCard";
import { Lock } from "lucide-react";

import { FilterByTopics } from "./FilterByTopics";
import { useQueryState } from "nuqs";
import { PinnedGithubProjects } from "./PinnedGithubProjects";
import {  PinnedViewerReposResponse } from "@/state/api/repos";
interface ViewerGithubProjectsProps {
  data: ViewerPinnedRepoData | null;
  errors: RequestError[];
    pinned:Error | PinnedViewerReposResponse
}

export function ViewerGithubProjects({ data, errors,pinned }: ViewerGithubProjectsProps) {

  const [topic, setTopic] = useQueryState("topic", { defaultValue: "featured" });
  if (errors && errors.length > 0 && !data) {
    return null;
  }
  if (!data) {
    return null;
  }
  const projects = data?.viewer?.repositories?.nodes;
  if (!projects) {
    return null;
  }
  const topics = projects?.reduce((acc: string[], project) => {
    if (project?.repositoryTopics?.nodes) {
      project.repositoryTopics.nodes.forEach((topic) => {
        if (topic.topic.name && !acc.includes(topic.topic.name)) {
          acc.push(topic.topic.name);
        }
      });
    }
    return acc;
  }, []);
  const filteredProjects = projects.filter((project) => {
    if (topic === "all") {
      return true;
    }
    if (project?.repositoryTopics?.nodes) {
      return project.repositoryTopics.nodes.some(
        (t) => t.topic?.name?.toLowerCase()?.includes(topic?.toLocaleLowerCase())
      );
    }
    return false;
  });



  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <FilterByTopics topics={topics} key={topic} />
      <SectionHeader heading="Projects" id="projects" />
      {topic === "featured" ? (
        <PinnedGithubProjects pinned={pinned} />
      ) : (
        <div className="flex w-[90%] lg:w-[95%] h-full flex-wrap items-center justify-center gap-5 p-3 lg:p-1">
          {filteredProjects.slice(0, 6).map((one_repo) => {
            if (!one_repo) {
              return null;
            }
            if (one_repo?.isPrivate) {
              return (
                <div
                  key={one_repo.nameWithOwner}
                  className="card w-full sm:h-[350px] 
                 md:w-[45%] lg:w-[30%] shadow-lg shadow-base-200 rounded-xl relative glass">
                  <div className="w-full h-full  flex flex-col justify-center items-center gap-2   z-40">
                    <div className="flex items-center gap-0.5 rounded-lg">
                      <h3>{one_repo.name.slice(0, 2)}</h3>
                      <div className="h-3 glass shadow-secondary min-w-14" />
                      <h3>{one_repo.name.slice(-1)}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <h3>Private project</h3>
                      <Lock className="size-3" />
                    </div>
                    <div className="min-w-fit flex  items-center  gap-1">
                      <h3 className="text-xs  text-center">last updated</h3>
                      <TimeCompponent
                        time={one_repo.pushedAt}
                        className="text-sm font-thin p-0 "
                        relative
                      />
                    </div>
                  </div>
                </div>
              );
            }
            return <RepoListCard one_repo={one_repo} key={one_repo.nameWithOwner} />;
          })}
        </div>
      )}
    </div>
  );
}
{
  /* <PinnedGithubProjects />; */
}

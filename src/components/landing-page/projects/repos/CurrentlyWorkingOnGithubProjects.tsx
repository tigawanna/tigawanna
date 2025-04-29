import { RequestError, ViewerPinnedRepoData } from "@/state/api/repos";
import { SectionHeader } from "../../shared/SectionHeader";
import { RepoListCard } from "./RepoListCard";
import { Lock } from "lucide-react";
import { TimeCompponent } from "@/components/landing-page/shared/TimeCompponent";

type CurrentlyWorkingOnGithubProjectsProps = {
  data: ViewerPinnedRepoData | null;
  errors: RequestError[]
};

export function CurrentlyWorkingOnGithubProjects({data,errors}: CurrentlyWorkingOnGithubProjectsProps) {
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
  return (
    <div className="flex flex-col h-full w-full  items-center justify-center lg:px-[10%]">
      <SectionHeader heading="Currently working on" id="working_on" />
      <div className="flex w-[90%] lg:w-[95%] h-full flex-wrap items-center justify-center gap-5 p-3 lg:p-1">
        {projects.slice(0, 6).map((one_repo) => {
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
    </div>
  );
}

export function ProjectsSuspenseFallback() {
  return (
    <div className="w-full h-screen flex">
      <div className="flex w-[90%] h-full flex-wrap items-center justify-center gap-5 p-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            className="card w-full sm:h-[350px] 
            md:w-[45%] lg:w-[35%] bg-base-100 shadow-lg shadow-base-200 rounded-xl">
            <figure className="h-[300px] w-full skeleton bg-base-200" />
            <div className="card-body flex-wrap bg-base-100  p-3">
              <div className="w-full flex flex-row items-center justify-end gap-1 h-5 rounded-xl skeleton bg-base-200" />
              <div className="w-full flex flex-row items-center justify-end gap-1 h-5 rounded-xl skeleton bg-base-200" />
              <div className="w-full flex flex-row items-center justify-end gap-1 h-5 rounded-xl skeleton bg-base-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

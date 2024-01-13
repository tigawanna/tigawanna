import {  getViewerPinnedRepos, getViewerRecentlyPushedRepos } from "@/state/api/repos";
import { SectionHeader } from "../../shared/SectionHeader";
import { RepoListCard } from "./RepoListCard";


interface CurrentlyWorkingOnGithubProjectsProps {

}

export async function CurrentlyWorkingOnGithubProjects({ }: CurrentlyWorkingOnGithubProjectsProps) {
    const data = await getViewerRecentlyPushedRepos();
    
    if (data && ("errors" in data)||("message" in data)) {
        return null
    }
    
  const projects = data?.data?.viewer?.repositories?.nodes;
  if(!projects){
    return null
  }
  // // no({projects})
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <SectionHeader heading="Currently working on" id="working_on" />
      <div className="flex w-[90%] h-full flex-wrap items-center justify-center gap-5 p-3">
        {projects.map((one_repo) => {
          return <RepoListCard one_repo={one_repo} key={one_repo.nameWithOwner} />;
        })}
      </div>
    </div>
  );
}


export function ProjectsSuspenseFallback(){
  return (
    <div className="w-full h-screen flex">
      <div className="flex w-[90%] h-full flex-wrap items-center justify-center gap-5 p-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="card w-full sm:h-[350px] 
            md:w-[45%] lg:w-[35%] bg-base-100 shadow-lg shadow-base-200 rounded-xl">
            <figure className="h-[300px] w-full skeleton bg-base-200"></figure>
            <div className="card-body flex-wrap bg-base-100  p-3">
              <div className="w-full flex flex-row items-center justify-end gap-1 h-5 rounded-xl skeleton bg-base-200"></div>
              <div className="w-full flex flex-row items-center justify-end gap-1 h-5 rounded-xl skeleton bg-base-200"></div>
              <div className="w-full flex flex-row items-center justify-end gap-1 h-5 rounded-xl skeleton bg-base-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

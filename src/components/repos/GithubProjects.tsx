import {  getViewerPinnedRepos } from "@/state/api/repos";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "../shared/customicons";
import { Globe,  } from "lucide-react";
import { TimeCompponent } from "../shared/TimeCompponent";
import { SectionHeader } from "../shared/SectionHeader";
import { RepoListCard } from "./RepoListCard";


interface GithubProjectsProps {

}

export async function GithubProjects({ }: GithubProjectsProps) {
    const data = await getViewerPinnedRepos();
    if (data && ("errors" in data)||("message" in data)) {
        return null
    }
    
  const projects = data?.data?.viewer?.pinnedItems?.nodes;
  if(!projects){
    return null
  }
  // console.log({projects})
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <SectionHeader heading="Featured projects" /> 
      <div className="flex w-[90%] h-full flex-wrap items-center justify-center gap-5 p-3">
        {projects.map((one_repo) => {
          return <RepoListCard one_repo={one_repo} />
        })}
      </div>
    </div>
  );
}

import { PinnedViewerReposResponse } from "@/state/api/repos";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "../shared/customicons";
import { Globe, Timer } from "lucide-react";
import { TimeCompponent } from "../shared/TimeCompponent";
import { SectionHeader } from "../shared/SectionHeader";


interface GithubProjectsProps {
    data:PinnedViewerReposResponse;
}

export function GithubProjects({ data }: GithubProjectsProps) {
    if (data && ("errors" in data)||("message" in data)) {
        return null
    }
    
  const projects = data.data.viewer.pinnedItems.nodes;
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <SectionHeader heading="Featured projects" /> 
      <div className="flex w-[90%] h-full flex-wrap items-center justify-center gap-2 p-3">
        {projects.map((project) => {
          return (
            <div
              key={project.name}
                  className=" border-accent flex w-full h-full sm:w-[45%] lg:w-[30%] 
                  flex-col items-start flex-grow  rounded-xl
                    border p-2
                    hover:border-accent hover:shadow hover:shadow-accent
                    hover:brightness-110 ">
              <div className="m-1  w-full p-1  text-xl font-bold text-accent">{project.name}</div>
              <p className=" p-1 font-sans text-xs">{project.description}</p>
              <div className="flex h-full w-full  flex-col lg:flex-row lg:items-end gap-2">
                <Image
                  width={100}
                  height={100}
                  src={project.openGraphImageUrl}
                  alt={project.name}
                  className="md:aspect-square max-h-[300px] h-auto w-full 
                  rounded-xl object-cover md:h-auto lg:w-[60%]"
                />

                <div className="
                w-full h-full flex flex-wrap lg:flex-col-reverse justify-between 
                lg:items-stretch  gap-1 lg:gap-4">

                  <div className="w-full flex flex-row lg:flex-col items-center justify-start gap-1">
                    <h3 className="text-xs  text-center">last updated</h3>
                    <TimeCompponent time={project.pushedAt} className="text-xs font-thin p-0 " relative />
                  </div>
                  
                  <div className="h-full flex  lg:flex-col justify-between p-1 text-sm  font-medium gap-2">
                    <div className="rounded-lg  border-b p-1 hover:text-green-300 hover:underline">
                      <Link href={project?.homepageUrl} target="_blank" className="flex items-center justify-center gap-1">
                        <Globe className="w-4 h-4" /> site
                      </Link>
                    </div>

                    <div className="rounded-lg   border-b p-1 hover:text-green-300 hover:underline">
                      <Link href={project.url} target="_blank" className="flex items-center justify-center gap-1">
                        <Icons.gitHub className="w-4 h-4" /> repo
                      </Link>
                    </div>

                    

                  </div>
                </div>
                
                </div>

 
            </div>
          );
        })}
      </div>
    </div>
  );
}

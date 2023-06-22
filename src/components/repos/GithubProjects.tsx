import { PinnedViewerReposResponse } from "@/state/api/repos";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "../shared/customicons";
import { Globe } from "lucide-react";


interface GithubProjectsProps {
    data:PinnedViewerReposResponse;
}

export function GithubProjects({ data }: GithubProjectsProps) {
    if (data && "errors" in data) {
        return null
    }
  const projects = data.data.viewer.pinnedItems.nodes;
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-[90%] flex-wrap items-center justify-center gap-2 p-3">
        {projects.map((project) => {
          return (
            <div
              key={project.name}
                  className=" border-accent flex w-full h-full sm:w-[45%] md:w-[30%] 
                  flex-col items-start flex-grow  rounded-xl
                    border p-2
                    hover:border-accent hover:shadow hover:shadow-accent
                    hover:brightness-110 ">
              <div className="m-1  w-full p-1  text-xl font-bold text-accent">{project.name}</div>

              <div className="flex h-full w-full  flex-col text-sm md:flex-row">
                <Image
                  width={100}
                  height={100}
                  src={project.openGraphImageUrl}
                  alt={project.name}
                  className="md:aspect-square max-h-[200px] h-auto w-full rounded-xl object-cover md:h-auto md:w-[30%]"
                />

                <p className="h-full p-2 font-sans ">{project.description}</p>
              </div>

              <div className=" flex w-full justify-between p-2 text-sm  font-medium">
                <div className="rounded-lg  border-b p-1 hover:text-green-300 hover:underline">
                    <Link href={project?.homepageUrl} target="_blank" className="flex items-center justify-center gap-2">
                        <Globe className="w-4 h-4" /> site 
                  </Link>
                </div>

                <div className="rounded-lg   border-b p-1 hover:text-green-300 hover:underline">
                  <Link href={project.url} target="_blank" className="flex items-center justify-center gap-2">
                    <Icons.gitHub className="w-4 h-4"/> repo
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

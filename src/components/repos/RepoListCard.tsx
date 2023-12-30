import { PinnedItemsNode } from "@/state/api/repos";
import { TimeCompponent } from "../shared/TimeCompponent";
import Link from "next/link";
import { GithubIcon, Globe } from "lucide-react";
import Image from "next/image"

interface RepoListCardProps {
  one_repo: PinnedItemsNode;
}

export function RepoListCard({one_repo}:RepoListCardProps){
return (
  <div
    key={one_repo.nameWithOwner}
    className="card w-full sm:h-[350px] 
            md:w-[45%] lg:w-[35%] bg-base-100 shadow-lg shadow-base-200 rounded-xl">
    <figure>
      <Image
        src={one_repo.openGraphImageUrl}
        alt={one_repo.name}
        width={300}
        height={200}
        className="h-[200px] w-full object-cover hover:scale-150 ease-linear duration-300"
      />
    </figure>
    <div className="card-body flex-wrap bg-base-200 p-3">
      <h2 className="card-title w-full justify-between">
        {one_repo.name}
        <div className="w-full flex flex-row items-center justify-end gap-1">
          <h3 className="text-sm  text-center">last updated</h3>
          <TimeCompponent
            time={one_repo.pushedAt}
            className="text-sm font-thin p-0 text-secondary"
            relative
          />
        </div>
      </h2>

      <p className=" p-1 font-sans text-sm line-clamp-2">{one_repo.description}</p>
      <div className="flex justify-between items-center gap-3">
        <div className="flex  items-center gap-3">
          <div className="border-b p-1 hover:text-secondary hover:underline">
            <Link
              href={one_repo?.homepageUrl}
              target="_blank"
              className="flex items-center justify-center gap-1">
              <Globe className="w-4 h-4" />
              site
            </Link>
          </div>

          <div className="rounded-lg   border-b p-1 hover:text-secondary hover:underline">
            <Link
              href={one_repo.url}
              target="_blank"
              className="flex items-center justify-center gap-1">
              <GithubIcon className="w-4 h-4" />
              repo
            </Link>
          </div>
        </div>
        <div className="border-b  hover:text-secondary hover:underline p-2 badge badge-lg badge-outline badge-secondary">
          <Link
            href={"/project/" + one_repo.nameWithOwner.replace("/", "=>")}
            className="flex items-center justify-center gap-1">
           Project details
          </Link>
        </div>
      </div>
    </div>
  </div>
);
}

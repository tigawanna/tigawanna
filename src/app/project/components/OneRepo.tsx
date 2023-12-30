import { Suspense } from "react";
import { OneGithubRepoLanguages } from "./OneGithubRepoLanguages";
import { getOneRepoGQL } from "../helpers/getOneRepoGQL";
import {  ChevronLeft, GithubIcon, Globe, Loader } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StackblitzEmbed } from "./stackblitzEmbed";


export async function OneRepo({ params }: { params: string }) {
  const [owner, repo] = params.split("%3D%3E");
  const query = await getOneRepoGQL({ owner, repo });
  const data = query
  
  if(!data || !data.data){
  return (
    <div className="w-full h-screen flex flex-col  items-center gap-5 relative bg-base-300">
      <Image
        src="/blobby.svg"
        alt="blobby background"
        priority
        height={1000}
        width={1000}
        className="h-screen w-full object-fit  absolute top-0 bottom-0"
      />

      <div className="w-full h-full flex text-4xl font-bold z-20  gap-2 justify-center items-center">
        Repository {owner}/{repo} not found
      </div>
    </div>
  );
}
  return (
    <div className="w-full h-full min-h-screen flex flex-col  items-center gap-5">
      <div className="w-full h-full flex   gap-2 justify-center items-center">
        <div className="w-full p-2 px-4 h-full flex flex-col gap-2  justify-center bg-base-200">
          <div className="w-full flex flex-wrap gap-5 items-center p-5">
            <Link href={".."} className="rounded-full hover:text-seconadary">
              <ChevronLeft className="w-7 h-7 " />{" "}
            </Link>
            <h1 className="text-3xl font-bold">{data?.data?.repository?.name}</h1>
            <div className="flex gap-7 items-center bg-base-100 p-4 rounded-xl">
              <Link
                href={data?.data?.repository?.homepageUrl}
                target="_blank"
                className="flex items-center justify-center gap-1 text-sm hover:text-secondary">
                <Globe className="w-5 h-5" />
                site
              </Link>
              <Link
                href={data?.data?.repository?.url}
                className="text-sm hover:text-secondary flex items-center gap-2 "
                target="_blank"
                rel="noreferrer">
                View on Github <GithubIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row gp-2 items-center pt-5 pb-2"></div>
          <ul className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
            <h2 className="font-bold">Topics:</h2>
            {data.data?.repository.repositoryTopics.edges.map((topic) => (
              <li key={topic.node.id} className="text-sm  badge badge-ghost shadow-base-300 shadow rounded-lg">
                {topic.node.topic.name}
              </li>
            ))}
          </ul>

          <div className="w-full p-2 h-full flex  justify-between bg-base-200">
            <Suspense fallback={<div className="w-full h-full bg-base-200 skeleton">.</div>}>
              <OneGithubRepoLanguages owner={owner} repo={repo} />
            </Suspense>
          </div>
          <p className="p-2 px-5 lg:max-w-[60%]">
            description
            {data.data?.repository.description}
          </p>
        </div>
        <Image
          src={data?.data?.repository?.openGraphImageUrl}
          alt={data?.data?.repository?.name}
          height={100}
          width={300}
          priority
          className="w-full h-auto object-cover aspect-video hidden md:flex"
        />
      </div>
      <div className="w-full h-[600px] px-7">
        <StackblitzEmbed owner={owner} repo={repo} />
      </div>
    </div>
  );
}


export function OneRepoSuspenseFallback(){
  return (
    <div className="w-full h-screen flex flex-col  items-center gap-5 relative bg-base-100">
      <div className="h-44 w-full bg-base-200 skeleton"></div>
      <span className="text-3xl font-bold h-6 rounded-xl bg-base-200 skeleton"></span>
      <span className="text-3xl font-bold h-6 rounded-xl bg-base-200 skeleton"></span>
      <span className="text-3xl font-bold h-6 rounded-xl bg-base-200 skeleton"></span>
      <div className="h-full w-full flex justify-center items-center">
        <Loader className="animate-spin"/>
      </div>

    </div>
  );
}

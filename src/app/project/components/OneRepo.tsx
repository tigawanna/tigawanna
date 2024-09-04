import { ChevronLeft, GithubIcon, Globe, Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getOneRepoGQL } from "../helpers/getOneRepoGQL";
import { OneGithubRepoLanguages } from "./OneGithubRepoLanguages";
import { OneGithubRepoREADME } from "./OneGithubRepoREADME";
import { StackblitzEmbed } from "./stackblitzEmbed";
export async function OneRepo({ params, ...props }: { params: string }) {
  const [owner, repo] = params.split("%3D%3E");

  if (!owner || !repo) {
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
  const query = await getOneRepoGQL({ owner, repo });
  const data = query;
  // console.log("==== data === ", data);
  if (!data || !data.data) {
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

  if (data.data.repository.isPrivate) {
    redirect("/");
  }
  const homepage_url = data?.data?.repository?.homepageUrl;
  const repo_url = data?.data?.repository?.url;
  const topics = data.data?.repository.repositoryTopics?.edges;
  return (
    <div className="w-full flex flex-col  items-center gap-5">
      <div className="w-full flex    gap-2 justify-center items-center p-5">
        {/* github stats */}
        <div className="w-full p-2 px-4 h-full flex flex-col gap-2  justify-center bg-base-200 rounded-xl">
          <div className="w-full flex flex-wrap gap-5 items-center p-5">
            <Link href={".."} className="rounded-full hover:text-seconadary">
              <ChevronLeft className="w-7 h-7 " />{" "}
            </Link>
            <h1 className="text-3xl font-bold">
              {data?.data?.repository?.name}
            </h1>
            <div className="flex gap-7 items-center bg-base-100 p-4 rounded-xl">
              {homepage_url && (
                <Link
                  href={homepage_url}
                  target="_blank"
                  className="flex items-center justify-center gap-1 text-sm hover:text-secondary"
                >
                  <Globe className="w-5 h-5" />
                  site
                </Link>
              )}
              {repo_url && (
                <Link
                  href={repo_url}
                  className="text-sm hover:text-secondary flex items-center gap-2 "
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Github <GithubIcon className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {topics && topics.length > 0 && (
            <ul className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
              <h2 className="font-bold">Topics:</h2>
              {topics.map((topic) => (
                <li
                  key={topic.node.id}
                  className="text-sm  badge badge-ghost shadow-base-300 shadow rounded-lg"
                >
                  {topic.node.topic.name}
                </li>
              ))}
            </ul>
          )}

          <div className="w-full p-2 h-full flex  justify-between bg-base-200">
            <Suspense
              fallback={
                <div className="w-full h-full bg-base-200 skeleton">.</div>
              }
            >
              <OneGithubRepoLanguages owner={owner} repo={repo} />
            </Suspense>
          </div>
          <p className="p-2 px-5 lg:max-w-[60%] ">
            {data.data?.repository.description}
          </p>
        </div>
        <Image
          src={data?.data?.repository?.openGraphImageUrl}
          alt={data?.data?.repository?.name}
          height={400}
          width={300}
          priority
          className="w-full h-auto   object-cover  hidden md:flex"
        />
      </div>

      <div className="w-full  flex items-center justify-center ">
        <Suspense
          fallback={<div className="w-full h-full bg-base-200 skeleton">.</div>}
        >
          <OneGithubRepoREADME owner={owner} repo={repo} />
        </Suspense>
      </div>

      <div className="w-full h-[600px] px-7">
        <StackblitzEmbed owner={owner} repo={repo} />
      </div>
    </div>
  );
}

export function OneRepoSuspenseFallback() {
  return (
    <div className="w-full h-screen flex flex-col  items-center gap-5 relative bg-base-100">
      <div className="h-44 w-full bg-base-200 skeleton" />
      <span className="text-3xl font-bold h-6 rounded-xl bg-base-200 skeleton" />
      <span className="text-3xl font-bold h-6 rounded-xl bg-base-200 skeleton" />
      <span className="text-3xl font-bold h-6 rounded-xl bg-base-200 skeleton" />
      <div className="h-full w-full flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    </div>
  );
}

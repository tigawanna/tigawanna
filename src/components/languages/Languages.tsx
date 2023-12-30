import { SectionHeader } from "../shared/SectionHeader";
import { GithubLangiagesPercentage } from "./GithubLangiagesPercentage";
import { getMostFrequentLanguages, getViewerLangs } from "./helpers";

interface LanguagesProps {}

export async function Languages({}: LanguagesProps) {
  const data = await getViewerLangs();

  if (!data || (data.data && "error" in data.data)) {
    return null;
  }
  if (data.data && !(data.data && "viewer" in data.data)) {
    return null;
  }

  const repos = data?.data?.viewer?.repositories;

  if (!repos) {
    return null;
  }
  const top_langs = await getMostFrequentLanguages(repos);

  return (
    <div
      className=" w-full  h-full  md:p-5 bg-slate-900  bg-opacity-30 
        flex flex-wrap items-center justify-center text-xs md:text-base
        gap-2  rounded-xl shadow-green-700 shadow">
      <SectionHeader heading="Languages Stats on Github" />

      <GithubLangiagesPercentage top_langs={top_langs} />
    </div>
  );
}

export function LanguagesSuspenseFallback(){
  
  return (
    <div className="w-full h-full flex flex-wrap gap-5 items-center justify-center">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          style={{ width: (index + 1) * 10 + "%" }}
          className="flex items-center justify-center bg-base-200 skeleton rounded-xl">
          <div className="w-full flex items-center justify-center skeleton h-6 rounded-xl "></div>
        </div>
      ))}
    </div>
  );
}

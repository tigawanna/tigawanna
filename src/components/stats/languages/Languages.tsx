import { SectionHeader } from "../../shared/SectionHeader";
import { GithubLangiagesPercentage } from "./GithubLangiagesPercentage";
import { getGithubViewerLanguages } from "./deno";

interface LanguagesProps {}

export  async function GithubLanguages({}: LanguagesProps) {
  const top_langs = await getGithubViewerLanguages();
  if (!top_langs) return;

  return (
    <div
      className=" w-full  h-full   p-5 
        flex flex-wrap items-center justify-center text-xs md:text-base
        gap-2  rounded-xl ">
      <SectionHeader heading="Languages Stats on Github" id="stats" />
    <GithubLangiagesPercentage top_langs={top_langs} />
    </div>
  );
}

export function LanguagesSuspenseFallback() {
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

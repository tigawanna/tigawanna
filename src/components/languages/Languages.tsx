import { SectionHeader } from "../shared/SectionHeader";
import { ViewerLang, getMostFrequentLanguages, getViewerLangs } from "./helpers";
import { LanguagePercentageComponent } from "./LanguagePercentage";

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
  const top_langs = getMostFrequentLanguages(repos);

  return (
    <div
      className=" w-full md:w-[95%] h-full p-2 md:p-5 bg-slate-900  bg-opacity-30 
        flex flex-wrap items-center justify-center text-xs md:text-base
        gap-2  rounded-xl shadow-green-700 shadow">
      <SectionHeader heading="Languages Stats on Github" />
      {top_langs.map((lang) => (
        <LanguagePercentageComponent key={lang.name} prop={lang} />
      ))}
    </div>
  );
}

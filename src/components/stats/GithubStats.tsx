import { Suspense } from "react";
import { GithubLanguages, LanguagesSuspenseFallback } from "./languages/Languages";

interface GithubStatsProps {

}

export function GithubStats({}:GithubStatsProps){
return (
  <div id="stats" className="w-full h-full flex flex-col items-center py-5">
    <Suspense fallback={<LanguagesSuspenseFallback />}>
      <GithubLanguages />
    </Suspense>
  </div>
);
}

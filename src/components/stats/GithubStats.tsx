import { Suspense } from "react";
import { GithubLanguages, LanguagesSuspenseFallback } from "./languages/Languages";
import { TopLibraries,TopLibrariesSuspenseFallback } from "./libraries/TopLibraries";

interface GithubStatsProps {

}

export function GithubStats({}:GithubStatsProps){

return (
  <div id="stats" className="w-full h-full flex flex-col  gap-2">

        <Suspense fallback={<TopLibrariesSuspenseFallback/>}>
          <TopLibraries/>
        </Suspense>
  </div>
);
}

import { Languages } from "lucide-react";
import { Suspense } from "react";
import { LanguagesSuspenseFallback } from "./languages/Languages";

interface GithubStatsProps {

}

export function GithubStats({}:GithubStatsProps){
return (
  <div id="stats" className="w-full h-full flex flex-col items-center ">
    <Suspense fallback={<LanguagesSuspenseFallback />}>
      <Languages />
    </Suspense>
  </div>
);
}

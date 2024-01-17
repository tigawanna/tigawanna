import { Suspense } from "react";
import { TopLibraries, TopLibrariesSuspenseFallback } from "./libraries/TopLibraries";
import { getViewerLibraries } from "./libraries/helpers/api";
import { TopJavascriptFramewoorks } from "./frameworks/TopJavascriptFramewoorks";

interface GithubStatsProps {}

export async function GithubStats({}: GithubStatsProps) {
  const libs = await getViewerLibraries();
  return (
    <div id="stats" className="w-full h-full flex flex-col">
      <TopLibraries libs={libs} />
      <TopJavascriptFramewoorks libs={libs} />
    </div>
  );
}

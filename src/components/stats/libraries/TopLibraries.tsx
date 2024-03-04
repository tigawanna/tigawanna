import { SectionHeader } from "@/components/shared/SectionHeader";
import { TopLibrariesVisualizer } from "./TopLibrariesVisualizer";
import { ViewerLibraries, getViewerLibraries } from "./helpers/api";

interface TopLibrariesProps {
  libs: ViewerLibraries | undefined;
}

export function TopLibraries({ libs }: TopLibrariesProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <SectionHeader heading="Top libraries used" id="stats" />
      <TopLibrariesVisualizer libs={libs} />
    </div>
  );
}
export function TopLibrariesSuspenseFallback() {
  const libs: ViewerLibraries = {
    library_stats: {
      loading: "40",
      loading2: "200",
      loading3: "50",
      loading4: "300",
      loading5: "20",
      loading6: "10",
      loading7: "100",
    },
    framework_stats: {},
    highlighted_library_stats: {},
  };
  return (
    <div className="w-full h-full flex items-center justify-center">
      <TopLibrariesVisualizer libs={libs} />
    </div>
  );
}

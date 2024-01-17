import { SectionHeader } from "@/components/shared/SectionHeader";
import { ViewerLibraries } from "../libraries/helpers/api";
import { TopFrameworksVisualizer } from "./TopLFrameworksVisualizer";
import { pkgTypesArr } from "./helper";

interface TopJavascriptFramewoorksProps {
  libs: ViewerLibraries | undefined;
}

export function TopJavascriptFramewoorks({libs}:TopJavascriptFramewoorksProps){
if(!libs || !libs?.framework_stats) return null
const framework_stats=Object.entries(libs?.framework_stats).map(([k,v])=>{
    const pkg= pkgTypesArr.find(pkg=>pkg.name===k)
    return { name:k, img:pkg?.image, percentage:v}
})
// console.log("framework_stats",framework_stats)
return (
  <div className="w-full h-full flex flex-col items-center justify-center">
    <SectionHeader heading="Top frameworks used" id="stats" />
    {/* @ts-expect-error */}
    <TopFrameworksVisualizer pkgs={framework_stats} />
  </div>
);
}

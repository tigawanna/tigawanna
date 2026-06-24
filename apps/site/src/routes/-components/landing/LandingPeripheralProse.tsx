import { howIWorkSummary } from "@/config/info";
import { OrganicDivider } from "./LandingPrimitives";
import { ScrollHighlightProse } from "./ScrollHighlightProse";

export function LandingPeripheralProse() {
  return (
    <div data-test="peripheral-cards-prose" className="relative">
      <OrganicDivider tone="deep" />
      <ScrollHighlightProse text={howIWorkSummary} />
    </div>
  );
}

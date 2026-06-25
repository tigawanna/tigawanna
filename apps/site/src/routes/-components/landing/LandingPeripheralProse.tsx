import { howIWorkSections } from "@/config/info";
import type { CurvedSection } from "@/types/curved-sections";
import { CurvedNumberedSections } from "./CurvedNumberedSections";
import { OrganicDivider } from "./LandingPrimitives";

const howIWorkCurvedSections = howIWorkSections.map(
  (section): CurvedSection => ({
    id: section.id,
    label: section.title,
    body: section.body,
    eyebrow: section.tag,
    background: section.background,
    foreground: section.foreground,
  }),
);

export function LandingPeripheralProse() {
  return (
    <div data-test="peripheral-cards-prose" className="relative">
      <OrganicDivider tone="deep" />
      <CurvedNumberedSections sections={howIWorkCurvedSections} />
    </div>
  );
}

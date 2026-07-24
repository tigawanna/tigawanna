import { Suspense } from "react";
import { getLandingTilPreviews } from "@/data-access/journals";
import { PortfolioGridSkeleton } from "../../cards/PortfolioGridSkeleton";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";
import { LandingJournals } from "./LandingJournals";

function JournalsHeader() {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <SectionEyebrow>Journal</SectionEyebrow>
      <h2 className="landing-section-heading">Cool things I recently learned</h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-base-content/70">
        Short TILs and debugging notes — written in Payload, stored on Turso/SQLite, and ready to
        publish from the admin panel.
      </p>
    </div>
  );
}

async function LandingJournalsContent() {
  const items = await getLandingTilPreviews();
  return <LandingJournals items={items} />;
}

/**
 * Journals section — one stable `#journal` shell; only the grid streams under Suspense
 * so fallback + content never duplicate the section id in the DOM.
 */
export function LandingJournalsDeferred() {
  return (
    <LandingSection
      id="journal"
      tone="panel"
      className="text-base-content"
      dataTest="landing-journals"
    >
      <OrganicDivider tone="panel" />
      <OrganicDivider tone="panel" flip />

      <div className="container relative z-10">
        <JournalsHeader />
        <Suspense fallback={<PortfolioGridSkeleton count={8} />}>
          <LandingJournalsContent />
        </Suspense>
      </div>
    </LandingSection>
  );
}

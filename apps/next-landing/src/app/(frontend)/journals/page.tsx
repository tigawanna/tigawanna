import Link from "next/link";
import { getPublishedJournals } from "@/data-access/journals";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { JournalCard } from "@/components/landing/cards/JournalCard";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";

/**
 * Journals index — published Payload entries with static TIL fallback.
 */
export default async function JournalsIndexPage() {
  const items = await getPublishedJournals({ limit: 48 });

  return (
    <DirectionalPageTransition>
      <div data-test="journals-index-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen px-6 py-28">
          <div className="container mx-auto max-w-6xl">
            <p className="text-center text-xs tracking-[0.28em] text-base-content/50 uppercase">
              Journals
            </p>
            <h1 className="mt-4 text-center font-serif text-4xl font-medium tracking-[-0.03em] md:text-5xl">
              Writing & TILs
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-base-content/70">
              Longer posts and short notes — authored in Payload with draft/publish and Lexical
              code blocks.
            </p>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <JournalCard key={item.id} item={item} tone={(index % 3) as 0 | 1 | 2} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Back to landing
              </Link>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </DirectionalPageTransition>
  );
}

import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CreatureRevealPanels } from "./-components/CreatureRevealPanels";
import { CreatureStackTrace } from "./-components/CreatureStackTrace";

export const Route = createFileRoute("/creature-feature/")({
  head: () => ({
    meta: [{ title: "creature-feature.ts" }],
  }),
  component: CreatureFeaturePage,
});

function CreatureFeaturePage() {
  return (
    <div data-test="creature-feature-page" className="bg-[#050505] text-base-content">
      <Link
        to="/"
        data-test="creature-feature-exit"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs tracking-[0.2em] text-white/50 uppercase backdrop-blur transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        Exit
      </Link>

      <CreatureRevealPanels />
      <CreatureStackTrace />

      <section className="flex h-svh flex-col items-center justify-center gap-6 bg-[#050505] px-8 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-red-300/40 uppercase">
          // exit code 0
        </p>
        <Link
          to="/"
          className="font-serif text-4xl font-semibold tracking-[-0.03em] text-[#d6d0b7] transition-colors hover:text-primary md:text-6xl"
        >
          back to shipped work
        </Link>
      </section>
    </div>
  );
}

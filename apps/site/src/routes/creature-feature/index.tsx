import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CreatureCurtainIntro } from "./-components/CreatureCurtainIntro";
import { CreatureCurtainOutro } from "./-components/CreatureCurtainOutro";
import { CreatureRevealPanels } from "./-components/CreatureRevealPanels";
import { CreatureStackTrace } from "./-components/CreatureStackTrace";

export const Route = createFileRoute("/creature-feature/")({
  head: () => ({
    meta: [{ title: "creature-feature.ts" }],
  }),
  component: CreatureFeaturePage,
});

type Phase = "intro" | "reveal" | "flood" | "outro";

function CreatureFeaturePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");

  const exit = () => navigate({ to: "/" });

  useHotkeys("escape", exit, { preventDefault: true }, [navigate]);

  return (
    <div data-test="creature-feature-page" className="bg-[#050505] text-base-content">
      <button
        type="button"
        onClick={exit}
        data-test="creature-feature-exit"
        className="fixed top-6 left-6 z-70 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs tracking-[0.2em] text-white/50 uppercase backdrop-blur transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        Exit
      </button>

      {phase === "intro" ? <CreatureCurtainIntro onComplete={() => setPhase("reveal")} /> : null}

      {phase === "reveal" ? <CreatureRevealPanels onComplete={() => setPhase("flood")} /> : null}

      {phase === "flood" ? <CreatureStackTrace onComplete={() => setPhase("outro")} /> : null}

      {phase === "outro" ? <CreatureCurtainOutro onClose={exit} /> : null}
    </div>
  );
}

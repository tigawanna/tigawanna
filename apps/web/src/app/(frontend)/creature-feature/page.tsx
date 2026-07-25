"use client";

import { CreatureCurtainIntro } from "@/components/creature-feature/CreatureCurtainIntro";
import { CreatureCurtainOutro } from "@/components/creature-feature/CreatureCurtainOutro";
import { CreatureRevealPanels } from "@/components/creature-feature/CreatureRevealPanels";
import { CreatureStackTrace } from "@/components/creature-feature/CreatureStackTrace";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type Phase = "intro" | "reveal" | "flood" | "outro";

/**
 * Easter-egg experience: curtain intro → story panels → stack-trace flood → outro.
 */
export default function CreatureFeaturePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");

  const exit = () => router.push("/");

  useHotkeys("escape", exit, { preventDefault: true }, [router]);

  return (
    <div data-test="creature-feature-page" className="min-h-svh bg-[#050505] text-base-content">
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

import { useStackFacesReveal } from "@/hooks/use-stack-faces-reveal";
import type { CreatureRevealPanel } from "@/types/creature-feature";
import { useRef } from "react";

const PANELS: CreatureRevealPanel[] = [
  {
    id: "excited",
    eyebrow: "A tiny TypeScript horror story",
    title: "Oh boy, I'm excited for this TypeScript.",
    background: "#15180f",
    foreground: "#d6d0b7",
  },
  {
    id: "creature",
    title: "Little did I know it was a creature feature.",
    background: "#241410",
    foreground: "#e8d9b5",
  },
  {
    id: "finale",
    title: "A creature feature.",
    background: "#050505",
    foreground: "#ff5b51",
    isFinale: true,
  },
];

export function CreatureRevealPanels() {
  const listRef = useRef<HTMLDivElement>(null);
  useStackFacesReveal(listRef);

  return (
    <div ref={listRef} data-test="creature-reveal">
      {PANELS.map((panel, index) => {
        const isFirst = index === 0;

        return (
          <div
            key={panel.id}
            data-face-panel
            data-test={`creature-panel-${panel.id}`}
            className="sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden px-8"
            style={{
              backgroundColor: panel.background,
              color: panel.foreground,
              clipPath: isFirst ? undefined : "circle(7% at 50% 50%)",
            }}
          >
            <div
              data-face-content
              className="relative flex w-full max-w-3xl flex-col items-center gap-6 text-center"
              style={isFirst ? undefined : { opacity: 0 }}
            >
              {panel.eyebrow ? (
                <p className="text-xs font-semibold tracking-[0.38em] uppercase opacity-50">
                  {panel.eyebrow}
                </p>
              ) : null}

              <h2
                className={
                  panel.isFinale
                    ? "font-serif text-[18vw] leading-[0.9] font-semibold tracking-[-0.04em] md:text-[12vw]"
                    : "font-serif text-5xl leading-[1.02] font-semibold tracking-[-0.03em] md:text-7xl"
                }
              >
                {panel.title}
              </h2>

              {panel.isFinale ? (
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase opacity-40">
                  Keep scrolling
                </p>
              ) : null}
            </div>
          </div>
        );
      })}

      <div aria-hidden="true" className="h-svh bg-[#050505]" data-face-scroll-hold />
    </div>
  );
}

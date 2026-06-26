import { techChoices } from "@/config/info";
import { useTechChoicePanel } from "@/hooks/use-tech-choice-panel";
import { useTechChoiceTransition } from "@/hooks/use-tech-choice-transition";
import { MousePointerClick } from "lucide-react";
import { useRef } from "react";
import { SectionEyebrow } from "../../primitives";
import { TechChoiceDetailPanel, TechChoiceRailItem } from "./TechChoicePanels";

export function TechChoicesDesktop() {
  const { activeIndex, direction, selectIndex, detailRef } = useTechChoicePanel(techChoices.length);
  const panelRef = useRef<HTMLDivElement>(null);
  useTechChoiceTransition(panelRef, activeIndex, direction);

  const activeChoice = techChoices[activeIndex];

  return (
    <div data-test="tech-choices-desktop" className="relative hidden lg:block">
      <div className="landing-void-glow-center pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_42%,color-mix(in_oklch,var(--color-landing-cream)_8%,transparent),transparent_36%)]" />

      <div className="container relative z-10 py-16 xl:py-20">
        <div className="max-w-2xl">
          <SectionEyebrow>Why I choose what I choose</SectionEyebrow>
          <h2 className="font-serif text-4xl leading-none font-semibold tracking-[-0.045em] text-balance xl:text-5xl">
            Ten tools, one reasoned stack at a time.
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-stretch gap-8 xl:mt-10 xl:gap-12">
          <div
            ref={detailRef}
            data-test="tech-choice-detail-scroller"
            className="max-h-[min(62vh,560px)] overflow-y-auto overscroll-contain rounded-none border border-landing-cream/12 bg-landing-panel/78 shadow-2xl shadow-black/25 backdrop-blur-sm [scrollbar-color:color-mix(in_oklch,var(--color-landing-cream)_22%,transparent)_transparent] [scrollbar-width:thin]"
          >
            <div className="perspective-[1400px] [transform-style:preserve-3d]">
              <div
                ref={panelRef}
                className="origin-right p-6 will-change-transform [transform-style:preserve-3d] xl:p-7"
              >
                <TechChoiceDetailPanel choice={activeChoice} index={activeIndex} />
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-end">
            <div className="absolute left-4 top-1/2 h-[min(58vh,520px)] w-px -translate-y-1/2 bg-landing-cream/12" />

            <div className="relative flex w-full max-w-md flex-col gap-2 overflow-hidden py-2 pl-10 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
              {techChoices.map((choice, index) => (
                <TechChoiceRailItem
                  key={choice.id}
                  choice={choice}
                  index={index}
                  isActive={index === activeIndex}
                  onSelect={selectIndex}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-[10px] tracking-[0.28em] text-landing-sage/45 uppercase">
          <MousePointerClick className="size-3.5" />
          Pick a tool or scroll inside the panel
        </p>
      </div>
    </div>
  );
}

import { techChoices } from "@/config/info";
import { useTechChoicesScroll } from "@/hooks/use-tech-choices-scroll";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { SectionEyebrow } from "../../primitives";
import { TechChoiceDetailPanel, TechChoiceRailItem } from "./TechChoicePanels";

const SCROLL_VH_PER_ITEM = 36;

export function TechChoicesDesktop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  useTechChoicesScroll(sectionRef, techChoices.length);

  return (
    <div
      ref={sectionRef}
      data-test="tech-choices-desktop"
      className="relative hidden lg:block"
      style={{ height: `${techChoices.length * SCROLL_VH_PER_ITEM}vh` }}
    >
      <div className="sticky top-0 flex h-svh min-h-0 flex-col overflow-x-clip">
        <div className="landing-void-glow-center pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_42%,color-mix(in_oklch,var(--color-landing-cream)_8%,transparent),transparent_36%)]" />

        <div className="container relative z-10 flex h-full min-h-0 flex-col py-8 xl:py-10">
          <div className="max-w-2xl shrink-0">
            <SectionEyebrow>Why I choose what I choose</SectionEyebrow>
            <h2 className="font-serif text-4xl leading-none font-semibold tracking-[-0.045em] text-balance xl:text-5xl">
              Ten tools, one reasoned stack at a time.
            </h2>
          </div>

          <div className="mt-6 grid min-h-0 flex-1 grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-stretch gap-8 xl:gap-12">
            <div className="relative min-h-0">
              {techChoices.map((choice, index) => (
                <div
                  key={choice.id}
                  data-tech-detail-group
                  className="absolute inset-0 flex items-center"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <TechChoiceDetailPanel
                    choice={choice}
                    index={index}
                    className="flex h-full flex-col justify-center overflow-y-auto rounded-none border border-landing-cream/12 bg-landing-panel/78 p-6 shadow-2xl shadow-black/25 backdrop-blur-sm xl:p-7"
                  />
                </div>
              ))}
            </div>

            <div className="relative flex min-h-0 items-center justify-end">
              <div className="absolute left-4 top-1/2 h-[min(58vh,520px)] w-px -translate-y-1/2 bg-landing-cream/12" />

              <div className="relative flex w-full max-w-md flex-col gap-2 overflow-hidden py-2 pl-10 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
                {techChoices.map((choice, index) => (
                  <TechChoiceRailItem
                    key={choice.id}
                    choice={choice}
                    index={index}
                    isFirst={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-landing-cream/10 bg-landing-panel/75 px-4 py-2 text-[10px] tracking-[0.28em] text-landing-sage/45 uppercase backdrop-blur-sm">
              Scroll the tool rail
              <ArrowDown className="size-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

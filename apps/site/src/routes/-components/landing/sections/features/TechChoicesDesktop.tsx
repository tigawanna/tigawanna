import { techChoices } from "@/config/info";
import { useTechChoicePanel } from "@/hooks/use-tech-choice-panel";
import { useTechChoiceScrollLock } from "@/hooks/use-tech-choice-scroll-lock";
import { useTechChoiceTransition } from "@/hooks/use-tech-choice-transition";
import { ChevronLeft, ChevronRight, Keyboard, MousePointerClick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SectionEyebrow } from "../../primitives";
import { TechChoiceDetailPanel, TechChoiceRailItem } from "./TechChoicePanels";

export function TechChoicesDesktop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [sectionInView, setSectionInView] = useState(false);
  const { activeIndex, selectIndex, goNext, goPrev, detailRef, allVisited, visitedCount } =
    useTechChoicePanel(techChoices.length);
  const panelRef = useRef<HTMLDivElement>(null);
  useTechChoiceTransition(panelRef, activeIndex);

  useTechChoiceScrollLock({
    sectionRef,
    allVisited,
    onStepNext: goNext,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionInView(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useHotkeys(
    "arrowright, arrowdown",
    (event) => {
      if (event.repeat) return;
      goNext();
    },
    { enabled: sectionInView, preventDefault: true },
    [goNext, sectionInView],
  );

  useHotkeys(
    "arrowleft, arrowup",
    (event) => {
      if (event.repeat) return;
      goPrev();
    },
    { enabled: sectionInView, preventDefault: true },
    [goPrev, sectionInView],
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const activeItem = rail.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!activeItem) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    activeItem.scrollIntoView({
      block: "nearest",
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  }, [activeIndex]);

  const activeChoice = techChoices[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === techChoices.length - 1;

  if (!activeChoice) return null;

  return (
    <div
      ref={sectionRef}
      data-test="tech-choices-desktop"
      className="relative hidden h-svh max-h-svh overflow-hidden lg:block"
    >
      <div className="landing-void-glow-center pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_42%,color-mix(in_oklch,var(--color-landing-cream)_8%,transparent),transparent_36%)]" />

      <div className="container relative z-10 flex h-full min-h-0 flex-col py-10 xl:py-12">
        <div className="max-w-2xl shrink-0">
          <SectionEyebrow>Why I choose what I choose</SectionEyebrow>
          <h2 className="font-serif text-4xl leading-none font-semibold tracking-[-0.045em] text-balance xl:text-5xl">
            Ten tools, one reasoned stack at a time.
          </h2>
        </div>

        <div className="mt-6 grid min-h-0 flex-1 grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-stretch gap-8 xl:mt-8 xl:gap-12">
          <div
            ref={detailRef}
            data-test="tech-choice-detail-scroller"
            className="relative h-full min-h-0 overflow-y-auto overscroll-contain rounded-none border border-landing-cream/12 bg-landing-panel/20 shadow-2xl shadow-black/25 [scrollbar-color:color-mix(in_oklch,var(--color-landing-cream)_22%,transparent)_transparent] scrollbar-thin"
          >
            <div
              ref={panelRef}
              role="tabpanel"
              id="tech-choice-detail-panel"
              aria-labelledby={`tech-choice-tab-${activeChoice.id}`}
              className="min-h-full bg-landing-panel/92 backdrop-blur-sm will-change-[clip-path]"
              style={{ clipPath: "circle(108% at 50% 100%)" }}
            >
              <div data-tech-choice-content className="px-14 pt-6 pb-14 xl:px-16 xl:pt-7 xl:pb-16">
                <TechChoiceDetailPanel choice={activeChoice} index={activeIndex} />
              </div>
            </div>

            <button
              type="button"
              data-test="tech-choice-prev"
              aria-label="Previous tool"
              disabled={isFirst}
              onClick={goPrev}
              className="btn btn-ghost btn-circle absolute top-1/2 left-3 z-20 size-10 min-h-10 -translate-y-1/2 border border-landing-cream/12 bg-landing-panel/90 backdrop-blur-sm disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              data-test="tech-choice-next"
              aria-label="Next tool"
              disabled={isLast}
              onClick={goNext}
              className="btn btn-ghost btn-circle absolute top-1/2 right-3 z-20 size-10 min-h-10 -translate-y-1/2 border border-landing-cream/12 bg-landing-panel/90 backdrop-blur-sm disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-5" />
            </button>

            <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs tracking-[0.22em] text-landing-sage/70 uppercase">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(techChoices.length).padStart(2, "0")}
            </p>
          </div>

          <div className="relative flex h-full min-h-0 items-stretch justify-end">
            <div className="absolute top-0 bottom-0 left-4 w-px bg-landing-cream/12" />

            <div
              ref={railRef}
              role="tablist"
              aria-label="Technology choices"
              data-test="tech-choice-rail-scroller"
              className="relative flex min-h-0 w-full max-w-md flex-1 flex-col gap-2 overflow-y-auto overscroll-contain py-2 pl-10 mask-[linear-gradient(to_bottom,transparent,black_6%,black_94%,transparent)] [scrollbar-color:color-mix(in_oklch,var(--color-landing-cream)_22%,transparent)_transparent] scrollbar-thin"
            >
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

        <p className="mt-4 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] tracking-[0.28em] text-landing-sage/65 uppercase">
          <span className="inline-flex items-center gap-2">
            <MousePointerClick className="size-3.5" />
            Pick a tool or scroll the panel
          </span>
          <span className="inline-flex items-center gap-2">
            <Keyboard className="size-3.5" />
            Arrow keys to step
          </span>
          <span data-test="tech-choice-visit-progress" className="text-landing-sage/75">
            {allVisited
              ? "Scroll to continue"
              : `View all tools to continue · ${visitedCount}/${techChoices.length}`}
          </span>
        </p>
      </div>
    </div>
  );
}

import { useCreaturePanelSequence } from "@/hooks/use-creature-panel-sequence";
import type { CreatureRevealPanel } from "@/types/creature-feature";
import { animate } from "animejs";
import { Bug, Clapperboard, Popcorn, Skull, Sparkles, Ticket } from "lucide-react";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CreatureFeatureTitle } from "./CreatureFeatureTitle";

const PANELS: CreatureRevealPanel[] = [
  {
    id: "excited",
    eyebrow: "a tiny typescript horror story",
    title: "i'm really exciteds for the new typescript!",
    subtitle: "i exclaims with excitement",
    variant: "cinema",
    background: "#15180f",
    foreground: "#d6d0b7",
    Icon: Clapperboard,
    iconClassName: "bg-[#d6d0b7]/10 text-[#d6d0b7]",
  },
  {
    id: "little",
    title: "little did i know…",
    variant: "story",
    background: "#241410",
    foreground: "#e8d9b5",
    Icon: Sparkles,
    iconClassName: "bg-[#e8d9b5]/10 text-[#e8d9b5]",
  },
  {
    id: "feature",
    title: "it would be a feature.",
    variant: "feature",
    background: "#1b0e0d",
    foreground: "#ead7b0",
    Icon: Bug,
    iconClassName: "bg-[#ead7b0]/10 text-[#ead7b0]",
  },
  {
    id: "creature-feature",
    title: "a creature feature.",
    variant: "feature",
    background: "#0c0807",
    foreground: "#ff776d",
    Icon: Skull,
    iconClassName: "bg-[#ff776d]/10 text-[#ff776d]",
  },
  {
    id: "finale",
    title: "THE CREATURE",
    variant: "finale",
    background: "#050505",
    foreground: "#ff5b51",
    isFinale: true,
    Icon: Skull,
    iconClassName: "bg-[#ff5b51]/10 text-[#ff5b51]",
  },
];

interface CreatureRevealPanelsProps {
  onComplete: () => void;
}

export function CreatureRevealPanels({ onComplete }: CreatureRevealPanelsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    activeIndex,
    isTransitioning,
    transitionTargetIndex,
    revealProgress,
    circleRadius,
    goNext,
    isLastPanel,
  } = useCreaturePanelSequence({
    panelCount: PANELS.length,
    onComplete,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const content = root.querySelector<HTMLElement>("[data-creature-panel-content]");
    if (!content) return;

    content.style.opacity = "0";
    content.style.transform = "translate3d(0, 36px, 0) scale(0.94)";
    content.style.filter = "blur(10px)";

    const anim = animate(content, {
      opacity: [0, 1],
      translateY: [36, 0],
      scale: [0.94, 1],
      filter: ["blur(10px)", "blur(0px)"],
      duration: 1600,
      ease: "outQuart",
      delay: 400,
    });

    return () => {
      anim.revert();
    };
  }, []);

  const handleNext = () => {
    goNext();
  };

  useHotkeys(
    ["right", "down", "space", "enter"],
    (event) => {
      if (event.repeat) return;
      handleNext();
    },
    { preventDefault: true },
    [goNext],
  );

  const incomingIndex = transitionTargetIndex ?? activeIndex;
  const outgoingIndex = isTransitioning ? activeIndex : null;
  const isFinalTransition = isTransitioning && incomingIndex === PANELS.length - 1;

  return (
    <div
      ref={rootRef}
      data-test="creature-reveal"
      className="relative h-svh w-full overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 z-40 opacity-20 mix-blend-screen"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px)",
        }}
        aria-hidden="true"
      />

      {outgoingIndex !== null ? (
        <CreaturePanel
          panel={PANELS[outgoingIndex]}
          visible
          transitionProgress={revealProgress}
          exiting
        />
      ) : null}

      <CreaturePanel
        panel={PANELS[incomingIndex]}
        visible
        clipPath={
          incomingIndex === 0 && !isTransitioning
            ? undefined
            : `circle(${circleRadius}% at 50% 50%)`
        }
        contentOpacity={isTransitioning ? easeContentOpacity(circleRadius) : 1}
        transitionProgress={revealProgress}
        dramatic={isFinalTransition}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-50 flex flex-col items-center gap-4 px-6">
        <div className="flex gap-2">
          {PANELS.map((panel, index) => (
            <span
              key={panel.id}
              aria-hidden="true"
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: index === incomingIndex ? "2rem" : "0.4rem",
                backgroundColor:
                  index <= incomingIndex ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          data-test="creature-feature-next"
          onClick={handleNext}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/50 px-5 py-2.5 text-xs tracking-[0.22em] text-white/70 uppercase backdrop-blur transition-colors hover:border-white/30 hover:text-white"
        >
          {isLastPanel && !isTransitioning ? "Unleash" : "Next"}
        </button>
      </div>
    </div>
  );
}

function easeContentOpacity(radius: number) {
  const progress = Math.min(
    1,
    Math.max(0, (radius - MIN_CONTENT_RADIUS) / (108 - MIN_CONTENT_RADIUS)),
  );
  return 0.88 + progress * 0.12;
}

const MIN_CONTENT_RADIUS = 28;

function CreaturePanel({
  panel,
  visible,
  clipPath,
  contentOpacity = 1,
  transitionProgress = 1,
  exiting = false,
  dramatic = false,
}: {
  panel: CreatureRevealPanel;
  visible: boolean;
  clipPath?: string;
  contentOpacity?: number;
  transitionProgress?: number;
  exiting?: boolean;
  dramatic?: boolean;
}) {
  const Icon = panel.Icon;
  const hasMovieFrame = !panel.isFinale;
  const exitShift = exiting ? -18 * transitionProgress : 0;
  const entranceLift = dramatic ? (1 - transitionProgress) * 42 : 0;

  return (
    <div
      data-test={`creature-panel-${panel.id}`}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-8 transition-opacity duration-300"
      style={{
        backgroundColor: panel.background,
        color: panel.foreground,
        clipPath,
        opacity: visible ? 1 : 0,
      }}
    >
      {hasMovieFrame ? <CinemaDressing /> : null}

      {Icon && !panel.isFinale ? (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-[12%] right-[-8vw] size-[38vw] opacity-[0.05] md:top-[8%] md:right-[4%] md:size-[22vw]"
          strokeWidth={1.1}
        />
      ) : null}

      <div
        className="relative flex w-full max-w-3xl flex-col items-center gap-6 text-center will-change-transform"
        data-creature-panel-content={panel.id === "excited" ? true : undefined}
        style={{
          opacity: contentOpacity,
          transform: `translate3d(0, ${exitShift + entranceLift}px, 0) scale(${0.9 + contentOpacity * 0.1})`,
          filter: dramatic ? `blur(${(1 - transitionProgress) * 7}px)` : undefined,
        }}
      >
        {Icon && !panel.isFinale ? (
          <span
            className={`grid size-14 place-items-center rounded-full md:size-16 ${panel.iconClassName ?? ""}`}
          >
            <Icon className="size-6 md:size-7" strokeWidth={1.75} />
          </span>
        ) : null}

        {panel.eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.28em] opacity-50">{panel.eyebrow}</p>
        ) : null}

        {panel.isFinale ? (
          <CreatureFeatureTitle />
        ) : (
          <>
            <h2
              className={
                panel.variant === "feature"
                  ? "font-serif text-[14vw] leading-[0.92] font-semibold tracking-[-0.04em] md:text-[8vw]"
                  : "font-serif text-5xl leading-[1.02] font-semibold tracking-[-0.03em] md:text-7xl"
              }
            >
              {panel.title}
            </h2>
            {panel.subtitle ? (
              <p className="max-w-md font-mono text-xs tracking-[0.08em] text-current/45">
                {panel.subtitle}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function CinemaDressing() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/75 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/75 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[12vw] bg-linear-to-r from-black/70 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[12vw] bg-linear-to-l from-black/70 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[8vw] top-[12vh] bottom-[13vh] rounded-4xl border border-landing-cream-bg/12 shadow-[inset_0_0_60px_rgba(0,0,0,0.45)]"
        aria-hidden="true"
      />
      <Popcorn
        className="pointer-events-none absolute bottom-12 left-[8vw] size-14 rotate-[-10deg] text-landing-cream-bg/18 md:size-20"
        strokeWidth={1.3}
        aria-hidden="true"
      />
      <Ticket
        className="pointer-events-none absolute right-[9vw] bottom-16 size-12 rotate-12 text-landing-cream-bg/14 md:size-16"
        strokeWidth={1.3}
        aria-hidden="true"
      />
    </>
  );
}

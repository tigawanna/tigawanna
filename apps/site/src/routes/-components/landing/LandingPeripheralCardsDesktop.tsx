import { howIWorkCards } from "@/config/info";
import { createTimeline, onScroll } from "animejs";
import { useEffect, useRef, useState } from "react";
import { PeripheralCardArticle } from "./PeripheralCardArticle";

type CardPose = { x: number; y: number; r: number };

const CARD_COUNT = howIWorkCards.length;
const MID_INDEX = (CARD_COUNT - 1) / 2;
const CARD_ASPECT = 7 / 5;
const LG_QUERY = "(min-width: 1024px)";

type DeckLayout = {
  cardWidth: number;
  poses: CardPose[];
};

function stackPose(index: number): CardPose {
  return {
    x: 0,
    y: index * 3,
    r: -1.2 + index * 0.35,
  };
}

function distributeIntoRows(cardCount: number, rowCount: number): number[] {
  const rows: number[] = [];
  let remaining = cardCount;

  for (let row = 0; row < rowCount; row++) {
    const rowsLeft = rowCount - row;
    const count = Math.ceil(remaining / rowsLeft);
    rows.push(count);
    remaining -= count;
  }

  return rows;
}

function computeDeckLayout(availableWidth: number, availableHeight: number): DeckLayout {
  const width = Math.max(280, availableWidth);
  const height = Math.max(400, availableHeight);
  const gap = Math.max(10, Math.min(16, width * 0.014));
  const rowGap = Math.max(16, Math.min(28, height * 0.03));
  const minCardWidth = 140;
  const maxCardWidth = 210;
  const maxGridHeight = height * 0.78;

  for (const rowCount of [1, 2]) {
    const rowSizes = distributeIntoRows(CARD_COUNT, rowCount);
    const widestRow = Math.max(...rowSizes);
    const fitWidth = (width - gap * (widestRow - 1)) / widestRow;

    if (fitWidth < minCardWidth && rowCount < 2) {
      continue;
    }

    let cardWidth = Math.min(maxCardWidth, Math.max(minCardWidth, fitWidth));
    let cardHeight = cardWidth * CARD_ASPECT;
    const totalGridHeight = rowCount * cardHeight + (rowCount - 1) * rowGap;

    if (totalGridHeight > maxGridHeight) {
      cardHeight = (maxGridHeight - (rowCount - 1) * rowGap) / rowCount;
      cardWidth = cardHeight / CARD_ASPECT;
    }

    const totalRowWidth = cardWidth * widestRow + gap * (widestRow - 1);
    if (totalRowWidth > width) {
      continue;
    }

    const poses: CardPose[] = [];
    let cardIndex = 0;
    const resolvedCardHeight = cardWidth * CARD_ASPECT;
    const resolvedGridHeight = rowCount * resolvedCardHeight + (rowCount - 1) * rowGap;

    for (let row = 0; row < rowCount; row++) {
      const countInRow = rowSizes[row];
      const rowSpan = cardWidth * (countInRow - 1) + gap * (countInRow - 1);
      const startX = -rowSpan / 2;
      const y =
        -resolvedGridHeight / 2 + resolvedCardHeight / 2 + row * (resolvedCardHeight + rowGap);

      for (let column = 0; column < countInRow; column++) {
        poses[cardIndex] = {
          x: startX + column * (cardWidth + gap),
          y,
          r: 0,
        };
        cardIndex++;
      }
    }

    return { cardWidth, poses };
  }

  const cardWidth = minCardWidth;
  const cardHeight = cardWidth * CARD_ASPECT;
  const poses = howIWorkCards.map((_, index) => ({
    x: 0,
    y: index * (cardHeight + 10),
    r: 0,
  }));

  return { cardWidth, poses };
}

function poseToTransform(pose: CardPose) {
  return `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.r}deg)`;
}

function readDeckLayout(deck: HTMLDivElement | null): DeckLayout {
  const width = deck?.clientWidth ?? 1024;
  const height = deck?.clientHeight ?? 680;
  return computeDeckLayout(width, height);
}

export function LandingPeripheralCardsDesktop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<DeckLayout>(() => computeDeckLayout(1024, 680));

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const deckEl = deckRef.current;
    if (!sectionEl || !deckEl) return;

    const lg = window.matchMedia(LG_QUERY);
    if (!lg.matches) return;

    let timeline: ReturnType<typeof createTimeline> | null = null;
    let resizeFrame = 0;

    function syncLayout(deck: HTMLDivElement) {
      const nextLayout = readDeckLayout(deck);
      setLayout(nextLayout);
      deck.style.setProperty("--playing-card-width", `${nextLayout.cardWidth}px`);
      return nextLayout;
    }

    function buildTimeline(section: HTMLDivElement, deck: HTMLDivElement) {
      if (!lg.matches) {
        timeline?.revert();
        timeline = null;
        return;
      }

      timeline?.revert();

      const cards = deck.querySelectorAll<HTMLElement>("[data-playing-card]");
      const { poses } = syncLayout(deck);

      timeline = createTimeline({
        autoplay: onScroll({
          target: section,
          enter: "top",
          leave: "bottom",
          sync: true,
        }),
      });

      cards.forEach((card, index) => {
        const stack = stackPose(index);
        const spread = poses[index];
        const unfoldStagger = Math.abs(index - MID_INDEX) * 18;

        timeline!.add(
          card,
          {
            translateX: [stack.x, spread.x],
            translateY: [stack.y, spread.y],
            rotate: [`${stack.r}deg`, `${spread.r}deg`],
            duration: 520,
            ease: "outQuart",
          },
          unfoldStagger,
        );
      });
    }

    function scheduleRebuild() {
      const section = sectionRef.current;
      const deck = deckRef.current;
      if (!section || !deck) return;

      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => buildTimeline(section, deck));
    }

    buildTimeline(sectionEl, deckEl);

    const onBreakpointChange = () => scheduleRebuild();
    lg.addEventListener("change", onBreakpointChange);

    const resizeObserver = new ResizeObserver(scheduleRebuild);
    resizeObserver.observe(deckEl);
    window.addEventListener("resize", scheduleRebuild);

    return () => {
      cancelAnimationFrame(resizeFrame);
      lg.removeEventListener("change", onBreakpointChange);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleRebuild);
      timeline?.revert();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      data-test="peripheral-cards-desktop"
      className="peripheral-cards-section relative bg-[#151811] text-[#c5ccb4]"
      style={{ height: "260vh" }}
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(104,112,84,0.12),transparent_55%)]" />

        <div
          ref={deckRef}
          className="playing-deck relative h-[min(78dvh,680px)] w-full max-w-7xl"
          style={{ "--playing-card-width": `${layout.cardWidth}px` } as React.CSSProperties}
        >
          {howIWorkCards.map((card, index) => {
            const stack = stackPose(index);

            return (
              <div
                key={card.title}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: CARD_COUNT - index }}
              >
                <div data-playing-card style={{ transform: poseToTransform(stack) }}>
                  <PeripheralCardArticle card={card} index={index} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

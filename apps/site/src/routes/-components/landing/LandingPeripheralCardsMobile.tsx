import { howIWorkCards } from "@/config/info";
import { animate, onScroll, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { PeripheralCardArticle } from "./PeripheralCardArticle";

export function LandingPeripheralCardsMobile() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-mobile-card]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      return;
    }

    const anim = animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 750,
      delay: stagger(90, { start: 120 }),
      ease: "outQuart",
      autoplay: onScroll({
        target: grid,
        enter: "top 85%",
        leave: "top",
        sync: false,
        repeat: false,
      }),
    });

    const frame = requestAnimationFrame(() => {
      const rect = grid.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        anim.revert();
        animate(cards, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 750,
          delay: stagger(90, { start: 120 }),
          ease: "outQuart",
        });
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      anim.revert();
    };
  }, []);

  return (
    <div
      data-test="peripheral-cards-mobile"
      className="relative bg-[#151811] px-6 py-16 text-[#c5ccb4] sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(104,112,84,0.12),transparent_50%)]" />

      <p className="relative z-10 mx-auto mb-8 max-w-2xl text-center text-xs tracking-[0.38em] text-[#c5ccb4]/40 uppercase">
        How I work
      </p>

      <div ref={gridRef} className="relative z-10 mx-auto grid w-full max-w-3xl grid-cols-1 gap-4">
        {howIWorkCards.map((card, index) => (
          <div key={card.title} data-mobile-card className="opacity-0">
            <PeripheralCardArticle card={card} index={index} flat />
          </div>
        ))}
      </div>
    </div>
  );
}

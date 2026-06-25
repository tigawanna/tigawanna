import { CreatureEggLowercaseI } from "@/components/creature-egg/CreatureEggTrigger";
import { AppConfig } from "@/utils/system";
import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { HeroIllustration } from "./HeroIllustration";
import { LandingSearchBar } from "./LandingSearchBar";

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = section.querySelectorAll("[data-hero-reveal]");

    const anim = animate(targets, {
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 1000,
      delay: stagger(140, { start: 150 }),
      ease: "outQuart",
    });

    return () => {
      anim.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-test="landing-hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#1a1a15] px-6 pt-24 pb-20 text-[#c5ccb4] lg:pt-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_42%_42%,rgba(104,112,84,0.14),transparent_42%)]" />

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center text-center">
        <h1
          data-hero-reveal
          className="w-full font-serif text-7xl leading-[0.9] font-medium tracking-[-0.04em] md:text-8xl lg:text-[7rem] lg:whitespace-nowrap xl:text-[8.5rem] 2xl:text-[9rem]"
        >
          Denn
          <CreatureEggLowercaseI />s Waweru
        </h1>

        <p
          data-hero-reveal
          className="mt-6 w-full font-serif text-xl tracking-[0.02em] text-[#c5ccb4]/85 md:mt-8 md:text-2xl lg:mt-5 lg:text-center"
        >
          {AppConfig.brief}
        </p>

        <div data-hero-reveal className="mt-10 w-full max-w-2xl md:mt-12">
          <LandingSearchBar />
        </div>

        <div data-hero-reveal className="mt-10 w-full max-w-md md:mt-12 lg:mt-8">
          <svg
            viewBox="0 0 400 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-6 w-full max-w-sm text-[#c5ccb4]/35"
            aria-hidden="true"
          >
            <path
              d="M0 14C60 4 120 22 200 12C280 2 340 20 400 10"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>

          <p className="mt-5 text-sm leading-7 text-[#c5ccb4]/65 md:text-base lg:max-w-sm">
            {AppConfig.description}
          </p>
        </div>

        <div
          data-hero-reveal
          className="mt-14 flex w-full items-center justify-center gap-8 text-[#c5ccb4]/70 md:mt-16 lg:mt-12"
          aria-hidden="true"
        >
          <div className="h-px w-16 bg-[#c5ccb4]/20 md:w-24" />
          <HeroIllustration />
          <div className="h-px w-16 bg-[#c5ccb4]/20 md:w-24" />
        </div>
      </div>

      <a
        href="#about"
        data-hero-reveal
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.35em] text-[#c5ccb4]/40 uppercase transition-colors hover:text-[#c5ccb4]/70"
      >
        Scroll
      </a>
    </section>
  );
}

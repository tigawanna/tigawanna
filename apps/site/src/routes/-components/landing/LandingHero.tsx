import { AppConfig } from "@/utils/system";
import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { HeroIllustration } from "./HeroIllustration";

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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#1a1a15] px-6 pt-32 pb-24 text-[#c5ccb4] md:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(104,112,84,0.14),transparent_42%)]" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col px-2 md:px-6">
        <h1
          data-hero-reveal
          className="text-center font-serif text-7xl leading-[0.9] font-medium tracking-[-0.04em] md:text-8xl lg:text-9xl xl:text-[11rem]"
        >
          {AppConfig.name}
        </h1>

        <div className="relative mt-6 w-full md:mt-8">
          <p
            data-hero-reveal
            className="pl-[8%] font-serif text-xl tracking-[0.02em] text-[#c5ccb4]/85 md:pl-[12%] md:text-2xl lg:pl-[18%]"
          >
            {AppConfig.brief}
          </p>

          <div
            data-hero-reveal
            className="mt-10 ml-[12%] max-w-xs md:mt-12 md:ml-[38%] md:max-w-sm lg:ml-[42%]"
          >
            <svg
              viewBox="0 0 400 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-full text-[#c5ccb4]/35"
              aria-hidden="true"
            >
              <path
                d="M0 14C60 4 120 22 200 12C280 2 340 20 400 10"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>

            <p className="mt-5 text-sm leading-7 text-[#c5ccb4]/65 md:text-base">
              {AppConfig.description}
            </p>
          </div>
        </div>

        <div data-hero-reveal className="mt-16 flex justify-center text-[#c5ccb4]/70 md:mt-20">
          <HeroIllustration />
        </div>
      </div>

      <div
        data-hero-reveal
        className="pointer-events-none absolute right-0 bottom-16 left-0 flex items-center justify-center gap-0 px-8 md:px-16"
        aria-hidden="true"
      >
        <div className="h-px flex-1 bg-[#c5ccb4]/20" />
        <div className="mx-4 size-1.5 rounded-full bg-[#c5ccb4]/30" />
        <div className="h-px flex-1 bg-[#c5ccb4]/20" />
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

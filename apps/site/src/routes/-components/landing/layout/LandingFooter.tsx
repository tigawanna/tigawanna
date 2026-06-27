import {
  CreatureEggLowercaseI,
  CreatureEggTrigger,
} from "@/components/creature-egg/CreatureEggTrigger";
import { useCurvedMarquee } from "@/hooks/use-curved-marquee";
import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

const MARQUEE_PHRASE = "full-stack systems - warm interfaces - maintainable products - Nairobi - ";
const MARQUEE_REPEAT = 8;
const TEXT_SNAKE_PATH =
  "M0 191 C 140 248, 300 266, 440 242 C 540 206, 700 128, 900 137 C 1100 149, 1350 254, 1600 290";

function FooterCurveMarquee() {
  const textPathRef = useRef<SVGTextPathElement>(null);
  useCurvedMarquee(textPathRef, { repeatCount: MARQUEE_REPEAT });

  return (
    <div
      className="pointer-events-none relative z-30 h-28 overflow-visible md:h-32 lg:h-36"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1600 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-x-0 top-1/2 z-30 h-[130%] w-full -translate-y-1/2"
        preserveAspectRatio="none"
      >
        <defs>
          <path id="footer-curve-text-path" d={TEXT_SNAKE_PATH} />
        </defs>
        <text className="fill-base-content font-serif text-[76px] font-semibold tracking-[0.09em] opacity-35 md:text-[92px] lg:text-[108px]">
          <textPath ref={textPathRef} href="#footer-curve-text-path" startOffset="0">
            {MARQUEE_PHRASE.repeat(MARQUEE_REPEAT)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      data-test="landing-footer"
      className="relative overflow-x-clip bg-base-100 pt-12 text-base-content md:pt-20"
    >
      <FooterCurveMarquee />

      <div className="container relative z-10 pb-10 pt-4 md:pt-6">
        <div className="grid gap-10 pt-8 md:grid-cols-[1fr_auto] md:items-end md:pt-10">
          <div>
            <span className="font-serif text-5xl font-semibold tracking-[-0.055em] text-base-content md:text-7xl">
              <Link to="/" className="transition-colors hover:text-primary">
                tigawanna
              </Link>
              <CreatureEggTrigger className="ml-1 align-middle" />
            </span>
            <p className="mt-5 max-w-xl text-base leading-7 text-base-content/70">
              Full-stack TypeScript, warm int
              <CreatureEggLowercaseI />
              erfaces, strict systems, and occas
              <CreatureEggLowercaseI />
              ionally a creature feature
              <CreatureEggTrigger
                className="ml-1 align-middle"
                data-test="creature-feature-egg-period"
              />
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            {[
              { label: "GitHub", href: AppConfig.links.github },
              { label: "LinkedIn", href: AppConfig.links.linkedin },
              { label: "Dev.to", href: AppConfig.links.devto },
              { label: "Email", href: AppConfig.links.emailTo },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-content/[0.035] px-4 py-2 text-sm text-base-content/60 transition-colors hover:border-primary/40 hover:text-primary"
              >
                {link.label}
                <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-base-content/10 pt-6 text-xs tracking-[0.25em] text-base-content/55 uppercase md:flex-row">
          <p>
            &copy; {currentYear} {AppConfig.name}
          </p>
          <p>Built from Nairobi with TypeScript</p>
        </div>
      </div>
    </footer>
  );
}

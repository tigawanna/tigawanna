import { useCurvedMarquee } from "@/hooks/use-curved-marquee";
import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

const MARQUEE_PHRASE = "full-stack systems - warm interfaces - maintainable products - Nairobi - ";
const MARQUEE_REPEAT = 8;
const TEXT_ARC = "M0 300 A 5400 5400 0 0 1 1600 300";

function FooterCurveMarquee() {
  const textPathRef = useRef<SVGTextPathElement>(null);
  useCurvedMarquee(textPathRef, { repeatCount: MARQUEE_REPEAT });

  return (
    <div className="relative h-36 overflow-hidden md:h-48 lg:h-56" aria-hidden="true">
      <div className="pointer-events-none absolute top-16 left-1/2 aspect-square w-[720vw] -translate-x-1/2 rounded-full bg-[#090b08] md:top-24" />

      <svg
        viewBox="0 0 1600 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-x-0 top-0 h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <path id="footer-curve-text-path" d={TEXT_ARC} />
        </defs>
        <text className="fill-[#c5ccb4] font-serif text-[64px] font-semibold tracking-[0.09em] opacity-40">
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
    <div data-test="landing-footer" className="relative">
      <section aria-hidden="true" className="relative overflow-hidden bg-base-100 pt-12 md:pt-20">
        <FooterCurveMarquee />
      </section>

      <footer className="relative overflow-x-clip bg-[#090b08] text-base-content">
        <div className="grain-overlay" />

        <div className="container relative z-10 pb-10 pt-12 md:pt-16">
          <div className="grid gap-10 border-t border-base-content/10 pt-12 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="font-serif text-5xl font-semibold tracking-[-0.055em] text-base-content md:text-7xl">
                <Link to="/" className="transition-colors hover:text-primary">
                  tigawanna
                </Link>
                <Link
                  to="/creature-feature"
                  data-test="creature-feature-egg"
                  aria-label="creature feature"
                  className="text-primary transition-opacity hover:opacity-70"
                >
                  .
                </Link>
              </span>
              <p className="mt-5 max-w-xl text-base leading-7 text-base-content/55">
                Full-stack TypeScript, warm interfaces, strict systems, and occasionally a creature
                feature.
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

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-base-content/10 pt-6 text-xs tracking-[0.25em] text-base-content/35 uppercase md:flex-row">
            <p>
              &copy; {currentYear} {AppConfig.name}
            </p>
            <p>Built from Nairobi with TypeScript</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useCurvedMarquee } from "@/hooks/use-curved-marquee";
import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

const FOOTER_COLOR = "#090b08";
const MARQUEE_PHRASE = "full-stack systems - warm interfaces - maintainable products - Nairobi - ";
const MARQUEE_REPEAT = 8;

function FooterCurveMarquee() {
  const textPathRef = useRef<SVGTextPathElement>(null);
  useCurvedMarquee(textPathRef, { repeatCount: MARQUEE_REPEAT });

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 left-1/2 h-80 w-[150vw] -translate-x-1/2 md:h-96 lg:w-[118vw]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1600 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <path
            id="footer-curve-text-path"
            d="M-80 260C160 78 354 62 568 142C770 218 848 354 1058 335C1249 318 1397 190 1680 42"
          />
        </defs>

        <path
          d="M-120 312C125 122 330 94 552 169C768 242 847 383 1065 370C1252 359 1412 254 1720 81V460H-120V312Z"
          fill={FOOTER_COLOR}
        />
        <path
          d="M-80 260C160 78 354 62 568 142C770 218 848 354 1058 335C1249 318 1397 190 1680 42"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="2"
        />
        <path
          d="M-64 304C175 145 361 130 557 194C756 259 854 382 1068 372C1256 364 1421 269 1668 130"
          stroke="currentColor"
          strokeDasharray="2 18"
          strokeLinecap="round"
          strokeOpacity="0.16"
          strokeWidth="3"
        />
        <text className="font-serif text-[78px] font-semibold tracking-[0.09em] fill-current opacity-[0.38]">
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
      <section
        aria-hidden="true"
        className="relative overflow-x-clip bg-base-100 pt-20 text-[#697154] md:pt-28"
      >
        <div className="relative h-72 md:h-96">
          <FooterCurveMarquee />
        </div>
      </section>

      <footer className="relative -mt-32 overflow-x-clip bg-[#090b08] text-base-content md:-mt-40">
        <div className="grain-overlay" />

        <div className="container relative z-10 pb-10 pt-32 md:pt-40">
          <div className="grid gap-10 border-t border-base-content/10 pt-12 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Link
                to="/"
                className="font-serif text-5xl font-semibold tracking-[-0.055em] text-base-content md:text-7xl"
              >
                tigawanna
                <span className="text-primary">.</span>
              </Link>
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

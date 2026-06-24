import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#090b08] pt-40 text-base-content">
      <div className="footer-silhouette absolute top-0 right-0 left-0 h-44 bg-[#697154]" />
      <div className="footer-silhouette absolute top-12 right-0 left-0 h-48 bg-[#252b1d] opacity-90" />
      <div className="grain-overlay" />

      <div className="container relative z-10 pb-10">
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
  );
}

import { smoothScrollToLandingHash } from "@/lib/scroll/scroll-to-landing-hash";
import { AppConfig } from "@/utils/system";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type MouseEvent } from "react";

const navLinkClass =
  "text-sm tracking-wide text-landing-sage/70 transition-colors hover:text-landing-sage";
const ctaClass =
  "rounded-full border border-landing-sage/20 bg-landing-sage/8 px-5 py-2.5 text-sm text-landing-sage transition-colors hover:bg-landing-sage/14";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLandingRoute = useRouterState({
    select: (state) => state.location.pathname === "/",
  });

  function handleHashClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    event.preventDefault();
    setMobileOpen(false);
    smoothScrollToLandingHash(href);
  }

  return (
    <nav
      data-test="landing-navbar"
      className="fixed top-0 right-0 left-0 z-50 bg-landing-void/80 backdrop-blur-sm"
    >
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link
          to="/"
          className="shrink-0 font-serif text-lg tracking-tight text-landing-sage md:text-xl"
        >
          tigawanna
        </Link>

        {isLandingRoute ? (
          <div className="hidden flex-1 items-center justify-center gap-10 lg:flex">
            {AppConfig.navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => handleHashClick(event, item.href)}
                className={navLinkClass}
              >
                {item.label}
              </a>
            ))}
          </div>
        ) : (
          <div className="hidden flex-1 lg:block" />
        )}

        <div className="hidden items-center gap-6 md:flex">
          <div className="hidden text-center xl:block">
            <p className="text-[10px] tracking-[0.32em] text-landing-sage/65 uppercase">Based in</p>
            <p className="font-serif text-sm text-landing-sage/80">Nairobi</p>
          </div>
          {isLandingRoute ? (
            <a
              href="#contact"
              onClick={(event) => handleHashClick(event, "#contact")}
              className={ctaClass}
            >
              Get in touch
            </a>
          ) : null}
        </div>

        {isLandingRoute ? (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-landing-sage md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        ) : null}
      </div>

      {isLandingRoute && mobileOpen ? (
        <div className="space-y-4 border-t border-landing-sage/10 bg-landing-void p-6 md:hidden">
          {AppConfig.navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(event) => handleHashClick(event, item.href)}
              className="block text-landing-sage/75 transition-colors hover:text-landing-sage"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(event) => handleHashClick(event, "#contact")}
            className={`inline-flex ${ctaClass}`}
          >
            Get in touch
          </a>
        </div>
      ) : null}
    </nav>
  );
}

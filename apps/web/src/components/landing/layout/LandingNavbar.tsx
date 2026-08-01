"use client";

import {
  scrollLandingFromLocationHash,
  smoothScrollToLandingHash,
  smoothScrollToLandingTop,
} from "../utils/scroll-to-landing-hash";
import { AppConfig } from "../config/system";
import { LandingBackFab } from "./LandingBackFab";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

const navLinkClass =
  "text-sm tracking-wide text-landing-sage/70 transition-colors hover:text-landing-sage";
const ctaClass =
  "rounded-full border border-landing-sage/20 bg-landing-sage/8 px-5 py-2.5 text-sm text-landing-sage transition-colors hover:bg-landing-sage/14";

type LandingNavbarProps = {
  /** When set, shows a compact back control in the empty top-right (article pages). */
  backHref?: string;
  backLabel?: string;
};

export function LandingNavbar({ backHref, backLabel }: LandingNavbarProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isLandingRoute = pathname === "/";
  const showBack = Boolean(backHref);

  // Cold load / client nav to `/#section`, plus Back/Forward between sections.
  useEffect(() => {
    if (!isLandingRoute) return;

    scrollLandingFromLocationHash({ behavior: "instant" });

    const onPopState = () => {
      if (window.location.hash) {
        smoothScrollToLandingHash(window.location.hash, { syncUrl: false });
        return;
      }
      smoothScrollToLandingTop({ syncUrl: false });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isLandingRoute]);

  function handleHashClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    // Prevent the native jump so we keep navbar offset + layout-settle scroll,
    // then push the hash ourselves (smoothScrollToLandingHash syncs the URL).
    event.preventDefault();
    setMobileOpen(false);
    smoothScrollToLandingHash(href);
  }

  /**
   * On the landing page, `/` is already current so the brand Link would no-op.
   * Scroll to the hero instead, matching the other in-page nav clicks.
   */
  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isLandingRoute) return;
    event.preventDefault();
    setMobileOpen(false);
    smoothScrollToLandingTop();
  }

  return (
    <nav
      data-test="landing-navbar"
      className="fixed top-0 right-0 left-0 z-50 bg-landing-void/80 backdrop-blur-sm"
    >
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          onClick={handleBrandClick}
          className="shrink-0 font-serif text-lg tracking-tight text-landing-sage md:text-xl"
          data-test="landing-nav-brand"
        >
          {AppConfig.brand}
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

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden text-center xl:block">
            <p className="text-[10px] tracking-[0.32em] text-landing-sage/65 uppercase">
              {AppConfig.locationLabel}
            </p>
            <p className="font-serif text-sm text-landing-sage/80">{AppConfig.location}</p>
          </div>
          {isLandingRoute ? (
            <a
              href="#contact"
              onClick={(event) => handleHashClick(event, "#contact")}
              className={`hidden md:inline-flex ${ctaClass}`}
            >
              Get in touch
            </a>
          ) : null}
          {showBack && backHref ? (
            <LandingBackFab href={backHref} label={backLabel ?? "Back"} />
          ) : null}
          {isLandingRoute ? (
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-landing-sage md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              data-test="landing-nav-menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          ) : null}
        </div>
      </div>

      {isLandingRoute && mobileOpen ? (
        <div
          data-test="landing-nav-drawer"
          className="space-y-4 border-t border-landing-sage/10 bg-landing-void p-6 md:hidden"
        >
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

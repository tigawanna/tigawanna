import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinkClass =
  "text-sm tracking-wide text-landing-sage/70 transition-colors hover:text-landing-sage";
const ctaClass =
  "rounded-full border border-landing-sage/20 bg-landing-sage/8 px-5 py-2.5 text-sm text-landing-sage transition-colors hover:bg-landing-sage/14";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <div className="hidden flex-1 items-center justify-center gap-10 lg:flex">
          {AppConfig.navItems.map((item) => (
            <a key={item.label} href={item.href} className={navLinkClass}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <div className="hidden text-center xl:block">
            <p className="text-[10px] tracking-[0.32em] text-landing-sage/45 uppercase">Based in</p>
            <p className="font-serif text-sm text-landing-sage/80">Nairobi</p>
          </div>
          <a href="#contact" className={ctaClass}>
            Get in touch
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-landing-sage md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-landing-sage/10 bg-landing-void p-6 md:hidden">
          {AppConfig.navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block text-landing-sage/75 transition-colors hover:text-landing-sage"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className={`inline-flex ${ctaClass}`}
          >
            Get in touch
          </a>
        </div>
      )}
    </nav>
  );
}

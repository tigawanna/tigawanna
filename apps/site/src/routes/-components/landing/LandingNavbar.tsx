import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      data-test="landing-navbar"
      className="fixed top-0 right-0 left-0 z-50 bg-[#1a1a15]/80 backdrop-blur-sm"
    >
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link
          to="/"
          className="shrink-0 font-serif text-lg tracking-tight text-[#c5ccb4] md:text-xl"
        >
          tigawanna
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-10 lg:flex">
          {AppConfig.navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm tracking-wide text-[#c5ccb4]/70 transition-colors hover:text-[#c5ccb4]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <div className="hidden text-center xl:block">
            <p className="text-[10px] tracking-[0.32em] text-[#c5ccb4]/45 uppercase">Based in</p>
            <p className="font-serif text-sm text-[#c5ccb4]/80">Nairobi</p>
          </div>
          <a
            href="#contact"
            className="rounded-full border border-[#c5ccb4]/20 bg-[#c5ccb4]/8 px-5 py-2.5 text-sm text-[#c5ccb4] transition-colors hover:bg-[#c5ccb4]/14"
          >
            Get in touch
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#c5ccb4] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-[#c5ccb4]/10 bg-[#1a1a15] p-6 md:hidden">
          {AppConfig.navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block text-[#c5ccb4]/75 transition-colors hover:text-[#c5ccb4]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="inline-flex rounded-full border border-[#c5ccb4]/20 bg-[#c5ccb4]/8 px-5 py-2.5 text-sm text-[#c5ccb4]"
          >
            Get in touch
          </a>
        </div>
      )}
    </nav>
  );
}

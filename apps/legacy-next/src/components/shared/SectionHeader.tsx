import Link from "next/link";
import type { siteConfig } from "./container/site";
type RouteTypes = (typeof siteConfig)["navItems"][number]["route"];

interface SectionHeaderProps {
  heading: string;
  id: RouteTypes;
}

export function SectionHeader({ heading, id }: SectionHeaderProps) {
  return (
    <Link
      href={`#${id}`}
      id={id}
      className="
        w-full text-2xl py-4 pl-5 md:text-4xl font-bold z-30
        bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent
        border-t border-t-primary
        animate-in fade-in slide-in-from-bottom-2 duration-700
        @starting-style:opacity-0 @starting-style:translate-y-2
        hover:scale-[1.01] transition-transform
      "
    >
      {heading}
    </Link>
  );
}

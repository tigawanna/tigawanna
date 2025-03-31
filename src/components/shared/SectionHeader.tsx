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
      className="w-full text-2xl py-4 pl-5 md:text-4xl text-slate-400 font-bold z-30
            border-t border-t-green-500 "
    >
      {heading}
    </Link>
  );
}

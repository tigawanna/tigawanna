import { AppConfig } from "@/utils/system";
import { Code2, Database, Gauge, Smartphone } from "lucide-react";
import { LandingSection, ScrollReveal, SectionEyebrow } from "./LandingPrimitives";

export function LandingFeatures() {
  const featuredStacks = [
    {
      title: "Frontend systems",
      icon: Code2,
      items: ["React 19", "TanStack Router", "TanStack Query", "Tailwind CSS"],
    },
    {
      title: "Data and backend",
      icon: Database,
      items: ["Cloudflare Workers", "D1", "Drizzle", "Better Auth"],
    },
    {
      title: "Product surfaces",
      icon: Smartphone,
      items: ["React Native", "Admin panels", "Search", "AI interfaces"],
    },
    {
      title: "Quality pass",
      icon: Gauge,
      items: ["Performance", "Accessibility", "Testing", "CI/CD"],
    },
  ] as const;

  return (
    <LandingSection id="skills" tone="olive" className="pt-16 text-[#f2ead2] md:pt-20">
      <div className="container relative z-10">
        <ScrollReveal className="mx-auto mb-16 max-w-3xl text-center">
          <SectionEyebrow>Tools with dirt under the nails</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            The stack changes, the discipline stays.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#f2ead2]/70">
            These are the things I reach for when I need a portfolio, dashboard, API, mobile shell,
            or strange AI-backed interaction to actually ship.
          </p>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredStacks.map((group, index) => {
            const Icon = group.icon;

            return (
              <ScrollReveal key={group.title} delay={index < 2 ? "short" : "medium"}>
                <article className="min-h-full rounded-[2rem] border border-[#f2ead2]/15 bg-[#1d2118]/50 p-6 shadow-2xl shadow-black/10 backdrop-blur-md">
                  <span className="grid size-12 place-items-center rounded-full bg-[#f2ead2]/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-8 font-serif text-3xl leading-tight">{group.title}</h3>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#f2ead2]/10 bg-[#f2ead2]/10 px-3 py-1.5 text-xs text-[#f2ead2]/75"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay="long" className="mx-auto mt-12 max-w-5xl">
          <div className="flex flex-wrap justify-center gap-3">
            {AppConfig.techSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#f2ead2]/10 bg-[#f2ead2]/10 px-4 py-2 text-sm text-[#f2ead2]/70 transition-colors hover:border-primary/40 hover:bg-primary/15 hover:text-[#fff7dc]"
              >
                {skill}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </LandingSection>
  );
}

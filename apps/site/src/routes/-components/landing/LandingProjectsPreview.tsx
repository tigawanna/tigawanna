import { ArrowUpRight } from "lucide-react";
import { LandingSection, OrganicDivider, ScrollReveal, SectionEyebrow } from "./LandingPrimitives";

const projectCategories = [
  "Full-stack websites",
  "Mobile apps",
  "NPM packages",
  "Terminals",
  "AI projects",
  "Backends",
] as const;

const featuredProjects = [
  {
    title: "Pinned projects",
    body: "A curated shelf for shipped work, grouped by domain once the D1-backed admin flow lands.",
    label: "coming from D1",
  },
  {
    title: "Currently building",
    body: "A live workbench for active experiments, product ideas, and the systems I am polishing now.",
    label: "active work",
  },
  {
    title: "Info diet",
    body: "Notes, reads, podcasts, and small lessons rendered cleanly without dragging Markdown to the client.",
    label: "knowledge stream",
  },
] as const;

export function LandingProjectsPreview() {
  return (
    <LandingSection id="projects" tone="cream" className="text-[#1b1d14]">
      <OrganicDivider tone="cream" />
      <OrganicDivider tone="cream" flip />

      <div className="container relative z-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <ScrollReveal className="lg:sticky lg:top-28">
            <SectionEyebrow>Portfolio shelves</SectionEyebrow>
            <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
              Projects should feel browsable, not dumped.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#1b1d14]/70">
              This section is the visual shell for the incoming project mechanics. The final content
              can be powered by D1, but the page already gets the richer pacing and categories.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {projectCategories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-[#1b1d14]/15 bg-[#1b1d14]/5 px-4 py-2 text-sm text-[#1b1d14]/70"
                >
                  {category}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid gap-5">
            {featuredProjects.map((project, index) => (
              <ScrollReveal key={project.title} delay={index === 0 ? "short" : "medium"}>
                <article className="group relative overflow-hidden rounded-[2rem] border border-[#1b1d14]/10 bg-[#f6efd7]/80 p-7 shadow-xl shadow-[#1b1d14]/10 transition-transform duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 size-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/20 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                  <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-[#687054] uppercase">
                        {project.label}
                      </p>
                      <h3 className="font-serif text-4xl leading-tight tracking-[-0.03em]">
                        {project.title}
                      </h3>
                      <p className="mt-4 max-w-2xl leading-7 text-[#1b1d14]/70">{project.body}</p>
                    </div>
                    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#1b1d14]/15 text-[#1b1d14]/70 transition-colors group-hover:bg-[#1b1d14] group-hover:text-[#f6efd7]">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

import { Bug, Code2, Sparkles, TriangleAlert } from "lucide-react";
import { LandingSection, OrganicDivider, ScrollReveal, SectionEyebrow } from "./LandingPrimitives";

const errorLines = [
  "Type 'Promise<CreatureFeature>' is not assignable to type 'PortfolioSection'.",
  "Property 'vibes' is missing in type 'StrictlyTypedDeveloper'.",
  "Argument of type 'LongScrollJoke' is not assignable to parameter of type 'SEOConcern'.",
  "Type instantiation is excessively deep and possibly infinite.",
] as const;

export function LandingEnhancedExperience() {
  return (
    <LandingSection
      id="enhanced"
      tone="deep"
      className="story-gradient min-h-screen text-base-content"
    >
      <OrganicDivider tone="deep" />
      <OrganicDivider tone="deep" flip />
      <div className="grain-overlay" />

      <div className="container relative z-10">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Optional scroll weirdness</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            A tiny TypeScript horror story before the serious work.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-base-content/70">
            The full cinematic version can move to GSAP later. This first pass gives us the visual
            scene, the joke, and a clear place to deepen the scroll choreography.
          </p>
        </ScrollReveal>

        <div className="mt-20 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <ScrollReveal delay="short" className="space-y-6">
            <article className="rounded-[2rem] border border-primary/20 bg-primary/10 p-7 backdrop-blur-md">
              <span className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
                <Sparkles className="size-5" />
              </span>
              <p className="mt-8 font-serif text-4xl leading-tight">
                Oh boy, I&apos;m excited for this TypeScript.
              </p>
            </article>

            <article className="rounded-[2rem] border border-accent/20 bg-accent/10 p-7 backdrop-blur-md">
              <span className="grid size-12 place-items-center rounded-full bg-accent/15 text-accent">
                <Bug className="size-5" />
              </span>
              <p className="mt-8 font-serif text-4xl leading-tight">
                Little did I know it was a creature feature.
              </p>
            </article>
          </ScrollReveal>

          <ScrollReveal delay="medium">
            <article className="relative overflow-hidden rounded-[2.25rem] border border-base-content/10 bg-[#080a07]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="absolute top-0 right-0 size-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-error/20 blur-3xl" />
              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between border-b border-base-content/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-error/15 text-error">
                      <TriangleAlert className="size-5" />
                    </span>
                    <div>
                      <p className="font-mono text-xs text-error">tsc --noEmit</p>
                      <p className="text-sm text-base-content/50">creature-feature.ts</p>
                    </div>
                  </div>
                  <Code2 className="size-5 text-base-content/30" />
                </div>

                <div className="space-y-4 font-mono text-sm leading-7 text-base-content/70">
                  {errorLines.map((line) => (
                    <p key={line} className="rounded-xl bg-base-content/[0.035] p-4">
                      <span className="text-error">error TS2322:</span> {line}
                    </p>
                  ))}
                </div>

                <p className="mt-8 font-serif text-4xl leading-tight text-primary md:text-5xl">
                  Then we break out of the error wall and get back to shipped work.
                </p>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </LandingSection>
  );
}

import { AppConfig } from "@/utils/system";
import { ArrowDown, Github, Sparkles } from "lucide-react";
import { ScrollReveal, SectionEyebrow } from "./LandingPrimitives";

export function LandingHero() {
  return (
    <section className="landing-shell relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="grain-overlay" />
      <div className="organic-grid absolute inset-x-0 top-28 h-96 opacity-30" />
      <div className="absolute top-28 right-[8%] size-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-14 left-[8%] size-56 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative z-10 py-20">
        <div className="grid min-h-[calc(100vh-8rem)] items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <ScrollReveal className="max-w-4xl">
            <SectionEyebrow>Nairobi based full-stack TypeScript developer</SectionEyebrow>

            <h1 className="text-balance font-serif text-6xl leading-[0.92] font-semibold tracking-[-0.06em] text-base-content md:text-8xl xl:text-9xl">
              Dennis builds typed, fast, slightly weird web systems.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-base-content/70 md:text-xl">
              I work across React, TanStack, Cloudflare, databases, auth, and the messy middle where
              products become real. The portfolio is getting less bland and more alive.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#projects" className="btn btn-primary px-6">
                See the work
              </a>
              <a href="#enhanced" className="btn btn-outline gap-2 px-6">
                <Sparkles className="size-4" />
                Enhanced experience
              </a>
              <a
                href={AppConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
              >
                <Github className="size-4" />
                github.com/tigawanna
              </a>
            </div>

            <a
              href="#about"
              className="mt-16 inline-flex items-center gap-3 text-sm text-base-content/55 transition-colors hover:text-base-content"
            >
              Scroll into the rebuild
              <ArrowDown className="size-4 animate-bounce" />
            </a>
          </ScrollReveal>

          <ScrollReveal delay="medium" className="relative min-h-[34rem]">
            <div className="absolute top-8 right-6 w-56 rotate-6 rounded-[2rem] border border-base-content/10 bg-base-content/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-md md:w-72">
              <p className="font-serif text-4xl leading-none text-primary">5+</p>
              <p className="mt-3 text-sm leading-6 text-base-content/70">
                years shipping practical TypeScript products across frontend, backend, mobile, and
                deployment pipelines.
              </p>
            </div>

            <div className="absolute top-36 left-0 w-64 -rotate-6 rounded-[2rem] border border-primary/20 bg-primary/10 p-5 backdrop-blur-md md:w-80">
              <p className="text-xs tracking-[0.28em] text-primary uppercase">current stack</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["TanStack", "Cloudflare", "D1", "Better Auth", "Drizzle", "React 19"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-base-content/10 bg-base-300/50 px-3 py-1 text-xs text-base-content/75"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="absolute right-0 bottom-16 left-12 rounded-[2.5rem] border border-accent/20 bg-accent/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-md">
              <p className="font-mono text-xs text-accent">typescript.feature.creature.ts</p>
              <p className="mt-4 font-serif text-4xl leading-tight text-base-content md:text-5xl">
                Oh boy, I&apos;m excited for this TypeScript.
              </p>
              <p className="mt-4 text-sm leading-6 text-base-content/60">
                The normal portfolio loads first. The cinematic scroll joke waits until you opt in.
              </p>
            </div>

            <div className="absolute top-0 left-24 size-24 animate-drift rounded-full border border-primary/20 bg-primary/15 blur-sm" />
            <div className="absolute right-16 bottom-0 size-32 animate-float-slow rounded-full border border-accent/20 bg-accent/15 blur-sm" />
          </ScrollReveal>
        </div>

        <div className="relative mt-8 overflow-hidden border-y border-base-content/10 py-4">
          <div className="flex w-max animate-marquee gap-10 text-sm tracking-[0.35em] text-base-content/35 uppercase">
            {[
              AppConfig.brief,
              "React",
              "TanStack Start",
              "Cloudflare Workers",
              "D1",
              "Better Auth",
              "AI interfaces",
              AppConfig.brief,
              "React",
              "TanStack Start",
              "Cloudflare Workers",
              "D1",
              "Better Auth",
              "AI interfaces",
            ].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

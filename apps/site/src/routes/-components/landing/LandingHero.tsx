import { AppConfig } from "@/utils/system"

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-100 to-base-200" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container relative z-10 py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
          <div className="relative shrink-0">
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative size-56 overflow-hidden rounded-full border-4 border-primary/30 shadow-2xl shadow-primary/20 sm:size-64 md:size-72">
              <img
                src="/moi.jpg"
                alt={AppConfig.name}
                className="size-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20" />
            </div>
          </div>

          <div className="text-center md:text-left">
            <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Nairobi, Kenya
            </span>

            <h1 className="mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              Dennis Kinuthia
            </h1>

            <p className="mb-2 text-xl font-medium text-base-content/80 md:text-2xl">
              {AppConfig.brief}
            </p>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-base-content/70 md:text-lg">
              I create fast, accessible, and modern web applications with TypeScript, React, and
              TanStack Start. Passionate about developer experience and building elegant solutions
              to complex problems.
            </p>

            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <a href="#about" className="btn btn-primary">
                Learn More
              </a>
              <a href="#contact" className="btn btn-outline">
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

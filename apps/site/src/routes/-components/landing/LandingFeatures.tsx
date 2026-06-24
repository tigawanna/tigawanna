import { AppConfig } from "@/utils/system"

export function LandingFeatures() {
  return (
    <section id="skills" className="scroll-mt-20 bg-base-200/50 py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Technologies
          </h2>
          <p className="mx-auto max-w-md text-lg text-base-content/60">
            Tools and frameworks I work with daily
          </p>
        </div>

        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
          {AppConfig.techSkills.map((skill, index) => (
            <span
              key={skill}
              className="animate-fade-in rounded-full border border-base-content/10 bg-base-100 px-4 py-2 text-sm text-base-content/80 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

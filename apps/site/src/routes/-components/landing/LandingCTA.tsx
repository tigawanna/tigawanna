import { AppConfig } from "@/utils/system"
import { ArrowRight, Mail } from "lucide-react"

export function LandingCTA() {
  return (
    <section id="contact" className="scroll-mt-20 bg-base-200/50 py-24">
      <div className="container">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-primary p-12 text-center md:p-16">
          <div className="absolute top-0 right-0 size-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-content/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-content/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-bold text-primary-content md:text-5xl">
              Let&apos;s work together
            </h2>
            <p className="mx-auto mb-10 max-w-md text-lg text-primary-content/70">
              Open to freelance projects, collaborations, and interesting conversations about web
              development.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href={AppConfig.links.emailTo}
                className="btn btn-secondary gap-2 rounded-full px-8"
              >
                <Mail className="size-4" />
                {AppConfig.links.email}
              </a>
              <a
                href={AppConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost gap-2 rounded-full border border-primary-content/25 px-8 text-primary-content hover:bg-primary-content/10 hover:text-primary-content"
              >
                View GitHub
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

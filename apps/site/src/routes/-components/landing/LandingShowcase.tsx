import { AppConfig } from "@/utils/system"
import { FaGithub, FaLinkedin } from "react-icons/fa"

export function LandingShowcase() {
  return (
    <section id="about" className="scroll-mt-20 bg-base-100 py-24">
      <div className="container">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <img
              src="/github.jpg"
              alt="GitHub contributions"
              className="w-full rounded-2xl border border-base-content/10 shadow-2xl shadow-base-content/5"
              loading="lazy"
            />
          </div>

          <div>
            <h2 className="mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              About Me
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-base-content/70">
              <p>
                TypeScript enthusiast based in Nairobi, Kenya with over 5 years of fullstack
                development experience. I specialize in building exceptional web experiences using
                modern technologies.
              </p>
              <p>
                My expertise spans React frameworks, bundlers, and rendering strategies. I have
                spoken at tech conferences like Rendercon-KE about the React ecosystem and regularly
                participate in the local developer community.
              </p>
              <p>
                I excel at integrations with React and TypeScript — REST APIs, GraphQL clients,
                tRPC, and service workers — with an emphasis on type safety, clean architecture, and
                reusable components.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={AppConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-outline gap-2"
              >
                GitHub
                <FaGithub />
              </a>
              <a
                href={AppConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary gap-2"
              >
                LinkedIn
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

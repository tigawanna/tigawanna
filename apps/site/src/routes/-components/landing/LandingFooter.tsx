import { AppConfig } from "@/utils/system"
import { Link } from "@tanstack/react-router"

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-base-200 py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link to="/" className="font-serif text-2xl tracking-tight text-base-content">
            tigawanna
            <span className="text-primary">.</span>
          </Link>

          <div className="flex gap-6 text-sm text-base-content/50">
            <a
              href={AppConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-base-content"
            >
              GitHub
            </a>
            <a
              href={AppConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-base-content"
            >
              LinkedIn
            </a>
            <a
              href={AppConfig.links.devto}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-base-content"
            >
              Dev.to
            </a>
            <a
              href={AppConfig.links.emailTo}
              className="transition-colors hover:text-base-content"
            >
              Email
            </a>
          </div>

          <p className="text-sm text-base-content/40">
            &copy; {currentYear} {AppConfig.name}
          </p>
        </div>
      </div>
    </footer>
  )
}

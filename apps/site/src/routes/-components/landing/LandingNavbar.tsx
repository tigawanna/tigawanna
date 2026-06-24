import { useTheme } from "@/lib/tanstack/router/use-theme"
import { AppConfig } from "@/utils/system"
import { Link } from "@tanstack/react-router"
import { Menu, Moon, Sun, X } from "lucide-react"
import { useState } from "react"

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, updateTheme } = useTheme()

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light"
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      try {
        ;(
          document as unknown as { startViewTransition: (cb: () => void) => void }
        ).startViewTransition(() => updateTheme(newTheme))
        return
      } catch {}
    }
    updateTheme(newTheme)
  }

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-base-content/10 bg-base-100/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-tight text-base-content">
          tigawanna
          <span className="text-primary">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {AppConfig.navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-base-content/70 transition-colors hover:text-base-content"
            >
              {item.label}
            </a>
          ))}
          <a
            href={AppConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-base-content/70 transition-colors hover:text-base-content"
          >
            GitHub
          </a>
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-base-content/70 transition-colors hover:text-base-content"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-base-content/70 transition-colors hover:text-base-content"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-base-content"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-base-content/10 bg-base-100/95 p-6 backdrop-blur-xl md:hidden">
          {AppConfig.navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block text-base-content/70 transition-colors hover:text-base-content"
            >
              {item.label}
            </a>
          ))}
          <a
            href={AppConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="block text-base-content/70 transition-colors hover:text-base-content"
          >
            GitHub
          </a>
        </div>
      )}
    </nav>
  )
}

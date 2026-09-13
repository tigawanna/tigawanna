import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { TigawannaCredit } from "@tigawanna/credit";
import "@tigawanna/credit/styles.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 text-base-content">
      <div className="px-4 py-8 sm:px-6 md:px-10 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
              {(() => {
                const Icon = AppConfig.icon;
                return <Icon className="text-primary size-10 md:size-12" />;
              })()}
              <div>
                <h3 className="text-lg font-bold md:text-xl">{AppConfig.name}</h3>
                <p className="max-w-xs text-xs leading-relaxed text-base-content/70 md:text-sm">
                  {AppConfig.brief}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <a
                href={AppConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-square btn-sm md:btn-md"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </a>
              <a
                href={AppConfig.links.x}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-square btn-sm md:btn-md"
                aria-label="X"
              >
                <FaXTwitter className="size-5" />
              </a>
              <a
                href={AppConfig.links.emailTo}
                className="btn btn-ghost btn-square btn-sm md:btn-md"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </a>
            </div>

            <nav aria-label="footer-navigation" className="flex justify-center md:justify-end">
              <ul className="flex flex-col items-center gap-2 text-sm md:items-end md:text-base">
                <li>
                  <Link to="/" className="link link-hover">
                    Home
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="divider my-0" />

          <div className="flex flex-col items-center gap-4 py-4 text-xs text-base-content/60 md:text-sm">
            <p>
              Copyright © {currentYear} {AppConfig.name}. All rights reserved.
            </p>
            <TigawannaCredit position="inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}

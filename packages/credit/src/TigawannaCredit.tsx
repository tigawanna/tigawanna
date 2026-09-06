"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentType, ReactElement, SVGProps } from "react";
import { useEffect, useId, useState } from "react";
import { creditProfile } from "./constants";
import {
  DevtoIcon,
  GitHubIcon,
  GlobeIcon,
  LinkedInIcon,
  MailIcon,
  XIcon,
} from "./icons";
import { TigawannaMark } from "./mark";
import { styles } from "./styles.stylex";

export type CreditPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

/** Default floating trigger copy. */
export const DEFAULT_CREDIT_LABEL: string = `Built with ❤️ by ${creditProfile.brand}`;

export type TigawannaCreditProps = {
  /** Corner placement for the floating badge. */
  position?: CreditPosition;
  /** Override the trigger text (defaults to “Built with ❤️ by tigawanna”). */
  label?: string;
  /** Start with the profile surface open. */
  defaultOpen?: boolean;
  /**
   * Overlay mode. `auto` uses a bottom sheet below 768px, dialog above.
   * Force `sheet` / `dialog` for tests and demos.
   */
  surface?: "auto" | "dialog" | "sheet";
};

const MOBILE_QUERY = "(max-width: 768px)";

const positionStyles = {
  "bottom-right": styles.bottomRight,
  "bottom-left": styles.bottomLeft,
  "top-right": styles.topRight,
  "top-left": styles.topLeft,
} as const;

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

const socialLinks: readonly {
  key: string;
  label: string;
  href: string;
  external: boolean;
  Icon: SocialIcon;
}[] = [
  { key: "website", label: "Website", href: creditProfile.links.website, external: true, Icon: GlobeIcon },
  { key: "github", label: "GitHub", href: creditProfile.links.github, external: true, Icon: GitHubIcon },
  { key: "linkedin", label: "LinkedIn", href: creditProfile.links.linkedin, external: true, Icon: LinkedInIcon },
  { key: "twitter", label: "Twitter / X", href: creditProfile.links.twitter, external: true, Icon: XIcon },
  { key: "devto", label: "Dev.to", href: creditProfile.links.devto, external: true, Icon: DevtoIcon },
  { key: "email", label: "Email", href: creditProfile.links.emailTo, external: false, Icon: MailIcon },
];

/**
 * Subscribe to a media query. SSR-safe (starts `false` until mount).
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => {
      setMatches(media.matches);
    };
    onChange();
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}

function CreditBody(): ReactElement {
  return (
    <>
      <p {...stylex.props(styles.brand)}>{creditProfile.brand}</p>
      <p {...stylex.props(styles.body)}>{creditProfile.description}</p>
      <p {...stylex.props(styles.meta)}>
        {creditProfile.locationLabel} {creditProfile.location}
      </p>

      <div {...stylex.props(styles.socialRow)}>
        {socialLinks.map((link) => (
          <a
            key={link.key}
            href={link.href}
            title={link.label}
            aria-label={link.label}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            data-test={`tigawanna-credit-link-${link.key}`}
            {...stylex.props(styles.socialLink)}
          >
            <link.Icon width={16} height={16} />
          </a>
        ))}
      </div>

      <a
        href={creditProfile.links.website}
        target="_blank"
        rel="noopener noreferrer"
        data-test="tigawanna-credit-cta"
        {...stylex.props(styles.cta)}
      >
        Visit portfolio
      </a>
    </>
  );
}

/**
 * Floating “tigawanna” credit badge.
 * Dialog on desktop; bottom sheet on mobile viewports.
 */
export function TigawannaCredit({
  position = "bottom-right",
  label = DEFAULT_CREDIT_LABEL,
  defaultOpen = false,
  surface = "auto",
}: TigawannaCreditProps): ReactElement {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobileViewport = useMediaQuery(MOBILE_QUERY);
  const useSheet = surface === "sheet" || (surface === "auto" && isMobileViewport);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div data-tigawanna-credit="" data-test="tigawanna-credit" {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.anchor, positionStyles[position])}>
        <button
          type="button"
          data-test="tigawanna-credit-trigger"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen(true);
          }}
          {...stylex.props(styles.trigger, styles.triggerHover)}
        >
          <TigawannaMark size={16} />
          <span>{label}</span>
        </button>
      </div>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close credit panel"
            data-test="tigawanna-credit-backdrop"
            onClick={() => {
              setIsOpen(false);
            }}
            {...stylex.props(styles.backdrop)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-test={useSheet ? "tigawanna-credit-sheet" : "tigawanna-credit-dialog"}
            {...stylex.props(styles.panel, useSheet ? styles.panelSheet : styles.panelDialog)}
          >
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.headerText)}>
                <h2 id={titleId} {...stylex.props(styles.title)}>
                  {creditProfile.name}
                </h2>
                <p {...stylex.props(styles.subtitle)}>{creditProfile.role}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                data-test="tigawanna-credit-close"
                onClick={() => {
                  setIsOpen(false);
                }}
                {...stylex.props(styles.close)}
              >
                ×
              </button>
            </div>
            <CreditBody />
          </div>
        </>
      ) : null}
    </div>
  );
}

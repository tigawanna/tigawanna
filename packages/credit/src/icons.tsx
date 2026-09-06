import type { ReactElement, SVGProps } from "react";

type SvgProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: SvgProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

/** Simple brand/link glyphs — kept local so the package stays dependency-light. */
export function GlobeIcon(props: SvgProps): ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </BaseIcon>
  );
}

export function GitHubIcon(props: SvgProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.8c.85 0 1.71.12 2.51.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.21 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.58.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function LinkedInIcon(props: SvgProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.52V24H.24V8.25zM8.34 8.25h4.33v2.14h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.01 5.42 6.93V24h-4.52v-7.69c0-1.83-.03-4.19-2.55-4.19-2.55 0-2.94 1.99-2.94 4.05V24H8.34V8.25z" />
    </svg>
  );
}

export function MailIcon(props: SvgProps): ReactElement {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </BaseIcon>
  );
}

export function DevtoIcon(props: SvgProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.66 11.1c-.2 0-.3.1-.3.3v1.2c0 .2.1.3.3.3h1.1c.6 0 1.1-.5 1.1-1.1S9.36 10 8.76 10H7.66v1.1Zm8.7-.8h-1.2v3.4h1.2c.7 0 1.2-.6 1.2-1.7s-.5-1.7-1.2-1.7ZM2 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H2Zm4.7 8.5c-.7.7-1.7.7-2.6.7H2.9V9.8h1.3c.9 0 1.9 0 2.5.7.5.5.5 1.2.5 1.5s0 1-.5 1.5Zm5.5-3.5H9.3a1.6 1.6 0 0 0-1.6 1.6v1.8a1.6 1.6 0 0 0 1.6 1.6h2.9v-1.3H9.6v-.7h2.4v-1.3H9.6v-.6h2.6V10Zm6.8 4.2c-.4.9-1.2 1.3-2.2 1.3h-2.5V9.8h2.5c1 0 1.8.4 2.2 1.3.3.6.3 1.4.3 1.55 0 .2 0 1-.3 1.55Z" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useReportSiteError } from "@/hooks/use-report-site-error";

type FrontendErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Builds a clipboard-ready dump of the error name, message, digest, and stack.
 */
function formatErrorForClipboard(error: Error & { digest?: string }): string {
  const lines = [`${error.name}: ${error.message}`];
  if (error.digest) {
    lines.push(`digest: ${error.digest}`);
  }
  if (error.stack) {
    lines.push("", error.stack);
  }
  return lines.join("\n");
}

/**
 * Route-level error UI for the public site. Reports critical crashes to Telegram in production.
 */
export default function FrontendError({ error, reset }: FrontendErrorProps) {
  useReportSiteError(error);

  return (
    <div
      data-test="frontend-error"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-base-100 px-6 py-20 text-base-content"
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="text-[11px] tracking-[0.32em] text-base-content/45 uppercase">
          Unexpected hiccup
        </p>

        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl">
          Something went sideways
        </h1>

        <p className="mt-5 text-base leading-7 text-base-content/65">
          This page hit a snag on our end. Give it another moment, or head back home while we sort
          things out.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            data-test="frontend-error-home"
            className="btn btn-primary btn-sm rounded-full px-6"
          >
            Back home
          </Link>
          <button
            type="button"
            data-test="frontend-error-retry"
            onClick={reset}
            className="btn btn-ghost btn-sm rounded-full px-6"
          >
            Try again
          </button>
        </div>
      </div>

      {process.env.NODE_ENV === "development" ? (
        <FrontendErrorDevelopmentPanel error={error} />
      ) : null}
    </div>
  );
}

function FrontendErrorDevelopmentPanel({ error }: { error: Error & { digest?: string } }) {
  const [copied, setCopied] = useState(false);

  async function copyErrorDetails() {
    try {
      await navigator.clipboard.writeText(formatErrorForClipboard(error));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      data-test="frontend-error-development"
      className="mt-10 w-full min-w-0 max-w-3xl overflow-hidden rounded-lg border border-base-300 bg-base-200 p-4 text-left"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-sm">{error.name}</p>
        <button
          type="button"
          data-test="frontend-error-copy"
          onClick={() => void copyErrorDetails()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-base-content/15 px-3 py-1.5 text-xs text-base-content/70 transition-colors hover:border-base-content/30 hover:text-base-content"
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-2 min-w-0 overflow-x-auto">
        <p className="w-max max-w-none font-mono text-sm leading-6 whitespace-pre text-base-content/70">
          {error.message}
        </p>
      </div>

      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-base-content/50">digest: {error.digest}</p>
      ) : null}

      {error.stack ? (
        <details className="mt-4 group" open>
          <summary className="cursor-pointer text-sm text-base-content/60 transition-colors hover:text-base-content">
            Stack trace
          </summary>
          <pre className="mt-3 max-h-64 min-w-0 overflow-auto rounded-lg border border-base-300 bg-base-100/60 p-3 font-mono text-xs leading-5 whitespace-pre text-base-content/75">
            {error.stack}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

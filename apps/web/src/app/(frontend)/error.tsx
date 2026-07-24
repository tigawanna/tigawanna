"use client";

import Link from "next/link";
import { useReportSiteError } from "@/hooks/use-report-site-error";

type FrontendErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Route-level error UI for the public site. Reports critical crashes to Telegram in production.
 */
export default function FrontendError({ error, reset }: FrontendErrorProps) {
  useReportSiteError(error);

  return (
    <div
      data-test="frontend-error"
      className="relative flex min-h-screen flex-col items-center justify-center bg-base-100 px-6 py-20 text-base-content"
    >
      <div className="flex max-w-md flex-col items-center text-center">
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

        {process.env.NODE_ENV === "development" ? (
          <div
            data-test="frontend-error-development"
            className="mt-10 w-full rounded-lg border border-base-300 bg-base-200 p-4 text-left"
          >
            <p className="font-mono text-sm">{error.name}</p>
            <p className="mt-1 font-mono text-sm leading-6 text-base-content/70">{error.message}</p>
            {error.digest ? (
              <p className="mt-2 font-mono text-xs text-base-content/50">digest: {error.digest}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

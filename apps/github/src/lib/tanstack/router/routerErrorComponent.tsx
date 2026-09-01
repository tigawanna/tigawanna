import { AppConfig } from "@/utils/system";
import { useReportSiteError } from "@/lib/tanstack/router/use-report-site-error";
import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface RouterErrorComponentProps {
  error: Error;
}

export function RouterErrorComponent({ error }: RouterErrorComponentProps) {
  useReportSiteError(error);

  return (
    <div
      data-test="router-error"
      className="bg-base-100 text-base-content relative flex min-h-screen flex-col"
    >
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20">
        <RouterErrorProductionContent />
      </div>

      {import.meta.env.DEV ? <RouterErrorDevelopmentPanel error={error} /> : null}
    </div>
  );
}

function RouterErrorProductionContent() {
  const Icon = AppConfig.icon;

  return (
    <div className="flex max-w-md flex-col items-center text-center">
      <Icon className="text-primary/40 size-16" aria-hidden />

      <p className="text-base-content/50 mt-8 text-sm tracking-[0.32em] uppercase">
        Unexpected error
      </p>

      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Something went wrong</h1>

      <p className="text-base-content/70 mt-5 text-base leading-7">
        This page hit a snag. Try again or return to the dashboard.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" data-test="router-error-home" className="btn btn-primary">
          Back to dashboard
        </Link>
        <button
          type="button"
          data-test="router-error-retry"
          onClick={() => window.location.reload()}
          className="btn btn-ghost"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function RouterErrorDevelopmentPanel({ error }: RouterErrorComponentProps) {
  const [copied, setCopied] = useState(false);

  const copyStackTrace = async () => {
    const text = error.stack ?? `${error.name}: ${error.message}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-test="router-error-development"
      className="border-base-300 bg-base-200 relative z-10 border-t px-4 py-5"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-base-content/50 text-xs tracking-[0.28em] uppercase">Dev details</p>
          <button
            type="button"
            onClick={copyStackTrace}
            data-test="router-error-copy"
            className="btn btn-ghost btn-xs gap-1.5"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-3 font-mono text-sm">{error.name}</p>
        <p className="text-base-content/70 mt-1 font-mono text-sm leading-6">{error.message}</p>

        {error.stack ? (
          <details className="group mt-4">
            <summary className="text-base-content/60 cursor-pointer text-sm transition-colors hover:text-base-content">
              Stack trace
            </summary>
            <pre className="border-base-300 bg-base-300/30 mt-3 max-h-64 overflow-auto rounded-lg border p-3 font-mono text-xs leading-5">
              {error.stack}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}

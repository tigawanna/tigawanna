import { SiteIcon } from "@/components/icon/SiteIcon";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface RouterErrorComponentProps {
  error: Error;
}

export function RouterErrorComponent({ error }: RouterErrorComponentProps) {
  if (import.meta.env.PROD) {
    return <RouterErrorProduction />;
  }

  return <RouterErrorDevelopment error={error} />;
}

export function RouterErrorProduction() {
  return (
    <div
      data-test="router-error-production"
      className="landing-void-surface relative flex min-h-screen flex-col items-center justify-center px-6 py-20"
    >
      <div className="landing-void-glow-center pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <SiteIcon size={88} className="text-landing-sage/35" aria-hidden />

        <p className="mt-8 text-[11px] tracking-[0.32em] text-landing-sage/50 uppercase">
          Unexpected hiccup
        </p>

        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl">
          Something went sideways
        </h1>

        <p className="mt-5 text-base leading-7 text-landing-sage/65">
          This page hit a snag on our end. Give it another moment, or head back home while we sort
          things out.
        </p>

        <svg
          viewBox="0 0 400 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mt-10 h-5 w-full max-w-xs text-landing-sage/25"
          aria-hidden="true"
        >
          <path
            d="M0 14C60 4 120 22 200 12C280 2 340 20 400 10"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            data-test="router-error-home"
            className="rounded-full border border-landing-sage/20 bg-landing-sage/8 px-6 py-2.5 text-sm text-landing-sage transition-colors hover:bg-landing-sage/14"
          >
            Back home
          </Link>
          <button
            type="button"
            data-test="router-error-retry"
            onClick={() => window.location.reload()}
            className="rounded-full border border-landing-sage/10 px-6 py-2.5 text-sm text-landing-sage/70 transition-colors hover:border-landing-sage/20 hover:text-landing-sage"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

function RouterErrorDevelopment({ error }: RouterErrorComponentProps) {
  const [copied, setCopied] = useState(false);

  const copyStackTrace = async () => {
    if (error.stack) {
      await navigator.clipboard.writeText(error.stack);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      data-test="router-error-development"
      className="bg-base-200 flex h-full min-h-screen w-full flex-col items-center justify-center p-4"
    >
      <div className="card border-error bg-base-100 w-full max-w-[70%] border shadow-xl">
        <div className="card-body w-full">
          <h2 className="card-title text-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error.name}
          </h2>
          <p className="text-base-content/70">{error.message}</p>
          {error.stack && (
            <div className="collapse-arrow bg-base-200 collapse mt-2 w-full">
              <input type="checkbox" />
              <div className="collapse-title text-sm font-medium">View stack trace</div>
              <div className="collapse-content">
                <div className="relative">
                  <button
                    onClick={copyStackTrace}
                    className="btn btn-sm absolute top-2 right-2 z-10"
                    title="Copy stack trace"
                  >
                    {copied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                  <pre className="w-full overflow-x-auto text-xs">{error.stack}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

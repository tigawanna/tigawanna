"use client";

import { useReportSiteError } from "@/hooks/use-report-site-error";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Root layout error boundary. Reports critical crashes to Telegram in production.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useReportSiteError(error);

  return (
    <html lang="en">
      <body>
        <div
          data-test="global-error"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "5rem 1.5rem",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase" }}>
            Unexpected hiccup
          </p>
          <h1 style={{ marginTop: "1rem", fontSize: "2rem" }}>Something went sideways</h1>
          <p style={{ marginTop: "1.25rem", maxWidth: 28 * 16, lineHeight: 1.6, opacity: 0.7 }}>
            This page hit a snag on our end. Give it another moment, or try again.
          </p>
          <button
            type="button"
            data-test="global-error-retry"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.6rem 1.5rem",
              borderRadius: 999,
              border: "1px solid #ccc",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

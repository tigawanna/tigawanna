"use client";

import { useEffect } from "react";
import { reportSiteError } from "@/actions/report-site-error";

const reportedStoragePrefix = "site-error-reported:";

/**
 * Builds a stable fingerprint so the same crash is only reported once per session.
 */
function buildSiteErrorFingerprint(pathname: string, error: Error) {
  return `${pathname}|${error.name}|${error.message}`;
}

/**
 * Reports a critical client error to Telegram in production (deduped via sessionStorage).
 */
export function useReportSiteError(error: Error) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const pathname = window.location.pathname;
    const fingerprint = buildSiteErrorFingerprint(pathname, error);
    const storageKey = `${reportedStoragePrefix}${fingerprint}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "1");

    void reportSiteError({
      name: error.name,
      message: error.message,
      stack: error.stack,
      pathname,
      fingerprint,
    }).catch(() => {
      sessionStorage.removeItem(storageKey);
    });
  }, [error]);
}

import { useEffect } from "react";

/**
 * Reports unexpected router errors in production. No-op for the GitHub dashboard for now.
 */
export function useReportSiteError(_error: Error) {
  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }
  }, [_error]);
}

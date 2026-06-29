import { getRequestHeaders } from "@tanstack/react-start/server";

/**
 * Resolves the client IP from common proxy headers.
 *
 * Prefers the first hop in `x-forwarded-for`, then falls back to
 * `cf-connecting-ip` (Cloudflare). Returns `"unknown"` when neither is present.
 *
 * @returns Client IP string used for OTP rate limiting.
 */
export function getClientIp() {
  const headers = getRequestHeaders();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return headers.get("cf-connecting-ip") ?? "unknown";
}

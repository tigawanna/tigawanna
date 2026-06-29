/**
 * Parses a named cookie value from a raw `Request` object.
 *
 * Used by server middleware that receives the incoming `Request` directly
 * instead of TanStack Start's `getCookie` helper.
 *
 * @param request - Incoming HTTP request whose `Cookie` header is read.
 * @param name - Cookie name to look up.
 * @returns The decoded cookie value, or `undefined` when absent.
 */
export function getCookieFromRequest(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return undefined;
}

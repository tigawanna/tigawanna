import { auth } from "@/lib/better-auth/auth";
import { getRequestLog } from "@/lib/evlog/get-request-log";
import { createMiddleware } from "@tanstack/react-start";
import { createAuthMiddleware } from "evlog/better-auth";
import { evlogErrorHandler } from "evlog/nitro/v3";

const identifyAuthUser = createAuthMiddleware(auth, {
  exclude: ["/api/auth/**"],
  extend: (session) => ({ role: session.user.role }),
});

const identifyAuthMiddleware = createMiddleware().server(async ({ next, request }) => {
  await identifyAuthUser(getRequestLog(), request.headers, new URL(request.url).pathname);
  return next();
});

export const evlogRootMiddleware = createMiddleware().server(evlogErrorHandler);

export const rootServerMiddleware = [evlogRootMiddleware, identifyAuthMiddleware] as const;

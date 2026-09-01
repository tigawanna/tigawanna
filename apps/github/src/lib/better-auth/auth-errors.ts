import { createError } from "evlog";

export function backstageSessionMissingError() {
  return createError({
    code: "BACKSTAGE_SESSION_MISSING",
    message: "Unauthorized",
    status: 401,
    why: "No Better Auth session was found on this request",
    fix: "Sign in at /backstage/sign-in",
  });
}

export function backstageSessionInvalidError() {
  return createError({
    code: "BACKSTAGE_SESSION_INVALID",
    message: "Unauthorized",
    status: 401,
    why: "The Better Auth session is missing, expired, or not an admin session",
    fix: "Sign in again at /backstage/sign-in",
  });
}

export function backstageForbiddenError() {
  return createError({
    code: "BACKSTAGE_FORBIDDEN",
    message: "Forbidden",
    status: 403,
    why: "This account does not have backstage admin access",
    fix: "Sign in with an admin account",
  });
}

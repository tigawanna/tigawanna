import { createError } from "evlog";

export function adminSessionMissingError() {
  return createError({
    code: "ADMIN_SESSION_MISSING",
    message: "Unauthorized",
    status: 401,
    why: "No admin session cookie was found on this request",
    fix: "Sign in at /backstage/sign-in",
  });
}

export function adminSessionInvalidError() {
  return createError({
    code: "ADMIN_SESSION_INVALID",
    message: "Unauthorized",
    status: 401,
    why: "The admin session cookie is expired or invalid",
    fix: "Sign in again at /backstage/sign-in",
  });
}

export function adminOtpRateLimitedError() {
  return createError({
    code: "ADMIN_OTP_RATE_LIMITED",
    message: "Too many login code requests. Try again later.",
    status: 429,
    why: "This IP address requested too many login codes within the last hour",
    fix: "Wait before requesting another code",
  });
}

export function adminOtpCooldownError() {
  return createError({
    code: "ADMIN_OTP_COOLDOWN",
    message: "Wait a minute before requesting another code.",
    status: 429,
    why: "A login code was sent recently from this IP address",
    fix: "Use the code you already received or wait one minute",
  });
}

export function adminOtpTelegramError() {
  return createError({
    code: "ADMIN_OTP_TELEGRAM_FAILED",
    message: "Could not send the login code to Telegram.",
    status: 502,
    why: "Telegram did not accept the login code message",
    fix: "Check Telegram bot configuration and try again",
  });
}

export function adminOtpChallengeMissingError() {
  return createError({
    code: "ADMIN_OTP_CHALLENGE_MISSING",
    message: "Request a new login code first.",
    status: 400,
    why: "The OTP challenge cookie is missing",
    fix: "Request a new login code from /backstage/sign-in",
  });
}

export function adminOtpExpiredError() {
  return createError({
    code: "ADMIN_OTP_EXPIRED",
    message: "This login code expired. Request a new one.",
    status: 400,
    why: "The OTP challenge expired or was removed",
    fix: "Request a new login code",
  });
}

export function adminOtpInvalidError() {
  return createError({
    code: "ADMIN_OTP_INVALID",
    message: "Invalid login code.",
    status: 401,
    why: "The submitted code does not match the active challenge",
    fix: "Check the code from Telegram and try again",
  });
}

export function adminOtpAttemptsExceededError() {
  return createError({
    code: "ADMIN_OTP_ATTEMPTS_EXCEEDED",
    message: "Too many failed attempts. Request a new code.",
    status: 401,
    why: "The maximum number of verification attempts was reached",
    fix: "Request a new login code",
  });
}

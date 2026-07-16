/**
 * Returns the base URL for the application.
 *
 * @returns The base URL for the application.
 */
export function getBaseUrl() {
  if (process.env.VERCEL_URL && process.env.VERCEL_URL !== "") {
    return process.env.VERCEL_URL;
  }
  if (process.env.VITE_APP_URL && process.env.VITE_APP_URL !== "") {
    return process.env.VITE_APP_URL;
  }
  if (process.env.BETTER_AUTH_URL && process.env.BETTER_AUTH_URL !== "") {
    return process.env.BETTER_AUTH_URL;
  }
  console.error("No base URL found");
  return "http://localhost:3044";
}

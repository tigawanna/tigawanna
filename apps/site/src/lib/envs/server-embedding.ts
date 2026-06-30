/**
 * Returns true when Gemma embedding may run on the Node server (local dev / bulk CLI).
 *
 * Disabled on Vercel production to avoid loading the model in serverless functions.
 * Override with `ENABLE_SERVER_EMBEDDING=true` for intentional local bulk runs.
 */
export function isServerEmbeddingEnabled() {
  if (process.env.ENABLE_SERVER_EMBEDDING === "true") {
    return true;
  }

  if (process.env.ENABLE_SERVER_EMBEDDING === "false") {
    return false;
  }

  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  return process.env.NODE_ENV === "development";
}

/**
 * Client-safe hint for whether import UI should offer server-side embedding.
 */
export function isServerEmbeddingAvailableInClient() {
  return import.meta.env.DEV;
}

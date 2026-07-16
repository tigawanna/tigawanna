# @repo/db

Shared Drizzle schema and libSQL/Turso clients for the monorepo.

The package is split so **server-only code never leaks into the browser bundle** when consumed from TanStack Start apps.

## Package layout

| Export | Use for | Safe in browser? |
| --- | --- | --- |
| `@repo/db` | Schema tables, query helpers (`eq`, `count`, …), pagination utils, `isTursoRemote` | Yes |
| `@repo/db/client` | Remote Turso via `@libsql/client/http` (`createDb`) | Yes (HTTP only) |
| `@repo/db/local-client` | Local `file:` SQLite via native `@libsql/client` (`createLocalDb`) | **No** — Node/native only |
| `@repo/db/constants` | `DEFAULT_DATABASE_URL` | Yes |

### Why two clients?

- **`@repo/db/client`** uses the HTTP transport. It has no `node:fs`, `node:path`, or native libsql bindings, so Vite can resolve it without pulling server code into the client.
- **`@repo/db/local-client`** uses the native libsql driver for local `file:./local.db` development. Import it only from server-only files.

Never combine both transports in one module. Branch at the app layer instead.

## App integration (TanStack Start)

Each app that talks to the database should expose a single server-only entry point:

```
apps/site/src/lib/db/get-db.server.ts
```

The `.server.ts` suffix tells TanStack Start / Vite to exclude the file (and its transitive deps) from the client bundle.

```ts
import { createDb } from "@repo/db/client";
import { createLocalDb } from "@repo/db/local-client";
import { isTursoRemote } from "@repo/db";
import { getServerEnv } from "@/lib/envs/server-env";

export function getDb() {
  const { DATABASE_URL, DATABASE_AUTH_TOKEN } = getServerEnv();

  if (isTursoRemote(DATABASE_URL)) {
    if (!DATABASE_AUTH_TOKEN) {
      throw new Error("DATABASE_AUTH_TOKEN is required for Turso");
    }
    return createDb(DATABASE_URL, DATABASE_AUTH_TOKEN);
  }

  return createLocalDb(DATABASE_URL, DATABASE_AUTH_TOKEN);
}
```

### Import rules

```ts
// ✅ Server functions, route handlers, auth setup, workflows
import { getDb } from "@/lib/db/get-db.server";

// ✅ Shared types/schema in any file
import { journalEntries, eq } from "@repo/db";

// ❌ Never import getDb or local-client from files the client bundle can reach
import { getDb } from "@/lib/db/get-db.server"; // in a .tsx route component
import { createLocalDb } from "@repo/db/local-client"; // in a shared module imported by client code
```

Server functions (`createServerFn`) are fine importing `get-db.server` — handlers run on the server. The problem is **static top-level imports** in modules that the client bundle also loads (e.g. route components, `data-access-layer` hooks, shared barrels).

If a module is imported by client code, keep only `@repo/db` schema/types there. Lazy-import server modules inside handlers when needed:

```ts
export const getViewer = createServerFn({ method: "GET" }).handler(async () => {
  const { loadViewer } = await import("@/lib/auth/session.server");
  return loadViewer();
});
```

## Environment variables

Set these in the consuming app (e.g. `apps/site/.env`):

```env
# Local dev (default)
DATABASE_URL=file:./local.db

# Turso production
DATABASE_URL=libsql://your-db-name.turso.io
DATABASE_AUTH_TOKEN=your-token
```

`isTursoRemote(url)` returns true for `libsql://` URLs that are not localhost.

## Drizzle Kit

Schema and migrations live in this package. Run from the app or the package:

```bash
pnpm --filter site db:generate   # new migration from schema changes
pnpm --filter site db:migrate    # apply migrations
pnpm --filter site db:studio     # Drizzle Studio
```

`drizzle.config.ts` reads `DATABASE_URL` from `packages/db/.env`, `apps/site/.env`, or falls back to `apps/site/local.db`.

## Adding a new app

1. Add `"@repo/db": "workspace:*"` to the app's `dependencies`.
2. Create `src/lib/db/get-db.server.ts` using the pattern above.
3. Import `getDb` only from `.server.ts` files and server function handlers.
4. Re-export `db:*` scripts from the app's `package.json` if desired (see `apps/site`).
5. For local dev, add the platform's libsql optional dependency if needed (see `apps/site/package.json`).

## Common mistakes

| Mistake | Symptom | Fix |
| --- | --- | --- |
| Importing `get-db.server` from client-reachable code | `node:fs` / `node:path` in browser bundle | Move import behind `.server.ts` or dynamic `import()` in handler |
| Putting native libsql in `@repo/db/client` | Same browser bundle errors | Keep HTTP client in `client.ts`; native in `local-client.ts` |
| Using `createDb` for `file:` URLs | Runtime errors or wrong transport | Branch with `isTursoRemote` and call `createLocalDb` locally |
| Importing schema from `@repo/db/client` | Unnecessary HTTP client in graph | Import tables from `@repo/db` |

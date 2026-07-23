# @repo/db

Shared Drizzle schema and libSQL/Turso clients for the monorepo.

The package is split so **server-only code never leaks into the browser bundle** when consumed from TanStack Start apps.

## Package layout

| Export                  | Use for                                                                            | Safe in browser?               |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| `@repo/db`              | Schema tables, query helpers (`eq`, `count`, …), pagination utils, `isTursoRemote` | Yes                            |
| `@repo/db/client`       | Remote Turso via `@libsql/client/http` (`createDb`)                                | Yes (HTTP only)                |
| `@repo/db/local-client` | Local `file:` SQLite via native `@libsql/client` (`createLocalDb`)                 | **No** — Node/native only      |
| `@repo/db/d1-client`    | Cloudflare D1 binding via `drizzle-orm/d1` (`createD1Db`)                          | **No** — Workers / server only |
| `@repo/db/constants`    | `DEFAULT_DATABASE_URL`                                                             | Yes                            |

### Why multiple clients?

- **`@repo/db/client`** uses the HTTP transport. It has no `node:fs`, `node:path`, or native libsql bindings.
- **`@repo/db/local-client`** uses the native libsql driver for local `file:./local.db` development.
- **`@repo/db/d1-client`** wraps a Cloudflare D1 binding (`env.DB`). Same schema; different driver.

Never combine transports in one module. Branch at the app layer instead. Keep Turso HTTP available while importing data into D1.

## App integration (TanStack Start)

TanStack Start uses [import protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection): `**/*.server.*` files are denied in the client bundle. The compiler strips server-only imports from `createServerFn` handlers — but only when those imports are not referenced outside a handler.

Follow the [documented file layout](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#file-organization):

```
src/lib/db/
  get-db.server.ts          # sync DB factory (HTTP vs native)

src/modules/journal/
  journal.server.ts         # server-only DB queries
  journal.functions.ts      # createServerFn wrappers (safe to import anywhere)

src/modules/lessons/
  lessons.server.ts         # server-only lesson fetching
  lessons.ts                # createServerFn wrappers
```

### `get-db.server.ts`

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

### `*.functions.ts` — static imports, no dynamic `import()`

```ts
import { createBackstageServerFn } from "@/lib/tanstack/create-backstage-server-fn";
import { listJournalEntriesForBackstage as listJournalEntriesImpl } from "@/modules/journal/journal.server";

export const listJournalEntriesForBackstage = createBackstageServerFn({ method: "GET" })
  .validator(/* ... */)
  .handler(async ({ data }) => listJournalEntriesImpl(data));
```

`journal.functions.ts` is imported by client query options. That is fine: the build replaces handler bodies with RPC stubs and removes the `journal.server` import from the client bundle.

### Import rules

```ts
// ✅ Server function wrappers — import anywhere (client gets RPC stubs)
import { listJournalEntriesForBackstage } from "@/modules/journal/journal.functions";

// ✅ Static import of .server.ts in .functions.ts — only used inside handlers
import { findUserById } from "./users.server";

// ✅ Schema/types from @repo/db in any file
import { journalEntries, eq } from "@repo/db";

// ❌ Import .server.ts from client components, query-option files, or shared barrels
import { getDb } from "@/lib/db/get-db.server"; // in a .tsx route component

// ❌ Export helpers from .functions.ts that call DB outside createServerFn handlers
export async function fetchJournalLessonPage() {
  const db = getDb(); // "leaky helper" — keeps server imports alive in client build
}

// ❌ Dynamic import() for server functions or .server modules
const { getDb } = await import("@/lib/db/get-db.server");
```

### Leaky helpers

If a module imported by the client exports a plain async function that touches the DB, import protection fails even when you also export `createServerFn` wrappers. Move DB logic to `*.server.ts` and call it only from inside handlers:

```ts
// journal.server.ts
export async function fetchJournalLessonPage(page: number, perPage: number) {
  /* ... */
}

// lessons.ts — static import, only referenced inside handlers
import { fetchLessonsPage } from "./lessons.server";

export const getLessons = createServerFn({ method: "GET" }).handler(async ({ data }) =>
  fetchLessonsPage(data.page, data.perPage),
);
```

## Environment variables

```env
DATABASE_URL=file:./local.db
DATABASE_URL=libsql://your-db-name.turso.io
DATABASE_AUTH_TOKEN=your-token
```

## Drizzle Kit

```bash
pnpm --filter site db:generate
pnpm --filter site db:migrate
pnpm --filter site db:studio
```

## Adding a new app

1. Add `"@repo/db": "workspace:*"` to dependencies.
2. Create `src/lib/db/get-db.server.ts`.
3. For each domain: `domain.server.ts` (DB logic) + `domain.functions.ts` (RPC wrappers).
4. Never import `get-db.server` or `local-client` from client-reachable code except via `.server.ts` helpers used only in handlers.

## Common mistakes

| Mistake                                     | Symptom                             | Fix                                                    |
| ------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| Leaky helper in `.functions.ts`             | `[import-protection] Import denied` | Move DB logic to `.server.ts`; call only from handlers |
| Dynamic `import()` of `.server.*`           | Same error                          | Use static imports per TanStack docs                   |
| `get-db.server` in client-reachable file    | Import denied                       | Route through `domain.server.ts`                       |
| Mixed barrel re-exporting `.server` modules | Transitive leak                     | Split safe and server-only entry points                |
| Putting native libsql in `@repo/db/client`  | `node:fs` in browser                | Keep HTTP in `client.ts`, native in `local-client.ts`  |

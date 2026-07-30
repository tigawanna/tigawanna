# `apps/web` scripts

`package.json` only keeps commands you run often. Everything else is invoked directly below (from `apps/web`).

## Everyday (`pnpm …`)

| Script                          | When                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| `dev`                           | Local Next + Payload on `:3055`                                 |
| `devsafe`                       | Wipe `.next` then `dev`                                         |
| `build` / `start`               | Production build / serve                                        |
| `lint` / `check-types`          | CI-style checks                                                 |
| `generate:types`                | After Payload schema / jobs / field changes                     |
| `generate:importmap`            | After admin component path changes                              |
| `payload`                       | Payload CLI passthrough (`pnpm payload …`)                      |
| `seed`                          | Full local seed (`seed-all`: journals + Dev.to import + verify) |
| `sync:repositories`             | Pull GitHub → Payload repositories (needs `GH_PAT`)             |
| `test:e2e` / `test:e2e:install` | Playwright                                                      |

Run from the app: `pnpm --filter web <script>` or `cd apps/web && pnpm <script>`.

---

## One-off / rare (run the file)

Prefix with `cd apps/web` (or use paths from the monorepo root).

### Schema migrations (libSQL / SQLite column scripts)

Safe to re-run; most are no-ops if the column/table already exists.

```bash
node --experimental-strip-types ./src/seed/migrate-add-cover-url.ts
node --experimental-strip-types ./src/seed/migrate-add-devto-article-id.ts
node --experimental-strip-types ./src/seed/migrate-contact-messages.ts
node --experimental-strip-types ./src/seed/migrate-repositories.ts
node --experimental-strip-types ./src/seed/migrate-add-repository-category.ts
node --experimental-strip-types ./src/seed/migrate-add-repository-monorepo.ts
node --experimental-strip-types ./src/seed/migrate-add-repository-last-enriched-at.ts
node --experimental-strip-types ./src/seed/migrate-journals-to-blogs.ts
```

| File                                         | Purpose                           |
| -------------------------------------------- | --------------------------------- |
| `migrate-add-cover-url.ts`                   | `coverUrl` on blogs               |
| `migrate-add-devto-article-id.ts`            | Dev.to article id column          |
| `migrate-contact-messages.ts`                | Contact messages collection table |
| `migrate-repositories.ts`                    | Repositories collection bootstrap |
| `migrate-add-repository-category.ts`         | `category` on repositories        |
| `migrate-add-repository-monorepo.ts`         | Monorepo / README cache columns   |
| `migrate-add-repository-last-enriched-at.ts` | `lastEnrichedAt` for enrich skip  |
| `migrate-journals-to-blogs.ts`               | One-time Journals → Blogs move    |

### Seed / import / backfill (Payload `run`)

```bash
cross-env NODE_OPTIONS=--no-deprecation payload run ./src/seed/seed-journals.ts
cross-env NODE_OPTIONS=--no-deprecation payload run ./src/seed/import-devto.ts
cross-env NODE_OPTIONS=--no-deprecation payload run ./src/seed/backfill-covers.ts
cross-env NODE_OPTIONS=--no-deprecation payload run ./src/seed/test-email.ts
cross-env NODE_OPTIONS=--no-deprecation TEST_EMAIL_MODE=forgot payload run ./src/seed/test-email.ts
```

| File                 | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `seed-journals.ts`   | Journal fixtures only (prefer `pnpm seed` for full)   |
| `import-devto.ts`    | CLI Dev.to import (Admin → Blogs → Import also works) |
| `backfill-covers.ts` | Backfill cover images after `coverUrl` exists         |
| `test-email.ts`      | Smoke Telegram / forgot-password email adapter        |

### Misc

```bash
# Preview = start after build
pnpm build && pnpm start

# E2E against a fresh production build
pnpm build && pnpm test:e2e
```

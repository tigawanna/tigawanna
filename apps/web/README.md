# Next.js + Payload landing experiment

Isolated Lighthouse / performance comparison against the TanStack Start portfolio landing.

## Run

```bash
pnpm --filter web install   # from monorepo root: pnpm install
pnpm --filter web dev       # http://localhost:3055
```

Admin: [http://localhost:3055/admin](http://localhost:3055/admin)

Everyday scripts: `dev`, `build`, `seed`, `sync:repositories`, `generate:types`, …  
One-off migrations / rare seed helpers: see **[SCRIPTS.md](./SCRIPTS.md)**.

## Stack

- Next.js 16 (`cacheComponents`, experimental `viewTransition`)
- Payload 3 + `@payloadcms/db-sqlite` (Drizzle + libSQL) — local `file:` SQLite or Turso
- Blogs collection (journal or post) with draft/publish, Lexical + Code/Banner/Media blocks
- Landing UI is Next-native
- Data: Cache Components (`use cache` + Suspense + `cacheTag` revalidation from Payload hooks)
- Contact: server action → Telegram (`@repo/telegram`) + Payload **Contact messages** inbox
- Critical frontend errors: `error.tsx` / `global-error.tsx` → Telegram in production

## Blogs

- Admin → **Blogs** — one collection; each entry is `Journal` or `Blog post` (`kind`). Switch later if a journal grows into a full post.
- Public routes: `/journals` (journals), `/blogs` (posts), plus `[slug]` detail pages
- Landing sections filter by `kind`
- Seed: `pnpm seed` (journals + Dev.to import + verify). Journals-only / Dev.to CLI / cover backfill: [SCRIPTS.md](./SCRIPTS.md)
- Re-import published Dev.to posts anytime from Admin → **Blogs** → **Import from Dev.to** (optional `DEVTO_USERNAME`)
- Dev.to workflow (posts): ⋯ menu **Publish to Dev.to** / **Sync from Dev.to** (also under Meta → Dev.to). Requires `DEV_TO_KEY` + site origin (`NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`).

## Notes

- Set `PORTFOLIO_USE_STATIC_FIXTURES=1` (default in `.env`) for offline fixtures
- For Turso: set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN`
- Payload auth powers `/admin` only — no separate Better Auth in this app

## Lighthouse (local smoke)

```bash
# with Playwright Chromium
export CHROME_PATH=~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome
pnpm --filter web exec lighthouse http://localhost:3055/ \
  --only-categories=performance --form-factor=mobile \
  --chrome-flags="--headless --no-sandbox" --output=json --output-path=./lighthouse-web.json
```

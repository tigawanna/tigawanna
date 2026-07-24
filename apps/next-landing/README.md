# Next.js + Payload landing experiment

Isolated Lighthouse / performance comparison against the TanStack Start portfolio landing.

## Run

```bash
pnpm --filter next-landing install   # from monorepo root: pnpm install
pnpm --filter next-landing dev       # http://localhost:3055
```

Admin: [http://localhost:3055/admin](http://localhost:3055/admin)

## Stack

- Next.js 16 (`cacheComponents`, experimental `viewTransition`)
- Payload 3 + `@payloadcms/db-sqlite` (Drizzle + libSQL) — local `file:` SQLite or Turso
- Journals collection with draft/publish, Lexical + Code/Banner/Media blocks
- Landing UI is Next-native
- Data: Cache Components (`use cache` + Suspense + `cacheTag` revalidation from Payload hooks)
- Contact: server action (`src/actions/contact.ts`)

## Journals

- Admin → **Journals** — `kind: post` (blog) or `til` (short snippet)
- Public routes: `/journals`, `/journals/[slug]`
- `/lessons` redirects to `/journals`
- Landing TIL section + articles section read published journals (static fixtures until first publish)
- Seed fixtures into Payload: `pnpm seed:journals`
- Dev.to cross-post is scaffolded (`devto` fields + `src/workflows/devto-crosspost.ts`)

## Notes

- Set `PORTFOLIO_USE_STATIC_FIXTURES=1` (default in `.env`) for offline fixtures
- For Turso: set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN`
- Payload auth powers `/admin` only — no separate Better Auth in this app

## Lighthouse (local smoke)

```bash
# with Playwright Chromium
export CHROME_PATH=~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome
pnpm --filter next-landing exec lighthouse http://localhost:3055/ \
  --only-categories=performance --form-factor=mobile \
  --chrome-flags="--headless --no-sandbox" --output=json --output-path=./lighthouse-next-landing.json
```

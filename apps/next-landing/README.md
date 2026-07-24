# Next.js + Payload landing experiment

Isolated Lighthouse / performance comparison against the TanStack Start portfolio landing.

## Run

```bash
pnpm --filter next-landing install   # from monorepo root: pnpm install
pnpm --filter next-landing dev       # http://localhost:3055
```

## Stack

- Next.js 16 (`cacheComponents`, experimental `viewTransition`)
- Payload 3 (SQLite) — admin at `/admin`, blog later
- Landing UI is Next-native (no `@repo/ui/landing`)
- Data: server `Promise.all` + optional `use cache`
- Contact: server action (`src/actions/contact.ts`)

## Notes

- Set `PORTFOLIO_USE_STATIC_FIXTURES=1` (default in `.env`) for offline fixtures
- Payload admin is available but not required to render the landing page
- Nested `/lessons` and `/project` routes are stubbed; cards link there already

## Lighthouse (local smoke)

```bash
# with Playwright Chromium
export CHROME_PATH=~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome
pnpm --filter next-landing exec lighthouse http://localhost:3055/ \
  --only-categories=performance --form-factor=mobile \
  --chrome-flags="--headless --no-sandbox" --output=json --output-path=./lighthouse-next-landing.json
```

First mobile run on this machine landed around **Performance 66** (FCP ~1.5s, LCP ~2.8s, TBT ~1.8s). Compare against the TanStack portfolio on the same machine/network before deciding — TBT is still the main drag (lots of client islands for animations/filters).

# Landing / portfolio Playwright e2e

Self-contained tests for the public landing page. Copy this whole `tests/`
folder with the landing UI (or into another app that mirrors the same
`src/config` + `src/data/portfolio` layout) and adjust `playwright.config.ts`
`appRoot` / `webServer` if needed.

## What these cover

- Section smoke: hero → about → skills → projects → articles → infodiet → journal → contact
- Navbar hash scrolling (desktop + mobile menu)
- Card links (GitHub / Site / Dev.to / infodiet) and lesson + project detail telltales
- Network isolation: browser third-party hosts stubbed; GitHub server-fns fulfilled from static fixtures

## Run (from `apps/portfolio`)

```bash
pnpm test:e2e:install   # once — Chromium
pnpm test:e2e
```

Desktop only:

```bash
pnpm test:e2e --project=desktop
```

Mobile only (Chromium Pixel 5 emulation):

```bash
pnpm test:e2e --project=mobile
```

Against an already-running dev server:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3045 pnpm exec playwright test --config src/routes/-components/landing/tests/playwright.config.ts
```

## Porting

1. Copy `tests/` next to the landing components in the target app.
2. Point `appRoot` in `playwright.config.ts` at that app’s root.
3. Keep or update `fixtures/expected.ts` / `fixtures/github.ts` imports so they resolve to the host app’s `config/` + `data/portfolio/static` modules (five levels up from `tests/fixtures/` → `src/`).

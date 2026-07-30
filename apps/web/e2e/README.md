# web e2e (app-coupled)

Playwright coverage for the Next.js + Payload landing experiment.

Runs against a **production preview** (`next build` → `next start`) so the
server cannot HMR or rewrite files mid-suite.

```bash
# Build + e2e
pnpm build && pnpm test:e2e

# Reuse an already-running `pnpm start:e2e` on :4055
PLAYWRIGHT_REUSE=1 pnpm test:e2e

pnpm test:e2e:install
```

Asserts against `@repo/site-constants` and static fixtures under
`src/components/landing/data/static.ts`.

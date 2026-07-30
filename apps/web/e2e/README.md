# web e2e (app-coupled)

Playwright coverage for the Next.js + Payload landing experiment.

Runs against a **production preview** (`next build` → `pnpm start:e2e` on `:4055`)
so the server cannot HMR or rewrite files mid-suite.

## Layout

Specs live under `landing/` — one file (or desktop/mobile pair) per section:

| File                                        | Section                                |
| ------------------------------------------- | -------------------------------------- |
| `01-hero.spec.ts`                           | Hero copy + brand                      |
| `02-stack-cube.spec.ts` / `.mobile.spec.ts` | Post-hero stack cube scroll            |
| `03-how-i-work.spec.ts` / `.mobile.spec.ts` | `#about` five curved steps             |
| `04-skills.spec.ts` / `.mobile.spec.ts`     | `#skills` click / swipe through tools  |
| `05-projects.spec.ts`                       | `#projects` CMS cards + detail         |
| `06-content-contact.spec.ts`                | Blogs → contact, nav, creature feature |

```bash
# Build + e2e
pnpm build && pnpm test:e2e

# Reuse an already-running `pnpm start:e2e` on :4055
PLAYWRIGHT_REUSE=1 pnpm test:e2e

pnpm test:e2e:install
```

Asserts against `@repo/site-constants` and (for blogs/journals) static fixtures under
`src/components/landing/data/static.ts`. Projects assert against live CMS cards.

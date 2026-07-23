# Portfolio landing e2e (app-coupled)

These Playwright tests belong to the **portfolio app**, not `@repo/ui`.

## Why here (not in the component package)

| Concern                        | Owner              |
| ------------------------------ | ------------------ |
| Running HTTP server / SSR      | App                |
| QueryClient + server fns       | App                |
| Route tree                     | App                |
| Network stubs for `/_serverFn` | App                |
| Presentational landing UI      | `@repo/ui/landing` |

Component libraries should use unit/component tests. E2E asserts a real app
composition.

## Routes under test

Both `/` and `/gg` mount the shared `@repo/ui/landing` `LandingPage`.

```bash
# Default: shared landing at /
pnpm test:e2e

# Explicit alias route (same package)
pnpm test:e2e:gg
```

`LANDING_PATH` defaults to `/`.

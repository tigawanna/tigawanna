# tigawanna

Personal monorepo for [Dennis Waweru](https://github.com/tigawanna) — portfolio, tooling, and experiments.

## Structure

```
tigawanna/
├── apps/
│   ├── site/          # New portfolio (TanStack Start) — main site
│   └── legacy-next/   # Previous Next.js portfolio (reference / migration source)
└── packages/
    ├── isomorphic/    # Shared types and utilities
    ├── ui/            # Shared UI primitives
    └── typescript-config/
```

## Planned

- **site** — TanStack Start portfolio (replacing the Vercel Next.js deployment)
- **legacy-next** — existing [tigawanna/tigawanna](https://github.com/tigawanna/tigawanna) site, kept for reference during migration
- **cli** — GitHub management CLI (bulk delete repos, etc.) — coming later

## Development

```bash
pnpm install

# New TanStack Start portfolio (port 3040)
pnpm dev
# or
pnpm dev:site

# Legacy Next.js site (port 3000)
pnpm dev:legacy
```

## Links

- GitHub: https://github.com/tigawanna
- LinkedIn: https://linkedin.com/in/dennis-kinuthia-waweru
- Legacy site: https://tigawanna-portfolio.vercel.app

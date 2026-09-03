TanStack Start. Shared rules: root `AGENTS.md`.

# Conventions

**Routes:** Folder + `index.tsx`. Thin file: `beforeLoad`, loader, compose. Prefix `-` to opt a folder out of the router.

**Do:** `beforeLoad` + `redirect()` for auth. Route UI in `-components/`. Defaults on `validateSearch` — after parse use `search.page` / `search.q` directly. `queryOptions` + `useSuspenseQuery` in the component. Mutations: `meta.invalidates`, `onError(err: unknown)`.

**Don't:** Skip `beforeLoad` on protected routes. Put route UI in the route file or global `components/`. Wrap every query in `useX`. `qc.invalidateQueries` when `meta.invalidates` exists. Re-default search (`search.page ?? 1`) in the list. Invent a Next `app/` tree here.

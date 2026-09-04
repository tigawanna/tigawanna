Next.js App Router + Payload. Shared rules: root `AGENTS.md`. Payload: `../../.agents/skills/payload/SKILL.md`.

# Conventions

**Pages:** Thin `page.tsx` — compose + `<Suspense>`. Route UI in `_components/` next to the page.

**Do:** Await `searchParams` under a Suspense boundary. Keep collections/fields/hooks in `collections/`. Jobs in `jobs/`. Infer types from Payload / query results.

**Don't:** Dump page UI into `src/components/` or inline a whole screen in `page.tsx`. Put CMS fields outside `collections/`. Cast Payload types to homemade shapes.

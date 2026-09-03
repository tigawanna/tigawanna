# Apps

- `apps/web` — Next.js + Payload. See `apps/web/AGENTS.md`.
- `apps/site`, `apps/github` — TanStack Start. See that app’s `AGENTS.md`.

Payload details: `.agents/skills/payload/SKILL.md`.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

Pre-commit already formats and lints. After big changes: `pnpm quality && pnpm check-types`.

<!--VITE PLUS END-->

# Conventions

**Code:** React 19 Compiler — no `useMemo` / `useCallback`. `@/` imports. `satisfies`. Zod v4 (`z.email()` / `z.url()`). JSDoc on utils. No `any` or type-hiding casts. `catch` is `unknown`.

**Control flow:** Early returns over nested `if`s and JSX ternary soup. Guard pending/empty/error first, then the happy path.

**UI:** shadcn. DaisyUI only for theme tokens, `btn` classes, or tiny standalone bits. Theme tokens, no hardcoded colors. Responsive (`md:`, `lg:`). `data-test` on interactive UI.

**Files:** Thin route/page files. Route-only UI next to the route, not in global `components/`, not inline. `components/ui/` is shadcn codegen only.

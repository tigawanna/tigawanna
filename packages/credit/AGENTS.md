# AGENTS.md

`@tigawanna/credit` — embeddable floating credit badge.

## Stack

- React 19 + StyleX (`unplugin-stylex`, class prefix `twc`)
- Library build via **tsdown** (`dts: true`, `isolatedDeclarations`)
- Stories via Ladle

## Rules

- No design-system resets or global CSS. Published CSS is StyleX atomics only.
- Host theming via CSS variables (`--primary`, `--card`, `--border`, …) with literal fallbacks.
- Keep the public API small: `TigawannaCredit` + `creditProfile` + types.
- After changes: `pnpm build` (runs attw) and smoke Ladle if UI moved.

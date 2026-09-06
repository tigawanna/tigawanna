# `@tigawanna/credit`

Floating “made by tigawanna” credit badge for project landing pages. Dialog on desktop, bottom sheet on mobile.

Built with plain React + StyleX — no design-system reset, unique `twc*` class prefix so it won’t fight host styles.

## Install

```bash
pnpm add @tigawanna/credit
# or: npm i / yarn add @tigawanna/credit
```

Peers: `react` and `react-dom` ^19.

## Usage

Import the stylesheet once (CSS is not injected by the JS entry), then mount the badge:

```tsx
import { TigawannaCredit } from "@tigawanna/credit";
import "@tigawanna/credit/styles.css";

export function App() {
  return (
    <>
      {/* your page */}
      <TigawannaCredit />
    </>
  );
}
```

In Next.js App Router, put it in a client layout/page (the component is `"use client"`).

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `"bottom-right"` | Corner for the floating trigger |
| `label` | `string` | `Built with ❤️ by tigawanna` | Trigger text |
| `defaultOpen` | `boolean` | `false` | Start with the profile surface open |
| `surface` | `"auto" \| "dialog" \| "sheet"` | `"auto"` | Overlay mode (`auto` → sheet ≤768px, dialog above) |

```tsx
<TigawannaCredit
  position="bottom-left"
  label="Built by tigawanna"
  surface="dialog"
/>
```

### Theming

The badge reads host CSS variables when present (shadcn / Tailwind v4 style), with built-in fallbacks:

- `--primary` / `--color-primary`
- `--background` / `--card` / `--foreground`
- `--muted` / `--border` / `--radius`

No extra theme setup is required for a basic embed.

### Other exports

```ts
import {
  creditProfile, // baked profile snapshot
  DEFAULT_CREDIT_LABEL,
  type TigawannaCreditProps,
  type CreditPosition,
  type CreditProfile,
} from "@tigawanna/credit";
```

## Local development

```bash
pnpm dev          # tsdown watch + Ladle
pnpm build        # library build + export check
pnpm check-types
```

## License

MIT

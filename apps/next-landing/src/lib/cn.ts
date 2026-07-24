/**
 * Tiny className merger (shadcn-style) without pulling in a shared utils package.
 */
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

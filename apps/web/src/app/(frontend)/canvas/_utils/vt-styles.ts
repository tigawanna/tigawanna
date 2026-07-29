export const CANVAS_VT_STYLES = ["wipe", "angled", "vertical", "slides", "flip"] as const;

export type CanvasVtStyle = (typeof CANVAS_VT_STYLES)[number];

/**
 * Whether a string is a known canvas view-transition style.
 */
export function isCanvasVtStyle(value: string): value is CanvasVtStyle {
  return (CANVAS_VT_STYLES as readonly string[]).includes(value);
}

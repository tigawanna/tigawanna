export const CANVAS_COLORS = [
  { name: "red", value: "#FF0000" },
  { name: "green", value: "#00FF00" },
  { name: "blue", value: "#0000FF" },
  { name: "yellow", value: "#FFFF00" },
] as const;

export type CanvasColorName = (typeof CANVAS_COLORS)[number]["name"];

/**
 * Shared view-transition name for a canvas color swatch (list ↔ detail).
 */
export function canvasColorVtName(color: string) {
  return `color-${color}`;
}

/**
 * Resolves a canvas color route param to its hex value.
 */
export function canvasColorValue(color: string) {
  const match = CANVAS_COLORS.find((entry) => entry.name === color);
  return match?.value ?? color;
}

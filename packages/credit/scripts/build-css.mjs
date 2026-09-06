import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

/**
 * When hosts use class-based dark mode (`.dark` / `data-theme`) without
 * setting `color-scheme`, force it on the badge so `light-dark()` fallbacks work.
 */
const DARK_SCHEME_BRIDGE = `
/* Class-based dark mode → color-scheme so light-dark() fallbacks resolve */
:is(.dark, [data-theme="dark"], [data-mode="dark"]) [data-tigawanna-credit] {
  color-scheme: dark;
}
:is(.light, [data-theme="light"], [data-mode="light"]) [data-tigawanna-credit] {
  color-scheme: light;
}
`.trim();

/**
 * Publish StyleX output as `styles.css` (and mirror into Ladle `public/`).
 */
function readStylexCss() {
  const direct = join(dist, "stylex.css");
  try {
    return readFileSync(direct, "utf8");
  } catch {
    // unplugin-stylex may emit under dist/assets
  }

  try {
    const assets = join(dist, "assets");
    const match = readdirSync(assets).find(
      (name) => name.endsWith("stylex.css") || name.endsWith(".css"),
    );
    if (match) {
      return readFileSync(join(assets, match), "utf8");
    }
  } catch {
    // no assets dir
  }

  return "/* @tigawanna/credit — no StyleX output */\n";
}

mkdirSync(dist, { recursive: true });
const bundle = `${readStylexCss().trim()}\n\n${DARK_SCHEME_BRIDGE}\n`;
writeFileSync(join(dist, "styles.css"), bundle);

const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
copyFileSync(join(dist, "styles.css"), join(publicDir, "credit.css"));

console.log("wrote dist/styles.css + public/credit.css (StyleX + dark-scheme bridge)");

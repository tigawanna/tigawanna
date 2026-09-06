import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

/**
 * Publish StyleX output as `styles.css` (and mirror into Ladle `public/`).
 * No design-system reset — only the compiled `twc*` atomics for this package.
 */
function findStylexCss() {
  const direct = join(dist, "stylex.css");
  try {
    copyFileSync(direct, join(dist, "styles.css"));
    return direct;
  } catch {
    // unplugin-stylex may emit under dist/assets
  }

  try {
    const assets = join(dist, "assets");
    const match = readdirSync(assets).find(
      (name) => name.endsWith("stylex.css") || name.endsWith(".css"),
    );
    if (match) {
      const source = join(assets, match);
      copyFileSync(source, join(dist, "styles.css"));
      return source;
    }
  } catch {
    // no assets dir
  }

  const fallback = "/* @tigawanna/credit — no StyleX output */\n";
  writeFileSync(join(dist, "styles.css"), fallback);
  return null;
}

mkdirSync(dist, { recursive: true });
const source = findStylexCss();

const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
copyFileSync(join(dist, "styles.css"), join(publicDir, "credit.css"));

console.log(
  source
    ? "wrote dist/styles.css + public/credit.css (StyleX only)"
    : "wrote empty dist/styles.css + public/credit.css",
);

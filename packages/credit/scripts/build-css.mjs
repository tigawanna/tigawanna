import { createRequire } from "node:module";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

/**
 * Bundle Astryx base styles + compiled StyleX into a single consumer stylesheet.
 * Theme tokens are injected at runtime by `<Theme theme={creditTheme} />`.
 */
function resolveCss(specifier) {
  return require.resolve(specifier, { paths: [root] });
}

function findStylexCss() {
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
    if (match) return readFileSync(join(assets, match), "utf8");
  } catch {
    // no assets dir
  }

  return "/* no StyleX output */\n";
}

mkdirSync(dist, { recursive: true });

const parts = [
  "/* @tigawanna/credit — Astryx base + StyleX (tokens via Theme + shadcn vars) */",
  readFileSync(resolveCss("@astryxdesign/core/reset.css"), "utf8"),
  readFileSync(resolveCss("@astryxdesign/core/astryx.css"), "utf8"),
  findStylexCss(),
];

writeFileSync(join(dist, "styles.css"), parts.join("\n\n"));

/** Ladle serves `public/` in both serve + preview builds. */
const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "credit.css"), parts.join("\n\n"));

console.log("wrote dist/styles.css + public/credit.css");

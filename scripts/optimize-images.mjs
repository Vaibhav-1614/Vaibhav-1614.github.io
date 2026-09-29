// One-off: converts the raw screenshot folders into web-sized WebP files.
// Usage: node scripts/optimize-images.mjs <srcDir> <slug> [name=file ...]
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const [srcDir, slug, ...renames] = process.argv.slice(2);
const map = Object.fromEntries(renames.map((r) => r.split("=").reverse()));
const outDir = path.join("public", "projects", slug);
await mkdir(outDir, { recursive: true });

for (const file of (await readdir(srcDir)).filter((f) => f.endsWith(".png")).sort()) {
  const name = map[file] ?? file.replace(/\.png$/, "");
  const input = sharp(path.join(srcDir, file));
  await input.clone().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outDir, `${name}.webp`));
  await input.clone().resize({ width: 720, withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(outDir, `${name}-thumb.webp`));
  console.log(slug, name);
}

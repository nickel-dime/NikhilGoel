/**
 * Batch-converts garment photos into square transparent-PNG cutouts, and
 * scaffolds the items.json that scripts/import-wardrobe.mjs consumes.
 *
 *   node scripts/make-cutouts.mjs ~/wardrobe-photos ~/wardrobe
 *
 * Reads anything NSImage can open, including the HEIC that iPhones produce.
 * Photos that Vision can't find a subject in are reported and skipped rather
 * than aborting the run, so one bad shot doesn't cost you the batch.
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import os from "node:os";

const READABLE = new Set([".jpg", ".jpeg", ".png", ".heic", ".heif", ".tiff", ".webp"]);

const [inputDir, outputDir] = process.argv.slice(2);
if (!inputDir || !outputDir) {
  console.error("Usage: node scripts/make-cutouts.mjs <photo-dir> <output-dir>");
  process.exit(1);
}

const swiftSource = path.join(import.meta.dirname, "cutout.swift");
const binary = path.join(os.tmpdir(), "wardrobe-cutout");

// Rebuild only when the source is newer than the binary.
if (!existsSync(binary) || statSync(swiftSource).mtimeMs > statSync(binary).mtimeMs) {
  console.log("Compiling cutout.swift ...");
  execSync(`swiftc -O ${JSON.stringify(swiftSource)} -o ${JSON.stringify(binary)}`, {
    stdio: "inherit",
  });
}

mkdirSync(outputDir, { recursive: true });

const photos = readdirSync(inputDir)
  .filter((f) => READABLE.has(path.extname(f).toLowerCase()))
  .sort();

if (photos.length === 0) {
  console.error(`No readable images in ${inputDir}`);
  process.exit(1);
}

const done = [];
const failed = [];

for (const photo of photos) {
  const base = path.basename(photo, path.extname(photo));
  const out = `${base}.png`;
  try {
    const result = execFileSync(
      binary,
      [path.join(inputDir, photo), path.join(outputDir, out)],
      { encoding: "utf8" }
    );
    process.stdout.write(`  ${result}`);
    done.push({ file: out, base });
  } catch (error) {
    const message = (error.stderr || error.message).trim().replace(/^error:\s*/, "");
    console.error(`  failed: ${photo} — ${message}`);
    failed.push(photo);
  }
}

// Scaffold items.json, preserving anything already filled in so the script can
// be re-run after adding more photos.
const itemsPath = path.join(outputDir, "items.json");
let existing = [];
if (existsSync(itemsPath)) {
  const { readFileSync } = await import("node:fs");
  existing = JSON.parse(readFileSync(itemsPath, "utf8"));
}
const byFile = new Map(existing.map((item) => [item.file, item]));

const items = done.map(
  ({ file, base }) =>
    byFile.get(file) ?? {
      file,
      // Filename is the only hint available, so it seeds the name.
      brand: "",
      name: base.replace(/[-_]+/g, " ").trim(),
      category: "",
      colorway: "",
      occasions: [],
      source: { retailer: "", url: "", status: "available" },
    }
);

writeFileSync(itemsPath, `${JSON.stringify(items, null, 2)}\n`);

console.log(
  `\n${done.length} cutout${done.length === 1 ? "" : "s"} written to ${outputDir}` +
    (failed.length ? `, ${failed.length} failed` : "")
);
console.log(`Scaffolded ${itemsPath} — fill in brand and category, then:`);
console.log(
  `  node --env-file=.env.local scripts/import-wardrobe.mjs ${outputDir} --dry-run`
);

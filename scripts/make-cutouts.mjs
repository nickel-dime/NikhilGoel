/**
 * Batch-converts garment photos into square transparent-PNG cutouts, and
 * scaffolds the items.json that scripts/import-wardrobe.mjs consumes.
 *
 *   node scripts/make-cutouts.mjs ~/wardrobe-photos ~/wardrobe
 *
 * By default each photo is handed to Codex's built-in image generator, which
 * *reconstructs* the garment as a flat, evenly lit catalog product shot on a
 * transparent background: no bedsheet, no cast shadow, no camera perspective,
 * no wrinkles. This is what makes the pieces look like a store listing rather
 * than a photo with the background knocked out. It needs the `codex` CLI and
 * takes a minute or two per photo, so several run at once.
 *
 * `--vision` uses the on-device Apple Vision subject-lifter instead: instant
 * and offline, but a literal cutout of whatever the photo shows.
 *
 * Reads anything NSImage can open, including the HEIC that iPhones produce.
 * Photos that fail are reported and skipped rather than aborting the run, so
 * one bad shot doesn't cost you the batch.
 */
import { execFileSync, execSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import os from "node:os";

const READABLE = new Set([".jpg", ".jpeg", ".png", ".heic", ".heif", ".tiff", ".webp"]);
const CONCURRENCY = 4;

const argv = process.argv.slice(2);
const useVision = argv.includes("--vision");
// Vision sometimes counts a shadow cast on the surface under the garment as
// part of the garment. This removes it, but judges by colour, so it must not be
// used on grey, white or black pieces.
const dropNeutral = argv.includes("--drop-neutral");
const [inputDir, outputDir] = argv.filter((a) => !a.startsWith("--"));
if (!inputDir || !outputDir) {
  console.error(
    "Usage: node scripts/make-cutouts.mjs <photo-dir> <output-dir> [--vision] [--drop-neutral]"
  );
  process.exit(1);
}

/** Compiles a Swift tool into the temp dir, only when the source is newer. */
function build(name) {
  const source = path.join(import.meta.dirname, `${name}.swift`);
  const binary = path.join(os.tmpdir(), `wardrobe-${name}`);
  if (!existsSync(binary) || statSync(source).mtimeMs > statSync(binary).mtimeMs) {
    console.log(`Compiling ${name}.swift ...`);
    execSync(`swiftc -O ${JSON.stringify(source)} -o ${JSON.stringify(binary)}`, {
      stdio: "inherit",
    });
  }
  return binary;
}

mkdirSync(outputDir, { recursive: true });

const photos = readdirSync(inputDir)
  .filter((f) => READABLE.has(path.extname(f).toLowerCase()))
  .sort();

if (photos.length === 0) {
  console.error(`No readable images in ${inputDir}`);
  process.exit(1);
}

// The prompt follows the "extract clothing cutouts" recipe: reconstruct only
// the garment, stay faithful to what is visible, invent nothing. Codex fills in
// the garment specifics itself from the attached photo.
const GENERATE_PROMPT = (out) => `
Read and follow your built-in imagegen skill first. Then do exactly this, without asking questions.

The attached photograph shows ONE garment laid flat on a bed or floor. Look at it carefully and note: garment type, exact colour and wash, material and texture, silhouette, neckline/waistband, sleeves or legs, fasteners, pockets, seams, hem, any pattern, and any legible logo or lettering (quote it verbatim; if a mark is present but unreadable, omit it rather than guess).

1. Using the built-in image_gen tool with the attached photo as the only reference, generate ONE image with a prompt structured like this, replacing every bracket with what you actually observed and deleting clauses that do not apply:

Use case: background-extraction
Asset type: transparent ecommerce clothing catalog cutout
Input image: The reference photograph shows [GARMENT] laid flat on [SURFACE]. Use it only to identify and reconstruct that exact garment. Ignore the surface, furniture, feet and every other object.
Primary request: Reconstruct ONLY the complete empty [GARMENT] as a clean front-view ecommerce catalog product photograph, laid perfectly flat and neatly arranged the way a retailer photographs it: [tops: sleeves laid out symmetrically, hem straight / bottoms: legs straight and parallel, waistband centred at top], fabric smooth with only light natural drape, no heavy wrinkles.
Item fidelity: Preserve the [COLOUR/WASH], [MATERIAL/TEXTURE], [SILHOUETTE], [NECKLINE or WAISTBAND], [SLEEVES or LEGS], [FASTENING], [POCKETS], [SEAMS], [HEM], [PATTERN], and [LEGIBLE MARKS, verbatim, rendered small and legible]. [UNKNOWNS and what to omit.] Do not invent any other logo, lettering, label, pocket, seam, fastener, hardware, colour, or decoration.
Composition: [portrait for bottoms, square for tops] canvas, centred front view, complete garment fully inside frame with generous even padding around every outer edge; no cropping or truncation.
Background: genuinely transparent background (alpha channel), nothing else in the frame.
Lighting: neutral diffuse high-end ecommerce product lighting on the garment only; no cast shadow, contact shadow, reflection, prop, watermark, caption, or border.
Critical: preserve a crisp separable outer silhouette; output only this one garment.

2. Copy the generated image to exactly this path: ${out}

3. Verify with Python (Pillow is fine to install into a venv under the current directory) that the file is RGBA, all four corners have alpha 0, and the garment occupies a sensible portion of the canvas. If the background came back as an opaque solid colour instead of transparent, run
python3 ~/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py --input ${out} --out ${out} --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill --force
ONLY in that case; never run it on an image that is already transparent.

4. Reply with a single line: the garment description you observed (brand/lettering first if legible), e.g. "dimers washed khaki cargo pants". Nothing else.
`.trim();

/** Apple Vision path: literal cutout of the photo. */
function cutoutWithVision(binary, photo, out) {
  const result = execFileSync(binary, [path.join(inputDir, photo), out], {
    encoding: "utf8",
    env: dropNeutral ? { ...process.env, CUTOUT_DROP_NEUTRAL: "1" } : process.env,
  });
  process.stdout.write(`  ${result}`);
  return "";
}

/** Codex path: regenerate the garment as a catalog product shot. */
async function cutoutWithCodex(square, photo, out) {
  const work = mkdtempSync(path.join(os.tmpdir(), "wardrobe-ai-"));
  try {
    // Codex attaches JPEG/PNG; iPhone HEIC needs converting first. Downscale
    // too: the model only needs enough to read the garment.
    const jpg = path.join(work, `${path.basename(photo, path.extname(photo))}.jpg`);
    execFileSync("sips", ["-s", "format", "jpeg", "-Z", "1600", path.join(inputDir, photo), "--out", jpg], {
      stdio: "ignore",
    });
    const raw = path.join(work, "generated.png");
    // spawn, not execFile: codex appends piped stdin to the prompt and waits
    // for it to close, and execFile always pipes stdin.
    const stdout = await new Promise((resolve, reject) => {
      const child = spawn(
        "codex",
        [
          "exec",
          "--skip-git-repo-check",
          "--ephemeral",
          "-s", "workspace-write",
          "-c", "sandbox_workspace_write.network_access=true",
          "-C", work,
          "-i", jpg,
          "-o", path.join(work, "last.txt"),
          GENERATE_PROMPT(raw),
        ],
        { stdio: ["ignore", "pipe", "pipe"], timeout: 15 * 60 * 1000 }
      );
      let log = "";
      child.stdout.on("data", (chunk) => (log += chunk));
      child.stderr.on("data", (chunk) => (log += chunk));
      child.on("error", reject);
      child.on("close", (code) =>
        code === 0 ? resolve(log) : reject(new Error(`codex exited ${code}\n${log.trim().split("\n").slice(-5).join("\n")}`))
      );
    });
    if (!existsSync(raw)) {
      throw new Error(`codex produced no image\n${stdout.trim().split("\n").slice(-5).join("\n")}`);
    }
    const framed = execFileSync(square, [raw, out], { encoding: "utf8" });
    process.stdout.write(`  ${path.basename(photo)} -> ${framed.split(" -> ").pop()}`);
    const description = existsSync(path.join(work, "last.txt"))
      ? readFileSync(path.join(work, "last.txt"), "utf8").trim().split("\n").pop().trim()
      : "";
    return description;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const done = [];
const failed = [];

async function processPhoto(photo, tool) {
  const base = path.basename(photo, path.extname(photo));
  const out = `${base}.png`;
  try {
    const description = useVision
      ? cutoutWithVision(tool, photo, path.join(outputDir, out))
      : await cutoutWithCodex(tool, photo, path.join(outputDir, out));
    done.push({ file: out, base, description });
  } catch (error) {
    const message = (error.stderr || error.message).trim().replace(/^error:\s*/, "");
    console.error(`  failed: ${photo} — ${message}`);
    failed.push(photo);
  }
}

if (useVision) {
  const cutout = build("cutout");
  for (const photo of photos) await processPhoto(photo, cutout);
} else {
  const square = build("square");
  console.log(`Generating ${photos.length} cutouts with Codex, ${CONCURRENCY} at a time ...`);
  const queue = [...photos];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) await processPhoto(queue.shift(), square);
    })
  );
}
done.sort((a, b) => a.base.localeCompare(b.base));

// Scaffold items.json, preserving anything already filled in so the script can
// be re-run after adding more photos.
const itemsPath = path.join(outputDir, "items.json");
let existing = [];
if (existsSync(itemsPath)) {
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
// Keep pieces from earlier runs, so photos can be added a batch at a time.
const fresh = new Set(done.map(({ file }) => file));
items.push(...existing.filter((item) => !fresh.has(item.file)));
items.sort((a, b) => a.file.localeCompare(b.file));

writeFileSync(itemsPath, `${JSON.stringify(items, null, 2)}\n`);

// Describing each piece in a sentence is less work than filling in JSON, so
// scaffold that file too and let describe-wardrobe.mjs do the structuring. In
// Codex mode the model's own description seeds the line; check it before
// trusting it.
const descPath = path.join(outputDir, "descriptions.txt");
const alreadyDescribed = new Set();
let descBody = "";
if (existsSync(descPath)) {
  descBody = readFileSync(descPath, "utf8").replace(/\n*$/, "\n");
  for (const line of descBody.split("\n")) {
    const key = line.split(":")[0].trim();
    if (key && !key.startsWith("#")) alreadyDescribed.add(key);
  }
} else {
  descBody =
    "# One line per piece: <name>: brand, then how you'd describe it.\n" +
    "#   IMG_2199: dimers washed khaki cargo pants, weekend, https://shop.com/x\n" +
    "# Anything you leave blank stays blank. Then run describe-wardrobe.mjs.\n\n";
}

const added = done.filter(({ base }) => !alreadyDescribed.has(base));
if (added.length) {
  writeFileSync(
    descPath,
    descBody + added.map(({ base, description }) => `${base}: ${description}`).join("\n") + "\n"
  );
}

console.log(
  `\n${done.length} cutout${done.length === 1 ? "" : "s"} written to ${outputDir}` +
    (failed.length ? `, ${failed.length} failed` : "")
);
console.log(`Describe each piece in ${descPath}, then:`);
console.log(`  node scripts/describe-wardrobe.mjs ${outputDir}`);

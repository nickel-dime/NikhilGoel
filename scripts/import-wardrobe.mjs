/**
 * Bulk-imports wardrobe cutouts into Sanity.
 *
 *   node --env-file=.env.local scripts/import-wardrobe.mjs /path/to/wardrobe [--dry-run]
 *
 * The directory must contain an `items.json` array, with image paths relative to
 * that directory:
 *
 *   [
 *     {
 *       "file": "tops/uniqlo-oxford.png",
 *       "brand": "Uniqlo",
 *       "name": "Faded blue oxford",
 *       "category": "tops",
 *       "colorway": "Light blue",
 *       "occasions": ["Office", "Weekend"],
 *       "source": { "retailer": "Uniqlo", "url": "https://...", "status": "available" }
 *     }
 *   ]
 *
 * Document IDs are derived from the slug, so re-running updates existing pieces
 * instead of duplicating them. Occasions are created on first use.
 */
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import process from "node:process";

const CATEGORIES = ["tops", "layers", "bottoms", "outerwear", "footwear", "accessories"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const rootDir = args.find((arg) => !arg.startsWith("--"));

if (!rootDir) {
  console.error(
    "Usage: node --env-file=.env.local scripts/import-wardrobe.mjs <dir> [--dry-run]"
  );
  process.exit(1);
}

const token = process.env.SANITY_WRITE_TOKEN;
if (!token && !dryRun) {
  console.error(
    "SANITY_WRITE_TOKEN is not set. Create an Editor token at\n" +
      "https://www.sanity.io/manage/project/y9cpy97t (API -> Tokens), put it in\n" +
      ".env.local (NOT .env, which is committed), then re-run with --env-file=.env.local."
  );
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-08-14",
  useCdn: false,
  token,
});

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolves occasion names to document refs, creating any that don't exist. */
async function resolveOccasions(names) {
  const refs = [];
  for (const name of names) {
    const slug = slugify(name);
    const id = `occasion-${slug}`;
    if (!dryRun) {
      await client.createIfNotExists({
        _id: id,
        _type: "occasion",
        name,
        slug: { _type: "slug", current: slug },
      });
    }
    refs.push({ _type: "reference", _key: slug, _ref: id });
  }
  return refs;
}

const items = JSON.parse(
  await readFile(path.join(rootDir, "items.json"), "utf8")
);

let imported = 0;
for (const item of items) {
  const label = [item.brand, item.name].filter(Boolean).join(" ");

  if (!item.file || !item.brand || !item.name || !item.category) {
    console.error(`  skipped: ${label || "(unnamed)"} — missing required field`);
    continue;
  }
  if (!CATEGORIES.includes(item.category)) {
    console.error(
      `  skipped: ${label} — unknown category "${item.category}" (expected ${CATEGORIES.join(", ")})`
    );
    continue;
  }

  const slug = item.slug || slugify(label);
  // Keyed on the photo, not the name, so correcting a brand or name updates the
  // piece in place instead of leaving the old document behind as a duplicate.
  const id = `wardrobeItem-${slugify(path.basename(item.file, path.extname(item.file)))}`;
  const filePath = path.join(rootDir, item.file);

  if (dryRun) {
    console.log(`  would import: ${label} [${item.category}] <- ${item.file}`);
    imported++;
    continue;
  }

  const asset = await client.assets.upload(
    "image",
    createReadStream(filePath),
    { filename: path.basename(filePath) }
  );

  await client.createOrReplace({
    _id: id,
    _type: "wardrobeItem",
    name: item.name,
    brand: item.brand,
    slug: { _type: "slug", current: slug },
    category: item.category,
    image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
    ...(item.colorway ? { colorway: item.colorway } : {}),
    ...(item.season ? { season: item.season } : {}),
    ...(item.type ? { type: item.type } : {}),
    ...(item.occasions?.length
      ? { occasions: await resolveOccasions(item.occasions) }
      : {}),
    ...(item.source ? { source: item.source } : {}),
  });

  console.log(`  imported: ${label}`);
  imported++;
}

console.log(
  `\n${dryRun ? "Dry run: " : ""}${imported}/${items.length} pieces ${dryRun ? "ready" : "imported"}.`
);

/**
 * Turns one line of plain English per garment into the structured items.json
 * that scripts/import-wardrobe.mjs consumes.
 *
 *   node scripts/describe-wardrobe.mjs ~/wardrobe
 *
 * Reads <dir>/descriptions.txt, which scripts/make-cutouts.mjs scaffolds with
 * one line per photo:
 *
 *   IMG_2199: dimers washed khaki cargo pants, weekend, https://shop.com/x
 *
 * Order within the line does not matter except that the brand should come
 * first. Everything is a guess you can correct, either by editing the sentence
 * and re-running, or by editing items.json directly — filled-in fields are
 * never overwritten with a blank.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const [dir, descArg] = process.argv.slice(2);
if (!dir) {
  console.error("Usage: node scripts/describe-wardrobe.mjs <dir> [descriptions.txt]");
  process.exit(1);
}

const descPath = descArg ?? path.join(dir, "descriptions.txt");
const itemsPath = path.join(dir, "items.json");
if (!existsSync(descPath)) {
  console.error(`No ${descPath}. Run scripts/make-cutouts.mjs first.`);
  process.exit(1);
}

// Garment nouns, by where they sit on the body. Scored rather than first-match,
// so "cargo jacket" lands in outerwear and "cargo pants" in bottoms.
const CATEGORIES = {
  tops: "tee t-shirt tshirt shirt oxford polo sweater sweatshirt hoodie knit jumper tank henley crewneck button-down flannel blouse",
  bottoms:
    "pant pants trouser trousers jean jeans short shorts chino chinos cargo cargos sweatpant sweatpants jogger joggers skirt",
  outerwear:
    "jacket coat parka blazer overshirt shacket vest puffer windbreaker trench cardigan anorak fleece",
  footwear:
    "sneaker sneakers shoe shoes boot boots loafer loafers sandal sandals trainer trainers clog clogs",
  accessories:
    "cap hat beanie belt scarf bag tote backpack sunglasses glasses watch sock socks glove gloves tie wallet necklace ring bracelet",
};

const COLORS =
  "black white cream ivory off-white ecru grey gray charcoal navy blue indigo denim olive khaki tan beige brown chocolate sand stone green sage forest red burgundy maroon pink purple lavender yellow mustard orange rust silver gold";

// Condition and fit words. They belong in the name, never in the brand.
const MODIFIERS =
  "washed faded vintage cropped wide wide-leg slim baggy loose relaxed oversized boxy new old worn distressed pleated straight tapered heavyweight lightweight raw selvedge boiled brushed";

const OCCASIONS = {
  Office: "office work workwear desk",
  Weekend: "weekend casual everyday daily",
  Formal: "formal wedding dressy smart",
  Gym: "gym running run workout training",
  Travel: "travel flight airport",
  "Going out": "going-out night nights evening bar",
};

const words = (s) => s.split(" ");
const CATEGORY_WORDS = Object.entries(CATEGORIES).flatMap(([cat, list]) =>
  words(list).map((w) => [w, cat])
);
const COLOR_WORDS = new Set(words(COLORS));
const MODIFIER_WORDS = new Set(words(MODIFIERS));

/** Splits a line into its bare tokens, keeping track of where each one started. */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'&.\-\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function guessCategory(tokens) {
  const scores = new Map();
  tokens.forEach((token, index) => {
    for (const [word, category] of CATEGORY_WORDS) {
      if (token !== word) continue;
      const prev = scores.get(category) ?? { hits: 0, last: -1 };
      scores.set(category, { hits: prev.hits + 1, last: index });
    }
  });
  // Most hits wins; on a tie the noun that appears last is the garment itself
  // ("khaki cargo pants" is a pant, "cargo jacket" is a jacket).
  const ranked = [...scores.entries()].sort(
    (a, b) => b[1].hits - a[1].hits || b[1].last - a[1].last
  );
  return ranked[0]?.[0] ?? "";
}

function guessColor(tokens) {
  const hit = tokens.find((t) => COLOR_WORDS.has(t));
  return hit ? hit[0].toUpperCase() + hit.slice(1) : "";
}

function guessOccasions(tokens) {
  const set = new Set(tokens);
  return Object.entries(OCCASIONS)
    .filter(([, list]) => words(list).some((w) => set.has(w)))
    .map(([name]) => name);
}

/**
 * The brand is the first word of the line. Assuming more than that swallows
 * model names ("adidas samba og"), so multi-word brands are listed instead.
 */
const MULTI_WORD_BRANDS = [
  "new balance", "aime leon dore", "the north face", "north face", "ralph lauren",
  "polo ralph lauren", "banana republic", "todd snyder", "buck mason",
  "taylor stitch", "common projects", "dr martens", "thursday boots",
  "norse projects", "our legacy", "engineered garments", "beams plus",
  "calvin klein", "tommy hilfiger", "j crew", "abercrombie fitch",
  "acne studios", "drakes london", "end clothing",
];

function guessBrand(tokens) {
  const line = tokens.join(" ");
  const multi = MULTI_WORD_BRANDS.find((brand) => line.startsWith(brand));
  const lead = multi ? words(multi) : tokens.slice(0, 1);
  const known = new Set(CATEGORY_WORDS.map(([w]) => w));
  // A line that opens with the garment itself just has no brand in it. Listed
  // brands are exempt: "New Balance" opens with a word that is also a modifier.
  if (
    !multi &&
    lead.some((w) => COLOR_WORDS.has(w) || MODIFIER_WORDS.has(w) || known.has(w))
  ) {
    return "";
  }
  // A short one-word brand is usually an acronym: COS, ON, YMC.
  return lead
    .map((w) =>
      !multi && w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)
    )
    .join(" ");
}

function retailerFrom(url, brand) {
  if (brand) return brand;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0];
    return label[0].toUpperCase() + label.slice(1);
  } catch {
    return "";
  }
}

const lines = readFileSync(descPath, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

let existing = [];
if (existsSync(itemsPath)) existing = JSON.parse(readFileSync(itemsPath, "utf8"));
const byFile = new Map(existing.map((item) => [item.file, item]));

const parsed = [];
const unmatched = [];

for (const line of lines) {
  const split = line.indexOf(":");
  if (split < 0) {
    unmatched.push(`${line} — no "filename: description" separator`);
    continue;
  }
  const key = line.slice(0, split).trim();
  const description = line.slice(split + 1).trim();
  if (!description) continue; // scaffolded but not filled in yet

  const match = [...byFile.keys()].find(
    (file) => file === key || path.basename(file, ".png") === key || file.includes(key)
  );
  if (!match) {
    unmatched.push(`${key} — no cutout with that name`);
    continue;
  }

  const url = description.match(/https?:\/\/\S+/)?.[0] ?? "";
  const soldOut = /sold[ -]?out/i.test(description);
  // Strip the parts that are not the garment's description.
  const prose = description
    .replace(url, "")
    .replace(/sold[ -]?out/gi, "")
    .replace(/[,;]\s*$/, "")
    .trim();

  const tokens = tokenize(prose);
  const brand = guessBrand(tokens);
  const occasions = guessOccasions(tokens);

  // The name is the description with the brand and the occasion words removed.
  const occasionWords = new Set(
    occasions.flatMap((name) => words(OCCASIONS[name]))
  );
  const brandWords = new Set(tokenize(brand));
  const nameTokens = tokens.filter(
    (t, i) =>
      !(brandWords.has(t) && i < brandWords.size) &&
      !occasionWords.has(t) &&
      // Glue words that only made sense in the sentence you typed.
      !["and", "&", "or", "in", "with", "plus", "from", "my", "a", "the"].includes(t)
  );
  const name = nameTokens.length
    ? nameTokens.join(" ").replace(/^./, (c) => c.toUpperCase())
    : "";

  const previous = byFile.get(match) ?? {};
  parsed.push({
    file: match,
    // A guess only fills a field it has something to say about, so hand edits
    // to items.json survive a re-run.
    brand: brand || previous.brand || "",
    name: name || previous.name || "",
    category: guessCategory(tokens) || previous.category || "",
    colorway: guessColor(tokens) || previous.colorway || "",
    occasions: occasions.length ? occasions : previous.occasions ?? [],
    source: {
      retailer: retailerFrom(url, brand) || previous.source?.retailer || "",
      url: url || previous.source?.url || "",
      status: soldOut ? "sold-out" : previous.source?.status ?? "available",
    },
  });
}

// Keep any item that has no description line, so a partial pass is safe.
const described = new Set(parsed.map((item) => item.file));
const items = [...parsed, ...existing.filter((item) => !described.has(item.file))];

writeFileSync(itemsPath, `${JSON.stringify(items, null, 2)}\n`);

for (const item of parsed) {
  const gaps = ["brand", "name", "category"].filter((key) => !item[key]);
  console.log(
    `  ${item.file}: ${item.brand} — ${item.name} [${item.category || "?"}]` +
      (item.colorway ? `, ${item.colorway}` : "") +
      (item.occasions.length ? `, ${item.occasions.join("/")}` : "") +
      (gaps.length ? `  <- couldn't guess ${gaps.join(", ")}` : "")
  );
}
for (const problem of unmatched) console.error(`  skipped: ${problem}`);

console.log(`\nWrote ${itemsPath}. Check the guesses above, then:`);
console.log(`  node --env-file=.env.local scripts/import-wardrobe.mjs ${dir} --dry-run`);

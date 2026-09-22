/**
 * Throwaway local page for filling in wardrobe metadata.
 *
 *   node scripts/describe-ui.mjs ~/wardrobe
 *
 * Shows every cutout in <dir> next to a one-line plain-English description.
 * "Parse" sends the sentences to Codex, which fills brand / name / category /
 * colour / occasions / link in one shot; every field is editable and saves in
 * place to items.json (sentences to descriptions.txt). Once it looks right,
 * import with scripts/import-wardrobe.mjs as usual.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/describe-ui.mjs <dir>");
  process.exit(1);
}
const itemsPath = path.join(dir, "items.json");
const descPath = path.join(dir, "descriptions.txt");
if (!existsSync(itemsPath)) {
  console.error(`No ${itemsPath}. Run scripts/make-cutouts.mjs first.`);
  process.exit(1);
}

// Mirrors sanity/schemas/wardrobeItem.ts. Definitions are what the model reads.
const CATEGORY_GUIDE = {
  tops: "anything worn on the torso as the main layer: tees, polos, henleys, tanks, button-up shirts, sports jerseys",
  layers: "warm layers worn over a top: sweaters, hoodies, sweatshirts, quarter-zips, cardigans",
  bottoms: "everything worn on the legs: jeans, trousers, cargos, joggers, shorts of any kind",
  outerwear: "jackets, coats, vests, overshirts",
  footwear: "shoes",
  accessories: "hats, belts, bags, socks, jewellery",
};
const TYPES = {
  tops: ["T-shirt", "Long-sleeve tee", "Polo", "Henley", "Tank", "Shirt", "Jersey"],
  layers: ["Sweater", "Hoodie", "Sweatshirt", "Quarter-zip", "Cardigan"],
  bottoms: ["Jeans", "Trousers", "Cargo pants", "Joggers", "Shorts", "Athletic shorts"],
  outerwear: ["Jacket", "Coat", "Vest", "Overshirt"],
  footwear: ["Sneakers", "Boots", "Loafers", "Sandals"],
  accessories: ["Hat", "Belt", "Bag", "Socks"],
};
const ALL_TYPES = Object.values(TYPES).flat();
const CATEGORIES = ["", ...Object.keys(CATEGORY_GUIDE)];
const OCCASIONS = ["Office", "Weekend", "Formal", "Gym", "Travel", "Going out"];
const SEASONS = ["warm", "cold", "year-round"];

const PARSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["file", "brand", "name", "category", "type", "colorway", "season", "occasions", "url", "status"],
        properties: {
          file: { type: "string" },
          brand: { type: "string" },
          name: { type: "string" },
          category: { type: "string", enum: Object.keys(CATEGORY_GUIDE) },
          type: { type: "string", enum: ALL_TYPES },
          colorway: { type: "string" },
          season: { type: "string", enum: SEASONS },
          occasions: { type: "array", items: { type: "string", enum: OCCASIONS } },
          url: { type: "string" },
          status: { type: "string", enum: ["available", "sold-out", "secondhand"] },
        },
      },
    },
  },
};

/** One Codex call turns every sentence into structured fields. */
function parseWithCodex(rows) {
  const work = mkdtempSync(path.join(os.tmpdir(), "wardrobe-describe-"));
  const schemaPath = path.join(work, "schema.json");
  const outPath = path.join(work, "out.json");
  writeFileSync(schemaPath, JSON.stringify(PARSE_SCHEMA));
  const prompt = `You are filling in a personal wardrobe catalog. For each entry below, the owner typed a
plain-English sentence about one garment. Turn each sentence into structured fields.

Rules:
- brand: the maker as the owner would write it (e.g. "Nike", "Lululemon", "Abercrombie & Fitch", "H&M",
  "Under Armour", "Drmers Club"). The brand can appear anywhere in the sentence, often at the end after a
  comma. Fix obvious casing. Leave "" only if no brand is mentioned. Team names (Cleveland, Boca Juniors,
  DFB) are not brands; the kit maker is (Nike, Adidas).
- name: a short retail-style product name, 3–7 words, no brand, no occasion words, e.g. "Washed khaki cargo
  pants", "Cavaliers crimson pullover hoodie", "DFB 125th anniversary jersey". Keep distinctive details
  (wash, cut, print) and drop filler.
- category: exactly one of ${JSON.stringify(Object.keys(CATEGORY_GUIDE))}. Guide:
${Object.entries(CATEGORY_GUIDE).map(([k, v]) => `  ${k}: ${v}`).join("\n")}
  Workout clothing is NOT its own category: a performance tee is tops, running shorts are bottoms; the
  Gym occasion carries that meaning. Team jerseys and replica kits are tops.
- type: exactly one of the types allowed for the chosen category:
${Object.entries(TYPES).map(([k, v]) => `  ${k}: ${v.join(", ")}`).join("\n")}
  "Shirt" means a button-up. Any sports jersey or replica kit is "Jersey". Workout/running/technical
  shorts are "Athletic shorts"; casual, linen or drawstring cotton shorts are "Shorts". Sweatpants are "Joggers".
- colorway: one or two plain colour words as a shopper would say them ("Khaki", "Navy", "Heather grey").
- season: "warm" for short sleeves, tanks, shorts, linen, jerseys; "cold" for long sleeves, sweaters,
  hoodies, quarter-zips, flannel, heavy outerwear; "year-round" for pants, jeans, joggers, and anything
  that works in either. Judge from the garment described, not the occasion.
- Each entry may carry "current" values the owner already set by hand. Keep current.brand exactly as given
  unless the sentence flatly contradicts it. Keep current.category and current.type when they are valid
  values from the lists above and fit the garment; otherwise choose fresh. Fill everything else fresh.
- occasions: zero or more of ${JSON.stringify(OCCASIONS)}. "fitness"/"gym"/"running" -> Gym. Only when
  the sentence implies it; otherwise [].
- url: any http(s) link in the sentence, else "".
- status: "sold-out" if the sentence says sold out, "secondhand" if thrifted/used/vintage-bought, else "available".
- Return exactly one output item per input, same "file" value, same order.

Entries:
${JSON.stringify(rows, null, 2)}`;
  return new Promise((resolve, reject) => {
    const child = spawn(
      "codex",
      [
        "exec", "--skip-git-repo-check", "--ephemeral", "-s", "read-only",
        "-C", work, "--output-schema", schemaPath, "-o", outPath, prompt,
      ],
      { stdio: ["ignore", "pipe", "pipe"], timeout: 5 * 60 * 1000 }
    );
    let log = "";
    child.stdout.on("data", (c) => (log += c));
    child.stderr.on("data", (c) => (log += c));
    child.on("error", reject);
    child.on("close", (code) => {
      try {
        if (code !== 0 || !existsSync(outPath)) {
          throw new Error(`codex exited ${code}: ${log.trim().split("\n").slice(-3).join(" | ")}`);
        }
        resolve(JSON.parse(readFileSync(outPath, "utf8")).items);
      } catch (error) {
        reject(error);
      } finally {
        rmSync(work, { recursive: true, force: true });
      }
    });
  });
}

function readItems() {
  return JSON.parse(readFileSync(itemsPath, "utf8"));
}

/** descriptions.txt as { IMG_2199: "dimers khaki cargo pants" }, keyed by basename. */
function readDescriptions() {
  const out = {};
  if (!existsSync(descPath)) return out;
  for (const line of readFileSync(descPath, "utf8").split("\n")) {
    const split = line.indexOf(":");
    if (split < 0 || line.trim().startsWith("#")) continue;
    out[line.slice(0, split).trim()] = line.slice(split + 1).trim();
  }
  return out;
}

function writeDescriptions(map) {
  const header =
    "# One line per piece: <name>: brand, then how you'd describe it.\n" +
    "#   IMG_2199: dimers washed khaki cargo pants, weekend, https://shop.com/x\n" +
    "# Anything you leave blank stays blank. Then run describe-wardrobe.mjs.\n\n";
  const body = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, text]) => `${key}: ${text}`)
    .join("\n");
  writeFileSync(descPath, `${header}${body}\n`);
}

const base = (file) => path.basename(file, path.extname(file));

function state() {
  const descriptions = readDescriptions();
  return readItems().map((item) => ({ ...item, description: descriptions[base(item.file)] ?? "" }));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data ? JSON.parse(data) : {}));
  });
}

const json = (res, value, status = 200) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(value));
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(PAGE);
  }
  if (req.method === "GET" && url.pathname === "/api/items") {
    return json(res, state());
  }
  if (req.method === "GET" && url.pathname.startsWith("/img/")) {
    const file = path.join(dir, path.basename(decodeURIComponent(url.pathname.slice(5))));
    if (!existsSync(file)) return json(res, { error: "not found" }, 404);
    res.writeHead(200, { "content-type": "image/png" });
    return res.end(readFileSync(file));
  }
  // Save the sentences, then have Codex structure the ones that changed since
  // they were last parsed (or that are still incomplete). Untouched rows keep
  // their hand edits.
  if (req.method === "POST" && url.pathname === "/api/parse") {
    const { descriptions, force } = await readBody(req);
    writeDescriptions(descriptions);
    const items = readItems();
    const rows = items
      .map((item) => ({
        file: item.file,
        sentence: descriptions[base(item.file)] ?? "",
        current: { brand: item.brand || "", category: item.category || "", type: item.type || "" },
      }))
      .filter(({ file, sentence }) => {
        const item = items.find((it) => it.file === file);
        const incomplete = !item.brand || !item.name || !item.category || !item.type;
        return sentence && (force || incomplete || sentence !== item.parsedFrom);
      });
    if (rows.length === 0) return json(res, { items: state(), parsed: 0 });
    let parsed;
    try {
      parsed = await parseWithCodex(rows);
    } catch (error) {
      return json(res, { error: error.message }, 500);
    }
    for (const result of parsed) {
      const index = items.findIndex((it) => it.file === result.file);
      if (index < 0) continue;
      const { url: link, ...fields } = result;
      items[index] = {
        ...items[index],
        ...fields,
        source: { ...items[index].source, url: link, status: fields.status, retailer: items[index].source?.retailer || fields.brand },
        parsedFrom: rows.find((r) => r.file === result.file)?.sentence ?? "",
      };
      delete items[index].status;
    }
    writeFileSync(itemsPath, `${JSON.stringify(items, null, 2)}\n`);
    return json(res, { items: state(), parsed: parsed.length });
  }
  // Hand edits to one item's fields.
  if (req.method === "POST" && url.pathname === "/api/save") {
    const item = await readBody(req);
    const items = readItems();
    const index = items.findIndex((it) => it.file === item.file);
    const { description, ...fields } = item;
    if (index < 0) items.push(fields);
    else items[index] = fields;
    writeFileSync(itemsPath, `${JSON.stringify(items, null, 2)}\n`);
    const descriptions = readDescriptions();
    descriptions[base(item.file)] = description ?? "";
    writeDescriptions(descriptions);
    return json(res, { ok: true });
  }
  json(res, { error: "not found" }, 404);
});

const PAGE = /* html */ `<!doctype html>
<meta charset="utf-8">
<title>Wardrobe</title>
<style>
  body { font: 14px/1.4 -apple-system, system-ui, sans-serif; margin: 24px; color: #222; background: #fafafa; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .hint { color: #666; margin-bottom: 16px; }
  .top { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
  .row { display: grid; grid-template-columns: 160px 1fr; gap: 16px; padding: 14px 0; border-top: 1px solid #e3e3e3; }
  .row img { width: 160px; height: 160px; object-fit: contain; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 20px 20px; border-radius: 6px; }
  .file { color: #888; font-size: 12px; margin-bottom: 4px; }
  textarea { width: 100%; box-sizing: border-box; font: inherit; padding: 6px 8px; border: 1px solid #ccc; border-radius: 6px; resize: vertical; }
  .fields { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px; }
  .fields label { display: flex; flex-direction: column; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: .04em; }
  .fields input, .fields select { font: 14px inherit; padding: 5px 7px; border: 1px solid #ccc; border-radius: 6px; margin-top: 2px; background: #fff; }
  input.missing { border-color: #e0a000; background: #fff8e5; }
  select.missing { border-color: #e0a000; background: #fff8e5; }
  button { font: inherit; padding: 6px 12px; border-radius: 6px; border: 1px solid #bbb; background: #fff; cursor: pointer; }
  button.primary { background: #222; color: #fff; border-color: #222; }
  .status { color: #666; font-size: 12px; }
  .saved { color: #2a7; }
</style>
<h1>Wardrobe</h1>
<div class="hint">Write a sentence per piece however you like: <i>lululemon black performance tee, fitness</i>. Parse sends the sentences to Codex and fills the fields (about 30s); it only touches rows whose sentence changed or that are still incomplete, so hand edits survive. Fields save when you leave them.</div>
<div class="top">
  <button class="primary" id="parse">Parse changed sentences</button>
  <button id="parse-all">Re-parse everything</button>
  <span class="status" id="status"></span>
</div>
<div id="list"></div>
<script>
const CATEGORIES = ${JSON.stringify(CATEGORIES)};
const SEASONS = ${JSON.stringify(SEASONS)};
const TYPES = ${JSON.stringify(TYPES)};
const ALL_TYPES = Object.values(TYPES).flat();
let items = [];
const status = (t, ok) => { const s = document.getElementById("status"); s.textContent = t; s.className = "status" + (ok ? " saved" : ""); };

function esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

function render() {
  const list = document.getElementById("list");
  list.innerHTML = items.map((it, i) => \`
    <div class="row" data-i="\${i}">
      <img src="/img/\${encodeURIComponent(it.file)}" alt="">
      <div>
        <div class="file">\${esc(it.file)}</div>
        <textarea rows="2" data-k="description" placeholder="e.g. uniqlo faded blue oxford, office">\${esc(it.description)}</textarea>
        <div class="fields">
          <label>Brand<input data-k="brand" class="\${it.brand ? "" : "missing"}" value="\${esc(it.brand)}"></label>
          <label>Name<input data-k="name" class="\${it.name ? "" : "missing"}" value="\${esc(it.name)}"></label>
          <label>Category<select data-k="category" class="\${it.category ? "" : "missing"}">\${CATEGORIES.map(c => \`<option \${c === it.category ? "selected" : ""}>\${c}</option>\`).join("")}</select></label>
          <label>Type<select data-k="type" class="\${it.type ? "" : "missing"}">\${["", ...(TYPES[it.category] || ALL_TYPES)].map(c => \`<option \${c === (it.type || "") ? "selected" : ""}>\${c}</option>\`).join("")}</select></label>
          <label>Colorway<input data-k="colorway" value="\${esc(it.colorway)}"></label>
          <label>Season<select data-k="season">\${["", ...SEASONS].map(c => \`<option \${c === (it.season || "") ? "selected" : ""}>\${c}</option>\`).join("")}</select></label>
          <label>Occasions (comma-separated)<input data-k="occasions" value="\${esc((it.occasions || []).join(", "))}"></label>
          <label>Retailer<input data-k="source.retailer" value="\${esc(it.source?.retailer)}"></label>
          <label>URL<input data-k="source.url" value="\${esc(it.source?.url)}"></label>
          <label>Status<select data-k="source.status"><option \${it.source?.status !== "sold-out" ? "selected" : ""}>available</option><option \${it.source?.status === "sold-out" ? "selected" : ""}>sold-out</option></select></label>
        </div>
      </div>
    </div>\`).join("");
}

async function load() {
  items = await (await fetch("/api/items")).json();
  render();
}

function collect(row) {
  const it = { ...items[+row.dataset.i], source: { ...items[+row.dataset.i].source } };
  for (const el of row.querySelectorAll("[data-k]")) {
    const k = el.dataset.k, v = el.value.trim();
    if (k === "occasions") it.occasions = v ? v.split(",").map(s => s.trim()).filter(Boolean) : [];
    else if (k.startsWith("source.")) it.source[k.slice(7)] = v;
    else it[k] = v;
  }
  return it;
}

document.getElementById("list").addEventListener("change", async (e) => {
  const row = e.target.closest(".row");
  if (!row) return;
  const it = collect(row);
  items[+row.dataset.i] = it;
  await fetch("/api/save", { method: "POST", body: JSON.stringify(it) });
  e.target.classList.toggle("missing", ["brand","name","category","type"].includes(e.target.dataset.k) && !e.target.value);
  if (e.target.dataset.k === "category") render();
  status("Saved " + it.file, true);
});

async function parse(force) {
  const descriptions = {};
  for (const row of document.querySelectorAll(".row")) {
    const it = items[+row.dataset.i];
    descriptions[it.file.replace(/\\.[^.]+$/, "")] = row.querySelector("[data-k=description]").value.trim();
  }
  for (const b of document.querySelectorAll(".top button")) b.disabled = true;
  status("Asking Codex…");
  try {
    const res = await fetch("/api/parse", { method: "POST", body: JSON.stringify({ descriptions, force }) });
    const data = await res.json();
    if (!res.ok) return status("Parse failed: " + data.error);
    items = data.items;
    render();
    const gaps = items.filter(it => !it.brand || !it.name || !it.category || !it.type).length;
    status((data.parsed ? "Parsed " + data.parsed + " piece(s). " : "Nothing changed. ") +
      (gaps ? gaps + " still missing brand, name, category or type (highlighted)." : "All pieces complete. Ready to import."), !gaps);
  } finally {
    for (const b of document.querySelectorAll(".top button")) b.disabled = false;
  }
}
document.getElementById("parse").addEventListener("click", () => parse(false));
document.getElementById("parse-all").addEventListener("click", () => parse(true));

load();
</script>`;

server.listen(3210, () => {
  console.log(`Wardrobe describer: http://localhost:3210  (${dir})`);
  console.log("Ctrl-C to stop. When done:");
  console.log(`  node --env-file=.env.local scripts/import-wardrobe.mjs ${dir} --dry-run`);
});

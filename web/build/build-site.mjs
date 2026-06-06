#!/usr/bin/env node
/**
 * Assemble the static Talo site into web/dist/ for GitHub Pages.
 *
 * It gathers, with no runtime dependencies:
 *   - the static pages/assets from web/src/        (index, lookup, app.js, style.css)
 *   - the dictionary data dictionary/dist/dictionary.json   (the lookup tool's data)
 *   - the book, rendered to book.html by the book build, wrapped in the site shell
 *
 * The result is a self-contained folder that GitHub Pages can serve directly.
 *
 *   node build/build-site.mjs            # build web/dist/
 *   node build/build-site.mjs --check    # verify inputs exist + integrity, no output
 *
 * Run from web/. Requires the book to be buildable (it shells out to the book's
 * own build) and the dictionary JSON to exist on disk.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = join(__dirname, "..");
const ROOT = join(WEB, "..");
const SRC = join(WEB, "src");
const DIST = join(WEB, "dist");
const DICT_JSON = join(ROOT, "dictionary", "dist", "dictionary.json");
const EXERCISES_JSON = join(ROOT, "data", "exercises.json");
const BOOK_DIR = join(ROOT, "book");

const checkOnly = process.argv.includes("--check");

function fail(msg) {
  process.stderr.write(`✗ ${msg}\n`);
  process.exit(1);
}

// 1. Inputs must exist.
if (!existsSync(DICT_JSON)) fail(`missing ${DICT_JSON} — run the dictionary build first (cd dictionary && npm run build)`);
const dict = JSON.parse(readFileSync(DICT_JSON, "utf8"));
if (!Array.isArray(dict) || dict.length < 1000) fail("dictionary.json looks wrong (too few entries)");
if (!existsSync(EXERCISES_JSON)) fail(`missing ${EXERCISES_JSON} — build it first (cd tools/exercises && npm run build)`);
const exercises = JSON.parse(readFileSync(EXERCISES_JSON, "utf8"));
if (!Array.isArray(exercises) || !exercises.length) fail("exercises.json looks wrong (empty)");

// 2. Build the book HTML (its own build validates every example).
let bookHtml = "";
try {
  execFileSync("node", ["--experimental-strip-types", join(BOOK_DIR, "build", "build.ts")], {
    cwd: BOOK_DIR, encoding: "utf8",
  });
  bookHtml = readFileSync(join(BOOK_DIR, "build", "talo-book.html"), "utf8");
} catch (err) {
  fail(`book build failed: ${err.message || err}`);
}

// 3. Wrap the book body in the site shell so it shares the site nav.
function wrapBook(html) {
  const body = html.replace(/^[\s\S]*?<body>/, "").replace(/<\/body>[\s\S]*$/, "");
  const head = (html.match(/<style>[\s\S]*?<\/style>/) || ["", ""])[0];
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Teach Yourself Talo</title>
<link rel="stylesheet" href="style.css">
${head}
</head><body>
<header class="site"><a class="brand" href="index.html">Talo</a>
<nav><a href="index.html">Home</a><a class="active" href="book.html">Learn</a><a href="practice.html">Practice</a><a href="lookup.html">Dictionary</a></nav></header>
${body}
</body></html>`;
}

process.stdout.write(`✓ dictionary: ${dict.length} entries\n`);
process.stdout.write(`✓ book: rendered (${(bookHtml.length / 1024).toFixed(0)} KB)\n`);

if (checkOnly) {
  // verify the static src files are all present
  for (const f of ["index.html", "lookup.html", "practice.html", "practice.js", "app.js", "style.css"]) {
    if (!existsSync(join(SRC, f))) fail(`missing web/src/${f}`);
  }
  process.stdout.write("✓ all site inputs present\n");
  process.exit(0);
}

// 4. Emit dist/.
mkdirSync(DIST, { recursive: true });
for (const f of readdirSync(SRC)) copyFileSync(join(SRC, f), join(DIST, f));
copyFileSync(DICT_JSON, join(DIST, "dictionary.json"));
copyFileSync(EXERCISES_JSON, join(DIST, "exercises.json"));
writeFileSync(join(DIST, "book.html"), wrapBook(bookHtml));
// a .nojekyll so Pages serves files as-is
writeFileSync(join(DIST, ".nojekyll"), "");

process.stdout.write(`✓ wrote site to ${DIST}\n`);

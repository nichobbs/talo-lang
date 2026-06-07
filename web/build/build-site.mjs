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
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { stripTypeScriptTypes } from "node:module";

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

// 1c. Parse the corpus articles into a compact feed for the interactive reader:
// per article, the title + register note + the clause pairs (Talo › English) from
// its ```talo block. The reader resolves each Talo token against dictionary.json
// in the browser, so this stays data-only.
const ARTICLES = join(ROOT, "corpus", "articles");
function buildCorpus() {
  if (!existsSync(ARTICLES)) fail(`missing ${ARTICLES} — the corpus is required for the reader`);
  const out = [];
  for (const f of readdirSync(ARTICLES).filter((x) => x.endsWith(".md")).sort()) {
    const md = readFileSync(join(ARTICLES, f), "utf8");
    const lines = md.split(/\r?\n/);
    const title = (lines.find((l) => l.startsWith("# ")) || `# ${f}`).slice(2).trim();
    const id = (f.match(/^(\d+)/) || [, f])[1];
    const noteLine = lines.find((l) => /\*\*(Register|Domain):\*\*/.test(l)) || "";
    const note = noteLine.replace(/^[-*\s]*\*\*(Register|Domain):\*\*/, "").split(/[—.]/)[0].trim();
    const block = (md.match(/```talo\n([\s\S]*?)```/) || [, ""])[1];
    const clauses = [];
    for (const raw of block.split(/\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("›"); // the › separator used in corpus glosses
      if (i < 0) continue;
      const talo = line.slice(0, i).trim();
      const en = line.slice(i + 1).trim();
      if (talo && /[a-z]/.test(talo)) clauses.push({ talo, en });
    }
    if (clauses.length) out.push({ id, file: f, title, note, clauses });
  }
  if (!out.length) fail("no corpus articles parsed for the reader");
  return out;
}
const corpus = buildCorpus();
process.stdout.write(`✓ corpus: ${corpus.length} articles, ${corpus.reduce((n, a) => n + a.clauses.length, 0)} clauses\n`);

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
<nav><a href="index.html">Home</a><a class="active" href="book.html">Learn</a><a href="reader.html">Read</a><a href="practice.html">Practice</a><a href="lookup.html">Dictionary</a></nav></header>
${body}
</body></html>`;
}

process.stdout.write(`✓ dictionary: ${dict.length} entries\n`);
process.stdout.write(`✓ book: rendered (${(bookHtml.length / 1024).toFixed(0)} KB)\n`);

// 2b. Compact in-browser engine. The Talo tools are pure, zero-dep TypeScript;
// strip their types (Node's built-in stripper — no bundler) and rewrite the
// .ts import specifiers to flat .js so the browser can load the parser + glosser
// + translator as ES modules. This is what powers fully open-ended production
// grading (parse + back-translate the learner's own Talo) on the Practice page.
const ENGINE_MODULES = [
  { src: "tools/parser/src/morphology.ts", flat: "morphology.js" },
  { src: "tools/parser/src/validator.ts", flat: "validator.js" },
  { src: "tools/parser/src/index.ts", flat: "parser-index.js" },
  { src: "tools/glosser/src/index.ts", flat: "glosser.js" },
  { src: "tools/translator/src/index.ts", flat: "translator.js" },
];
const engineByAbs = new Map(ENGINE_MODULES.map((m) => [resolve(ROOT, m.src), m.flat]));
function buildEngine() {
  const dir = join(DIST, "engine");
  mkdirSync(dir, { recursive: true });
  for (const m of ENGINE_MODULES) {
    const abs = resolve(ROOT, m.src);
    let js = stripTypeScriptTypes(readFileSync(abs, "utf8"), { mode: "strip" });
    js = js.replace(/(from\s*["'])([^"']+\.ts)(["'])/g, (_w, p1, spec, p3) => {
      const target = engineByAbs.get(resolve(dirname(abs), spec));
      if (!target) fail(`engine bundle: unresolved import "${spec}" in ${m.src}`);
      return `${p1}./${target}${p3}`;
    });
    writeFileSync(join(dir, m.flat), js);
  }
}
async function smokeTestEngine() {
  const eng = await import(pathToFileURL(join(DIST, "engine", "translator.js")).href);
  const { validate } = await import(pathToFileURL(join(DIST, "engine", "validator.js")).href);
  const ctx = eng.buildContext(dict, []);
  const out = eng.translate("Gouka kanto nekoka.", ctx);
  if (out !== "Dog see cat.") fail(`engine smoke test: translate gave "${out}"`);
  if (!validate("Gouka kanto nekoka.").issues.every((i) => i.severity !== "error")) fail("engine smoke test: validate rejected a good sentence");
  process.stdout.write(`✓ engine: ${ENGINE_MODULES.length} modules stripped + smoke-tested\n`);
}
buildEngine();
await smokeTestEngine();

if (checkOnly) {
  // verify the static src files are all present
  for (const f of ["index.html", "lookup.html", "practice.html", "practice.js", "app.js", "style.css", "reader.html", "reader.js"]) {
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
writeFileSync(join(DIST, "corpus.json"), JSON.stringify(corpus));
writeFileSync(join(DIST, "book.html"), wrapBook(bookHtml));
// a .nojekyll so Pages serves files as-is
writeFileSync(join(DIST, ".nojekyll"), "");

process.stdout.write(`✓ wrote site to ${DIST}\n`);

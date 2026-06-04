#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo SRS deck generator.
 *
 *   talo-srs                       # write dist/talo-srs.tsv + dist/talo-srs.json
 *   talo-srs --max-tier 1          # core deck only (tier 1)
 *   talo-srs --compounds           # also include curated idiomatic compounds
 *   talo-srs --check               # build + report counts, write nothing
 *
 * Reads the committed dictionary/dist/dictionary.json (build it first with
 * `node --experimental-strip-types dictionary/src/build.ts` if it is stale) and
 * writes an Anki-importable TSV (with #separator/#columns directives) plus a
 * JSON deck. Exit 2 on usage/data error.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildDeck, type Card, type DeckEntry } from "./index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DICT = join(__dirname, "..", "..", "..", "dictionary", "dist", "dictionary.json");
const DIST = join(__dirname, "..", "dist");

const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const includeCompounds = argv.includes("--compounds");
const mtIdx = argv.indexOf("--max-tier");
const maxTier = mtIdx >= 0 ? Number(argv[mtIdx + 1]) : undefined;
if (mtIdx >= 0 && !Number.isFinite(maxTier)) {
  process.stderr.write("✗ --max-tier needs a number\n");
  process.exit(2);
}

let entries: DeckEntry[];
try {
  entries = JSON.parse(readFileSync(DICT, "utf8"));
} catch {
  process.stderr.write(`✗ cannot read ${DICT}\n  build it: node --experimental-strip-types dictionary/src/build.ts\n`);
  process.exit(2);
}

const deck = buildDeck(entries, { maxTier, includeCompounds });

// A flashcard field must be a single clean cell: no tabs or newlines.
const cell = (s: string): string => s.replace(/[\t\r\n]+/g, " ").trim();
const COLUMNS = ["Talo", "IPA", "English", "Badges", "Domain", "Tier", "Example", "ExampleEN"];
const row = (c: Card): string =>
  [c.talo, c.ipa, c.english, c.badges, c.domainName, c.tier === 0 ? "compound" : String(c.tier), c.example, c.exampleEn]
    .map(cell)
    .join("\t");

const byTier = new Map<string, number>();
for (const c of deck) {
  const k = c.kind === "compound" ? "compound" : `tier ${c.tier}`;
  byTier.set(k, (byTier.get(k) ?? 0) + 1);
}
const summary = [...byTier].map(([k, n]) => `${k}: ${n}`).join(", ");
process.stdout.write(`✓ deck: ${deck.length} cards (${summary})\n`);

if (checkOnly) process.exit(0);

mkdirSync(DIST, { recursive: true });

// Anki text import: leading #directives configure the importer, then TSV rows.
const tsv = [
  "#separator:tab",
  "#html:false",
  `#columns:${COLUMNS.join("\t")}`,
  ...deck.map(row),
].join("\n") + "\n";
writeFileSync(join(DIST, "talo-srs.tsv"), tsv);

writeFileSync(join(DIST, "talo-srs.json"), JSON.stringify(deck, null, 0) + "\n");

process.stdout.write(`✓ wrote dist/talo-srs.tsv (Anki) and dist/talo-srs.json\n`);

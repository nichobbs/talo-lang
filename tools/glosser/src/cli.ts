#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo interlinear glosser.
 *
 *   talo-gloss "bukamaka tuyoipe tatakuto Yapanka yana"
 *   echo "hitoka ingi matito li" | talo-gloss          # reads stdin if no args
 *   talo-gloss --corpus                                 # gloss every corpus clause,
 *                                                       #   FAIL on any unglossable token
 *
 * Reads dictionary/dist/dictionary.json + corpus/proper-nouns.tsv. In clause mode
 * it prints the Talo line and the gloss line. In --corpus mode it is a COVERAGE
 * GATE: exit 1 if any token in the reading corpus fails to gloss (a typo, or a
 * word that isn't real Talo yet). Exit 2 on usage/data error.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync } from "node:fs";
import { buildContext, glossClause, glossToken, isUnglossed, type GlossEntry } from "./index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..", "..");
const DICT = join(ROOT, "dictionary", "dist", "dictionary.json");
const PROPER = join(ROOT, "corpus", "proper-nouns.tsv");
const ARTICLES = join(ROOT, "corpus", "articles");

let entries: GlossEntry[];
try {
  entries = JSON.parse(readFileSync(DICT, "utf8"));
} catch {
  process.stderr.write(`✗ cannot read ${DICT}\n  build it: node --experimental-strip-types dictionary/src/build.ts\n`);
  process.exit(2);
}

/** Minimal TSV reader (first row is the header). */
function loadTsv(path: string): Record<string, string>[] {
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const header = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

let properRows: { root: string; source: string }[] = [];
try {
  properRows = loadTsv(PROPER).map((r) => ({ root: r.root, source: r.source }));
} catch { /* proper nouns optional */ }

const ctx = buildContext(entries, properRows);
const args = process.argv.slice(2);

/** Extract `talo › english` clauses from a corpus file's ```talo blocks. */
function corpusClauses(md: string): string[] {
  const out: string[] = [];
  let inBlock = false;
  for (const line of md.split(/\r?\n/)) {
    const f = line.trim();
    if (f.startsWith("```")) { inBlock = f === "```talo"; continue; }
    if (!inBlock) continue;
    if (!f || f.startsWith("#") || !f.includes("›")) continue;
    const talo = f.split("›")[0].trim();
    if (talo) out.push(talo);
  }
  return out;
}

if (args.includes("--corpus")) {
  let clauses = 0;
  let bad = 0;
  for (const file of readdirSync(ARTICLES).filter((f) => f.endsWith(".md")).sort()) {
    const md = readFileSync(join(ARTICLES, file), "utf8");
    for (const clause of corpusClauses(md)) {
      clauses++;
      const misses = clause.split(/\s+/).map((t) => glossToken(t, ctx)).filter(isUnglossed);
      if (misses.length) {
        bad++;
        process.stdout.write(`✗ ${file}: ${clause}\n    unglossable: ${misses.join(", ")}\n`);
      }
    }
  }
  if (bad) {
    process.stderr.write(`\n✗ ${bad}/${clauses} corpus clause(s) have unglossable tokens\n`);
    process.exit(1);
  }
  process.stdout.write(`✓ all ${clauses} corpus clauses gloss cleanly\n`);
  process.exit(0);
}

// clause mode: args joined as one clause, or each line of stdin.
const inputs: string[] = args.length
  ? [args.join(" ")]
  : readFileSync(0, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

if (inputs.length === 0) {
  process.stderr.write('usage: talo-gloss "<clause>"  |  talo-gloss --corpus\n');
  process.exit(2);
}

for (const clause of inputs) {
  process.stdout.write(`${clause}\n${glossClause(clause, ctx)}\n`);
}

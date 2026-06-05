#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo reading-coverage harness (docs/0013).
 *
 *   talo-coverage-reading              # coverage % + where the gaps cluster
 *   talo-coverage-reading --missing    # also print the full uncovered queue
 *   talo-coverage-reading --min 95     # exit 1 if coverage is below 95% (optional gate)
 *
 * Reads data/reading-reference.tsv + dictionary/dist/dictionary.json. Without
 * --min it never fails on coverage level (it's a progress report, not a blocker
 * until we reach target). Exit 2 on data error.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { coverageReport, type RefConcept, type CovEntry } from "./index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..", "..");
const REF = join(ROOT, "data", "reading-reference.tsv");
const DICT = join(ROOT, "dictionary", "dist", "dictionary.json");

const argv = process.argv.slice(2);
const showMissing = argv.includes("--missing");
const minIdx = argv.indexOf("--min");
const min = minIdx >= 0 ? Number(argv[minIdx + 1]) : undefined;

function loadRef(path: string): RefConcept[] {
  const out: RefConcept[] = [];
  const lines = readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  for (const line of lines.slice(1)) {
    const [id, english, chapter, gloss] = line.split("\t");
    if (id && english) out.push({ id, english, chapter: chapter ?? "", gloss: gloss ?? "" });
  }
  return out;
}

let reference: RefConcept[];
let entries: CovEntry[];
try {
  reference = loadRef(REF);
  entries = JSON.parse(readFileSync(DICT, "utf8"));
} catch (err) {
  process.stderr.write(`✗ cannot read data: ${String(err)}\n`);
  process.exit(2);
}

const r = coverageReport(reference, entries);

process.stdout.write(`Reading-coverage of the IDS spine (${r.total} concepts) — lower bound, pre-triage:\n`);
process.stdout.write(`  covered: ${r.covered}/${r.total} = ${r.pct.toFixed(1)}%   (target 98%, interim 95%)\n\n`);

process.stdout.write(`Gaps by chapter (uncovered / total):\n`);
for (const c of r.byChapter.filter((c) => c.missing > 0)) {
  process.stdout.write(`  ch ${c.chapter.padStart(2)}  ${String(c.missing).padStart(3)} / ${c.total}\n`);
}

if (showMissing) {
  process.stdout.write(`\nUncovered concepts — the triage-then-mint queue (${r.missing.length}):\n`);
  for (const m of r.missing) process.stdout.write(`  ${m.id.padEnd(9)} ch${m.chapter.padStart(2)}  ${m.english}\n`);
} else {
  process.stdout.write(`\n${r.missing.length} uncovered concepts — run with --missing for the full queue.\n`);
}

if (min !== undefined) {
  if (!Number.isFinite(min)) {
    process.stderr.write("✗ --min needs a number\n");
    process.exit(2);
  }
  if (r.pct < min) {
    process.stderr.write(`\n✗ coverage ${r.pct.toFixed(1)}% is below the --min ${min}% threshold\n`);
    process.exit(1);
  }
  process.stdout.write(`\n✓ coverage ${r.pct.toFixed(1)}% meets the --min ${min}% threshold\n`);
}

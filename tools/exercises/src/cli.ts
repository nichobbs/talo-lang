#!/usr/bin/env node
/**
 * Talo exercises CLI.
 *
 *   talo-exercises --check     # validate the bank parses (CI gate)
 *   talo-exercises --build     # write data/exercises.json (bank + generated)
 *   talo-exercises --gen 8     # preview generated level-8 items
 *
 * Reads data/exercises.tsv, dictionary/dist/dictionary.json, corpus/proper-nouns.tsv.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildContext, type GlossEntry } from "../../translator/src/index.ts";
import { parseBank, validateBank, buildDeck, generate } from "./index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BANK = join(ROOT, "data", "exercises.tsv");
const OUT = join(ROOT, "data", "exercises.json");
const DICT = join(ROOT, "dictionary", "dist", "dictionary.json");
const PROPER = join(ROOT, "corpus", "proper-nouns.tsv");

const entries: GlossEntry[] = JSON.parse(readFileSync(DICT, "utf8"));
const properRows = readFileSync(PROPER, "utf8").trim().split(/\r?\n/).slice(1)
  .filter((l) => l && !l.startsWith("#")).map((l) => l.split("\t")).map((c) => ({ root: c[0], source: c[1] }));
const ctx = buildContext(entries, properRows);
const knownRoots = new Set<string>([
  ...entries.filter((e: any) => e.kind === "root").map((e) => e.form),
  ...properRows.map((r) => r.root),
]);

const bank = parseBank(readFileSync(BANK, "utf8"));
const argv = process.argv.slice(2);

if (argv[0] === "--check") {
  const bad = validateBank(bank, knownRoots);
  if (bad.length) {
    process.stderr.write(`✗ ${bad.length} exercise(s) fail to parse:\n`);
    for (const b of bad) process.stderr.write(`  ${b.id}: ${b.codes.join(", ")}\n`);
    process.exit(1);
  }
  process.stdout.write(`✓ ${bank.length} exercises parse; all roots known\n`);
} else if (argv[0] === "--build") {
  const deck = buildDeck(bank, ctx, knownRoots);
  writeFileSync(OUT, JSON.stringify(deck, null, 2) + "\n");
  process.stdout.write(`✓ wrote ${OUT}: ${deck.length} exercises (${bank.length} authored + ${deck.length - bank.length} generated)\n`);
} else if (argv[0] === "--gen") {
  const lvl = Number(argv[1] || 7);
  for (const ex of generate(lvl, 8, ctx)) process.stdout.write(`${ex.talo}\n  → ${ex.english}\n`);
} else {
  process.stdout.write("usage: talo-exercises --check | --build | --gen <level>\n");
}

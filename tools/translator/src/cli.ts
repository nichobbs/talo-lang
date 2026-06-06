#!/usr/bin/env node
/**
 * Talo → English translator CLI.
 *
 *   talo-translate "Gouka kanto nekoka."      # translate one sentence
 *   echo "..." | talo-translate               # translate stdin (one per line)
 *   talo-translate --corpus                    # translate every corpus clause,
 *                                              #   side-by-side with the reference
 *
 * Reads dictionary/dist/dictionary.json + corpus/proper-nouns.tsv.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildContext, translate, type GlossEntry } from "./index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DICT = join(ROOT, "dictionary", "dist", "dictionary.json");
const PROPER = join(ROOT, "corpus", "proper-nouns.tsv");
const ARTICLES = join(ROOT, "corpus", "articles");

let entries: GlossEntry[];
try {
  entries = JSON.parse(readFileSync(DICT, "utf8"));
} catch {
  process.stderr.write(`✗ cannot read ${DICT}\n  build it: cd dictionary && npm run build\n`);
  process.exit(1);
}

let properRows: { root: string; source: string }[] = [];
try {
  const lines = readFileSync(PROPER, "utf8").trim().split(/\r?\n/);
  const head = lines[0].split("\t");
  const ri = head.indexOf("root"), si = head.indexOf("source");
  properRows = lines.slice(1).filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("\t")).map((c) => ({ root: c[ri], source: c[si] }));
} catch { /* optional */ }

const ctx = buildContext(entries, properRows);
const argv = process.argv.slice(2);

if (argv[0] === "--corpus") {
  // Pull each "talo  › English" line from the corpus and show our translation.
  let n = 0;
  for (const file of readdirSync(ARTICLES).filter((f) => f.endsWith(".md")).sort()) {
    const md = readFileSync(join(ARTICLES, file), "utf8");
    for (const line of md.split(/\r?\n/)) {
      const m = line.match(/^([^#|>][^›]*?)\s+›\s+(.+)$/);
      if (!m) continue;
      const talo = m[1].trim();
      if (!talo || talo.startsWith("#")) continue;
      n++;
      process.stdout.write(`talo:  ${talo}\n  mt:  ${translate(talo, ctx)}\n  ref: ${m[2].trim()}\n\n`);
    }
  }
  process.stderr.write(`✓ translated ${n} corpus clause(s)\n`);
} else if (argv.length) {
  process.stdout.write(translate(argv.join(" "), ctx) + "\n");
} else {
  const lines = readFileSync(0, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const l of lines) process.stdout.write(translate(l, ctx) + "\n");
}

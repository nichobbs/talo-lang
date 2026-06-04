#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo deprecation registry.
 *
 *   talo-deprecations            # list the registry
 *   talo-deprecations --check    # gate: retired forms stay dead, replacements live
 *
 * Reads data/deprecations.tsv against data/lexicon.tsv + data/derived-lexicon.tsv
 * + data/compounds.tsv. Exit 1 on any registry violation, 2 on data error.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkRegistry, type Deprecation, type LiveView } from "./index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "..", "..", "data");

const checkOnly = process.argv.includes("--check");

/** Read a TSV that may carry leading `#` comment lines before the header. */
function loadTsv(path: string): Record<string, string>[] {
  const lines = readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  const header = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

let deprecations: Deprecation[];
let live: LiveView;
try {
  deprecations = loadTsv(join(DATA, "deprecations.tsv")) as unknown as Deprecation[];

  const lex = loadTsv(join(DATA, "lexicon.tsv"));
  const liveForms = new Set<string>();
  const formById = new Map<string, string>();
  for (const r of lex) {
    if (r.form) liveForms.add(r.form);
    if (r.id && r.form) formById.set(r.id, r.form);
  }
  // derived + compound surface forms also count as "live" spellings.
  for (const file of ["derived-lexicon.tsv", "compounds.tsv"]) {
    try {
      for (const r of loadTsv(join(DATA, file))) if (r.form) liveForms.add(r.form);
    } catch { /* optional layer */ }
  }
  live = { liveForms, formById };
} catch (err) {
  process.stderr.write(`✗ cannot read data/: ${String(err)}\n`);
  process.exit(2);
}

if (!checkOnly) {
  process.stdout.write(`Talo deprecation registry — ${deprecations.length} retired form(s)\n\n`);
  for (const d of deprecations) {
    const to = d.new_form === "∅" ? "(retired, no replacement)" : `→ ${d.new_form}`;
    process.stdout.write(`  ${d.old_form.padEnd(14)} ${to.padEnd(16)} ${d.id.padEnd(9)} ${d.gloss}  [${d.decision}, ${d.date}]\n`);
  }
  process.stdout.write("\n");
}

const problems = checkRegistry(deprecations, live);
if (problems.length) {
  process.stderr.write(`✗ ${problems.length} registry problem(s):\n`);
  for (const p of problems) process.stderr.write(`  [${p.kind}] ${p.detail}\n`);
  process.exit(1);
}
process.stdout.write(`✓ ${deprecations.length} retired form(s) stay dead; every replacement is live under its id\n`);

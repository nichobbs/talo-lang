#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo morphological linter.
 *
 *   talo-morpho "pani+kama+ka"            lint a morpheme decomposition; print the form
 *   talo-morpho --data                    validate the generated layers (compounds +
 *                                         derived-lexicon): every row's `morphemes`
 *                                         must join legally to its `form`
 *   talo-morpho --data <file.tsv> ...     validate specific TSV(s) instead
 *
 * Exit 0 if everything is well-formed, 1 otherwise — composes in CI like the other
 * gates. Zero dependencies.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { lintMorphemes, checkRow } from "./index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "..", "..", "data");
const DEFAULT_FILES = [join(DATA, "compounds.tsv"), join(DATA, "derived-lexicon.tsv")];

function loadRows(path: string): { form: string; morphemes: string }[] {
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const header = lines[0].split("\t");
  const fi = header.indexOf("form");
  const mi = header.indexOf("morphemes");
  if (fi === -1 || mi === -1) throw new Error(`${path}: needs 'form' and 'morphemes' columns`);
  return lines.slice(1).map((l) => {
    const c = l.split("\t");
    return { form: (c[fi] ?? "").trim(), morphemes: (c[mi] ?? "").trim() };
  }).filter((r) => r.form && r.morphemes);
}

function runData(files: string[]): number {
  let total = 0;
  const problems: string[] = [];
  for (const f of files) {
    if (!existsSync(f)) { process.stderr.write(`skip (missing): ${f}\n`); continue; }
    const rows = loadRows(f);
    total += rows.length;
    const base = f.split("/").pop();
    for (const { form, morphemes } of rows) {
      const r = checkRow(form, morphemes);
      if (!r.ok) for (const x of r.issues) problems.push(`[${base}] ${form} (${morphemes}): ${x.code} — ${x.message}`);
    }
  }
  if (problems.length) {
    process.stderr.write(`\n✗ ${problems.length} morphological problem(s):\n`);
    for (const p of problems) process.stderr.write(`  ${p}\n`);
    return 1;
  }
  process.stdout.write(`✓ ${total} generated forms join legally to their morphemes\n`);
  return 0;
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv[0] === "--data") {
    const files = argv.slice(1).length ? argv.slice(1) : DEFAULT_FILES;
    process.exit(runData(files));
  }
  if (argv.length === 0) {
    process.stderr.write("usage: talo-morpho \"root+root+ka\" | talo-morpho --data [file.tsv ...]\n");
    process.exit(2);
  }
  let bad = false;
  for (const arg of argv) {
    const r = lintMorphemes(arg);
    const mark = r.ok ? "✅" : "❌";
    process.stdout.write(`${mark} ${arg} → ${r.form}\n`);
    for (const x of r.issues) { process.stdout.write(`   ✗ [${x.code}] ${x.message}\n`); bad = true; }
  }
  process.exit(bad ? 1 : 0);
}

main();

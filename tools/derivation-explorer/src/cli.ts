#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo derivation explorer.
 *
 *   talo-derive edu              # root: family, examples, confusables
 *   talo-derive edukika          # surface word: its root, then the family
 *   talo-derive buta saya        # several at once
 *
 * Reads the committed dictionary/dist/dictionary.json (build it first with
 * `node --experimental-strip-types dictionary/src/build.ts` if it is stale).
 * Exit 2 on usage error or missing data; exit 1 if any queried form is unknown.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildIndices, explain, type DictEntry } from "./index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DICT = join(__dirname, "..", "..", "..", "dictionary", "dist", "dictionary.json");

const forms = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (forms.length === 0) {
  process.stderr.write("usage: talo-derive <form> [form ...]\n");
  process.exit(2);
}

let entries: DictEntry[];
try {
  entries = JSON.parse(readFileSync(DICT, "utf8"));
} catch {
  process.stderr.write(`✗ cannot read ${DICT}\n  build it: node --experimental-strip-types dictionary/src/build.ts\n`);
  process.exit(2);
}
const ix = buildIndices(entries);

const short = (g: string, n = 48): string => (g.length > n ? g.slice(0, n - 1) + "…" : g);
let missing = 0;

for (const form of forms) {
  const { entry, root, family, confusables, badge } = explain(form, ix);
  if (!entry) {
    process.stdout.write(`\n${form} — not in the dictionary\n`);
    missing++;
    continue;
  }
  const ipa = entry.ipa ? `  ${entry.ipa}` : "";
  process.stdout.write(`\n${entry.form}${ipa}  — ${entry.gloss}  [${entry.kind}]\n`);
  if (entry.morphemes) process.stdout.write(`  morphemes: ${entry.morphemes}\n`);
  if (root) process.stdout.write(`  root: ${root.form} — ${short(root.gloss)}\n`);

  if (entry.examples?.length) {
    process.stdout.write(`  examples:\n`);
    for (const ex of entry.examples) process.stdout.write(`    ${ex.talo}  › ${ex.en}\n`);
  }
  if (family.length) {
    process.stdout.write(`  family (${family.length}):\n`);
    for (const f of family) process.stdout.write(`    ${f.form} — ${short(f.gloss)}\n`);
  }
  if (confusables.length) {
    process.stdout.write(`  sounds like: ${confusables.map((c) => `${c.form} (${short(c.gloss, 24)})`).join(", ")}\n`);
  }
  if (badge.readsAs) {
    process.stdout.write(`  reads in text as: ${badge.readsAs.stem.form}+${badge.readsAs.badge} — ${short(badge.readsAs.stem.gloss, 28)}\n`);
  }
  for (const s of badge.spells) {
    process.stdout.write(`  spelled like: ${entry.form}+${s.badge} = ${s.root.form} (${short(s.root.gloss, 24)})\n`);
  }
  if (entry.falseFriend) process.stdout.write(`  false friend: ${entry.falseFriend}\n`);
}

process.exit(missing ? 1 : 0);

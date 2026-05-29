#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo collision checker.
 *
 *   talo-collision <form> [<form> ...]        check forms against the reserved
 *                                             words and against each other
 *   talo-collision --against lexicon.tsv <form> ...
 *                                             check new candidate(s) against an
 *                                             existing accepted lexicon
 *   talo-collision --lexicon lexicon.tsv      validate a whole lexicon file for
 *                                             internal collisions / obscenities
 *
 * Options:
 *   --blocklist <path>   obscenity blocklist (default: data/collision-blocklist.txt)
 *   --json               machine-readable output
 *
 * Exit code 0 if everything is clear, 1 if any conflict is found (composes in CI
 * as the second lexicon gate, after the phonotactic linter).
 */
import { readFileSync, existsSync } from "node:fs";
import {
  checkForm,
  checkBatch,
  RESERVED_FORMS,
  type CheckResult,
  type Occupied,
} from "./checker.ts";

const DEFAULT_BLOCKLIST = "data/collision-blocklist.txt";

function loadBlocklist(path: string): string[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
}

/** Parse a lexicon TSV; returns {form,label} rows from the `form`/`id` columns. */
function loadLexicon(path: string): { form: string; label: string }[] {
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const header = lines[0].split("\t");
  const fi = header.indexOf("form");
  const ii = header.indexOf("id");
  const gi = header.indexOf("gloss");
  if (fi === -1) throw new Error(`${path}: no 'form' column in header`);
  return lines.slice(1).map((line) => {
    const c = line.split("\t");
    const form = (c[fi] ?? "").trim();
    const label = (ii !== -1 ? c[ii] : gi !== -1 ? c[gi] : "")?.trim() || form;
    return { form, label };
  }).filter((r) => r.form.length > 0);
}

function format(r: CheckResult): string {
  if (r.ok) return `✅ ${r.form} — clear`;
  return `❌ ${r.form} — [${r.conflict.kind}] ${r.conflict.message}`;
}

function main(): void {
  const argv = process.argv.slice(2);
  const jsonMode = argv.includes("--json");
  let blocklistPath = DEFAULT_BLOCKLIST;
  let againstPath: string | null = null;
  let lexiconPath: string | null = null;
  const forms: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") continue;
    else if (a === "--blocklist") blocklistPath = argv[++i];
    else if (a === "--against") againstPath = argv[++i];
    else if (a === "--lexicon") lexiconPath = argv[++i];
    else forms.push(a);
  }

  const blocklist = loadBlocklist(blocklistPath);
  let results: CheckResult[];

  if (lexiconPath) {
    // Validate an entire lexicon file for internal consistency.
    const rows = loadLexicon(lexiconPath);
    results = checkBatch(rows.map((r) => ({ form: r.form, label: r.label })), { blocklist });
  } else {
    if (forms.length === 0) {
      process.stderr.write("usage: talo-collision <form> [...]   (or --lexicon <file>)\n");
      process.exit(2);
    }
    // Seed occupied with reserved words + any --against lexicon, then check the
    // given forms (also against each other).
    const occupied: Occupied[] = [...RESERVED_FORMS].map((form) => ({ form, label: "reserved" }));
    if (againstPath) {
      for (const r of loadLexicon(againstPath)) occupied.push({ form: r.form, label: r.label });
    }
    results = [];
    for (const form of forms) {
      const res = checkForm(form, occupied, blocklist);
      results.push(res);
      if (res.ok) occupied.push({ form, label: form });
    }
  }

  if (jsonMode) {
    process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  } else {
    for (const r of results) process.stdout.write(format(r) + "\n");
    const bad = results.filter((r) => !r.ok).length;
    process.stdout.write(`\n${results.length - bad}/${results.length} clear, ${bad} conflict(s).\n`);
  }

  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

main();

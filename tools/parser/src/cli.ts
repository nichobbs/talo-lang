#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo parser / sentence validator.
 *
 *   talo-parse "<clause>" ["<clause>" ...]   validate one or more clauses
 *   talo-parse --analyze "<clause>"          show the morphological breakdown
 *   talo-parse --file sentences.txt          validate one clause per line
 *   talo-parse --lexicon data/lexicon.tsv "<clause>"
 *                                            also warn on roots not in the lexicon
 *
 * Options:
 *   --json     machine-readable output
 *   --analyze  print the per-word analysis (category, root, affixes)
 *
 * Exit 0 if every clause is structurally valid (no errors; warnings allowed),
 * 1 if any clause has an error. Composes in CI like the other tools.
 */
import { readFileSync, existsSync } from "node:fs";
import { validate, type ValidateResult } from "./validator.ts";
import { analyze } from "./morphology.ts";

/** Pull the root inventory out of a lexicon TSV for the unknown-root check. */
function loadRoots(path: string): Set<string> {
  const roots = new Set<string>();
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const header = lines[0].split("\t");
  const fi = header.indexOf("form");
  if (fi === -1) throw new Error(`${path}: no 'form' column`);
  for (const line of lines.slice(1)) {
    const form = (line.split("\t")[fi] ?? "").trim();
    if (!form) continue;
    // Store the bare form; for badged content the analyzer peels to the root, so
    // also store the analyzed root if the stored form happens to be badged.
    const a = analyze(form);
    roots.add(a.kind === "content" && a.root ? a.root : form);
  }
  return roots;
}

function formatResult(r: ValidateResult): string {
  const lines: string[] = [];
  const mark = r.ok ? "✅" : "❌";
  lines.push(`${mark} ${r.clause}`);
  for (const x of r.issues) {
    const icon = x.severity === "error" ? "  ✗" : "  ⚠";
    lines.push(`${icon} [${x.code}] ${x.message}`);
  }
  return lines.join("\n");
}

function formatAnalysis(clause: string): string {
  const toks = clause.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/^[^a-z]+|[^a-z]+$/gi, "")).filter(Boolean);
  const lines = [`# ${clause}`];
  for (const t of toks) {
    const a = analyze(t);
    if (a.kind === "content") {
      const deriv = a.affixes.length ? ` +${a.affixes.join("+")}` : "";
      lines.push(`  ${t.padEnd(14)} ${a.category} — root '${a.root}'${deriv}`);
    } else if (a.kind === "function") {
      lines.push(`  ${t.padEnd(14)} function (${a.functionRole})`);
    } else if (a.kind === "correlative") {
      lines.push(`  ${t.padEnd(14)} correlative (0002 §6.7)`);
    } else {
      lines.push(`  ${t.padEnd(14)} ??? no badge / unknown`);
    }
  }
  return lines.join("\n");
}

function main(): void {
  const argv = process.argv.slice(2);
  const jsonMode = argv.includes("--json");
  const analyzeMode = argv.includes("--analyze");
  let lexiconPath: string | null = null;
  let filePath: string | null = null;
  const clauses: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json" || a === "--analyze") continue;
    else if (a === "--lexicon") lexiconPath = argv[++i];
    else if (a === "--file") filePath = argv[++i];
    else clauses.push(a);
  }

  if (filePath) {
    if (!existsSync(filePath)) {
      process.stderr.write(`file not found: ${filePath}\n`);
      process.exit(2);
    }
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const s = line.trim();
      if (s && !s.startsWith("#")) clauses.push(s);
    }
  }

  if (clauses.length === 0) {
    process.stderr.write('usage: talo-parse "<clause>" [...]   (or --file <f>, --analyze)\n');
    process.exit(2);
  }

  if (analyzeMode) {
    process.stdout.write(clauses.map(formatAnalysis).join("\n\n") + "\n");
    process.exit(0);
  }

  const knownRoots = lexiconPath ? loadRoots(lexiconPath) : undefined;
  const results = clauses.map((c) => validate(c, { knownRoots }));

  if (jsonMode) {
    process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  } else {
    for (const r of results) process.stdout.write(formatResult(r) + "\n");
    const bad = results.filter((r) => !r.ok).length;
    process.stdout.write(`\n${results.length - bad}/${results.length} valid, ${bad} with errors.\n`);
  }

  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

main();

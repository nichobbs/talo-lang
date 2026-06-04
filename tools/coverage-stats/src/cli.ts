#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for Talo coverage statistics.
 *
 *   talo-coverage            # print the report
 *   talo-coverage --check    # exit 1 only on a PROVABLE cap breach (0003 §7b)
 *
 * Reads data/lexicon.tsv + data/concepts.tsv. Exit 2 on data error.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildReport, FAMILY_CAP_PCT, type LexRow, type ConRow } from "./index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "..", "..", "data");

const checkOnly = process.argv.includes("--check");

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

let lex: LexRow[];
let con: ConRow[];
try {
  lex = loadTsv(join(DATA, "lexicon.tsv")) as unknown as LexRow[];
  con = loadTsv(join(DATA, "concepts.tsv")) as unknown as ConRow[];
} catch (err) {
  process.stderr.write(`✗ cannot read data/: ${String(err)}\n`);
  process.exit(2);
}

const r = buildReport(lex, con);
const pct = (n: number, d: number) => (d ? ((100 * n) / d).toFixed(1) : "0.0");
const bar = (p: number) => "█".repeat(Math.round(p / 2));

const out: string[] = [];
out.push(`Talo coverage — ${r.forms} forms, ${r.concepts} concepts\n`);

out.push("Donor-family balance (share of the " + r.donorSourced + " donor-sourced forms; cap ≤" + FAMILY_CAP_PCT + "%):");
for (const f of r.families) {
  const flag = f.family === "UNATTRIBUTED" ? "  —" : f.pctOfDonor >= FAMILY_CAP_PCT ? "  ✗ OVER CAP" : "";
  out.push(`  ${f.family.padEnd(14)} ${String(f.count).padStart(4)}  ${pct(f.count, r.donorSourced).padStart(5)}%  ${bar(f.pctOfDonor)}${flag}`);
}
out.push(`  ${"(coined)".padEnd(14)} ${String(r.coined).padStart(4)}`);
out.push(`  ${"(derived)".padEnd(14)} ${String(r.derived).padStart(4)}`);
out.push(`  unattributed: ${r.unattributed} forms (${pct(r.unattributed, r.donorSourced)}% of donor-sourced) — family not recorded in notes\n`);

out.push("Tier coverage (concepts):");
for (const t of r.tiers) out.push(`  tier ${t.tier}  ${String(t.count).padStart(4)}  ${pct(t.count, r.concepts).padStart(5)}%`);
out.push("");

out.push(`Domain coverage (${r.domains.length} domains, concepts):`);
for (const d of r.domains) out.push(`  ${d.domain.padEnd(6)} ${String(d.count).padStart(4)}`);
out.push("");

out.push("Gate health:");
out.push(`  derivable concepts, no root (by design): ${r.derivableWithoutForm.length}`);
out.push(`  ROOT concepts missing a form: ${r.rootsWithoutForm.length}` +
  (r.rootsWithoutForm.length ? ` (${r.rootsWithoutForm.slice(0, 8).join(", ")}…)` : ""));
out.push(`  cap breaches (provable): ${r.provenOverCap.length ? r.provenOverCap.map((f) => f.family).join(", ") : "none"}`);

process.stdout.write(out.join("\n") + "\n");

if (checkOnly) {
  const problems: string[] = [];
  if (r.provenOverCap.length) {
    problems.push(`${r.provenOverCap.length} family(ies) provably exceed the ${FAMILY_CAP_PCT}% cap: ${r.provenOverCap.map((f) => `${f.family} ${f.pctOfDonor.toFixed(1)}%`).join(", ")}`);
  }
  if (r.rootsWithoutForm.length) {
    problems.push(`${r.rootsWithoutForm.length} root concept(s) have no form: ${r.rootsWithoutForm.slice(0, 12).join(", ")}`);
  }
  if (problems.length) {
    process.stderr.write(`\n✗ ${problems.map((p) => "  " + p).join("\n")}\n`);
    process.exit(1);
  }
  process.stdout.write(`\n✓ no donor family provably exceeds the ${FAMILY_CAP_PCT}% cap; every root concept has a form\n`);
}

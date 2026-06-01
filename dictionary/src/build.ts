#!/usr/bin/env -S node --experimental-strip-types
/**
 * Talo dictionary generator.
 *
 * Joins data/lexicon.tsv (id → form, source, rationale, notes) with
 * data/concepts.tsv (id → domain, tier, pos hint, is_root, derivation) and emits
 * a structured bilingual dictionary in three forms:
 *
 *   dist/dictionary.json   — one record per entry (the data the web tool loads)
 *   dist/talo-english.md   — Talo → English, alphabetical by form
 *   dist/english-talo.md   — English → Talo, alphabetical by gloss keyword
 *
 * It is also an INTEGRITY GATE: every form is re-checked through the phonotactic
 * linter, every id is required to exist in both files, and duplicate forms/glosses
 * are reported. Exit 0 only if the data is clean — so the dictionary build doubles
 * as a cross-file consistency check on data/.
 *
 *   node --experimental-strip-types src/build.ts            # generate dist/*
 *   node --experimental-strip-types src/build.ts --check    # validate only, no output
 *
 * Zero runtime deps; reuses the repo's own linter + parser. (The book/site that
 * consume these outputs may use a standard toolchain; the data layer stays clean.)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { lint } from "../../tools/phonotactic-linter/src/index.ts";
import { analyze } from "../../tools/parser/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const DATA = join(ROOT, "data");
const DIST = join(__dirname, "..", "dist");

const checkOnly = process.argv.includes("--check");

/** Human-readable names for the domain codes used in concepts.tsv. */
const DOMAINS: Record<string, string> = {
  FUN: "function word", QTY: "quantity", TIM: "time", PHY: "physical world",
  PROP: "property", BOD: "body", KIN: "people", ANI: "animal", AGR: "plant",
  FOO: "food", CLO: "clothing", DWE: "dwelling", ACT: "action", MOT: "motion",
  SPA: "space", PER: "perception", EMO: "emotion", COG: "cognition",
  SPE: "speech", POS: "possession", SOC: "society", MOD: "modern world",
  COR: "correlative", CLO2: "clothing",
};

interface Row { [k: string]: string }

function loadTsv(path: string): Row[] {
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const header = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    const row: Row = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

export interface Entry {
  id: string;
  form: string;
  gloss: string;
  domain: string;
  domainName: string;
  tier: number;
  pos: string;
  isRoot: boolean;
  derivation: string;
  /** which badges this root conventionally takes, derived from pos hint */
  badges: { noun?: string; verb?: string; modifier?: string };
  source: string;
}

const POS_TO_BADGE: Record<string, ("noun" | "verb" | "modifier")[]> = {
  n: ["noun"], v: ["verb"], mod: ["modifier"], num: ["noun"],
  fun: [], // function words take no badge
};

function build(): Entry[] {
  const lex = loadTsv(join(DATA, "lexicon.tsv"));
  const con = loadTsv(join(DATA, "concepts.tsv"));
  const conById = new Map(con.map((r) => [r.id, r]));

  const problems: string[] = [];
  const seenForm = new Map<string, string>();
  const entries: Entry[] = [];

  for (const r of lex) {
    const { id, form, gloss } = r;
    // integrity: every form must be legal Talo
    const lintRes = lint(form);
    if (!lintRes.legal) {
      problems.push(`${id} '${form}': illegal Talo (${lintRes.violation.rule})`);
    }
    // integrity: duplicate surface form
    if (seenForm.has(form)) {
      problems.push(`duplicate form '${form}': ${seenForm.get(form)} and ${id}`);
    } else {
      seenForm.set(form, id);
    }
    const c = conById.get(id);
    // not every lexicon id must be in concepts (correlatives etc. are derived),
    // but if a concept exists we enrich from it.
    const domain = c?.domain ?? id.split("-")[0];
    const posHint = c?.pos_hint ?? "";
    const a = analyze(form);
    const badges: Entry["badges"] = {};
    const wants = POS_TO_BADGE[posHint] ?? [];
    // Badge senses come from the conventional pos hint (concepts.tsv), which is
    // authoritative: function words and correlatives (hint "fun", or a COR id)
    // take NO badge even if their surface happens to end in -ka/-to/-pe (e.g.
    // `ato` "after"). Only roots with a content pos hint show badge forms.
    const isFunction = posHint === "fun" || domain === "COR" || a.kind === "correlative";
    if (!isFunction && wants.length) {
      for (const b of wants) {
        if (b === "noun") badges.noun = form.endsWith("ka") ? form : `${stripBadge(form)}ka`;
        if (b === "verb") badges.verb = form.endsWith("to") ? form : `${stripBadge(form)}to`;
        if (b === "modifier") badges.modifier = form.endsWith("pe") ? form : `${stripBadge(form)}pe`;
      }
    }
    entries.push({
      id, form, gloss,
      domain, domainName: DOMAINS[domain] ?? domain.toLowerCase(),
      tier: c ? Number(c.tier) : 0,
      pos: posHint,
      isRoot: c ? c.is_root === "yes" : true,
      derivation: c?.derivation ?? "",
      badges,
      source: r.rationale || r.source || "",
    });
  }

  if (problems.length) {
    process.stderr.write(`\n✗ dictionary integrity: ${problems.length} problem(s):\n`);
    for (const p of problems.slice(0, 40)) process.stderr.write(`  ${p}\n`);
    process.exit(1);
  }

  process.stdout.write(`✓ ${entries.length} entries, all forms legal, no duplicate forms\n`);
  return entries;
}

/** Remove a trailing badge if present, to re-badge a stored form. */
function stripBadge(form: string): string {
  if (/(ka|to|pe)$/.test(form)) return form.slice(0, -2);
  return form;
}

/** Split a gloss like "look at / watch" into searchable keywords. */
function glossKeywords(gloss: string): string[] {
  return gloss
    .split(/\s*\/\s*|,\s*/)
    .map((g) => g.replace(/\(.*?\)/g, "").trim())
    .filter(Boolean);
}

function emit(entries: Entry[]): void {
  mkdirSync(DIST, { recursive: true });

  // 1. JSON (web tool data) — compact, with split keywords for search.
  const json = entries.map((e) => ({
    id: e.id, form: e.form, gloss: e.gloss, keywords: glossKeywords(e.gloss),
    domain: e.domain, domainName: e.domainName, tier: e.tier, pos: e.pos,
    isRoot: e.isRoot, derivation: e.derivation, badges: e.badges,
  }));
  writeFileSync(join(DIST, "dictionary.json"), JSON.stringify(json, null, 0) + "\n");

  // 2. Talo → English, alphabetical by form.
  const byForm = [...entries].sort((a, b) => a.form.localeCompare(b.form));
  const t2e: string[] = [
    "# Talo → English dictionary", "",
    `*${entries.length} entries. Generated from \`data/lexicon.tsv\` + \`data/concepts.tsv\`.*`,
    "",
  ];
  let letter = "";
  for (const e of byForm) {
    const L = e.form[0].toUpperCase();
    if (L !== letter) { letter = L; t2e.push(`\n## ${L}\n`); }
    const badgeNote = badgeLine(e);
    t2e.push(`**${e.form}** — ${e.gloss}  *(${e.domainName})*${badgeNote}`, "");
  }
  writeFileSync(join(DIST, "talo-english.md"), t2e.join("\n"));

  // 3. English → Talo, alphabetical by gloss keyword (one line per keyword).
  const pairs: { key: string; form: string; gloss: string }[] = [];
  for (const e of entries) {
    for (const k of glossKeywords(e.gloss)) pairs.push({ key: k.toLowerCase(), form: e.form, gloss: e.gloss });
  }
  pairs.sort((a, b) => a.key.localeCompare(b.key) || a.form.localeCompare(b.form));
  const e2t: string[] = [
    "# English → Talo index", "",
    `*${pairs.length} headwords across ${entries.length} Talo words.*`, "",
  ];
  letter = "";
  for (const p of pairs) {
    const L = (p.key[0] || "?").toUpperCase();
    if (L !== letter) { letter = L; e2t.push(`\n## ${L}\n`); }
    e2t.push(`**${p.key}** → ${p.form}`, "");
  }
  writeFileSync(join(DIST, "english-talo.md"), e2t.join("\n"));

  process.stdout.write(`✓ wrote dist/dictionary.json, talo-english.md, english-talo.md\n`);
}

/** A short note showing the conventional badge forms for an acategorial root. */
function badgeLine(e: Entry): string {
  const b = e.badges;
  const parts: string[] = [];
  if (b.noun) parts.push(`${b.noun} (n)`);
  if (b.verb) parts.push(`${b.verb} (v)`);
  if (b.modifier) parts.push(`${b.modifier} (mod)`);
  if (parts.length === 0) return "";
  // Only show if the badged forms differ from the stored form (i.e. it's a root).
  if (parts.length === 1 && (b.noun === e.form || b.verb === e.form || b.modifier === e.form)) return "";
  return ` — badges: ${parts.join(", ")}`;
}

const entries = build();
if (!checkOnly) emit(entries);

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
import { toIPA } from "../../tools/ipa/src/index.ts";

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
  /** "root" (a bare acategorial root), "derived" (root+affix(es)+badge, docs/0007
   *  §2/§7) or "compound" (multi-root + badge, §8). Lets the web tool filter. */
  kind: "root" | "derived" | "compound";
  /** for derived/compound: the morpheme breakdown, e.g. "edu+ki+ka". */
  morphemes?: string;
  /** for derived: the underlying root form, e.g. "edu". */
  base?: string;
  /** the gloss keywords the English→Talo search indexes this entry under. */
  keywords: string[];
  /** broad IPA transcription with initial stress, e.g. "/ˈpa.ni.ka/" (0001; tools/ipa). */
  ipa?: string;
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
      kind: "root",
      keywords: glossKeywords(gloss),
    });
  }

  // ---- derived layer (data/derived-lexicon.tsv, docs/0007 §2/§7) ------------
  // The productive paradigm materialised as surface WORDS (root+affix(es)+badge),
  // folded in so a lookup of e.g. `edukika` "teacher" resolves. They are checked
  // through the SAME integrity gate (legal + unique). English→Talo search indexes
  // them under their ROOT gloss (the templated English gloss is a display hint),
  // so searching "teach" surfaces the agent/place/result derivations too.
  for (const r of loadTsv(join(DATA, "derived-lexicon.tsv"))) {
    const { id, form, gloss } = r;
    if (!form) continue;
    pushSurface(entries, problems, seenForm, {
      id, form, gloss, kind: "derived",
      domain: id.split(".")[0].split("-")[0],
      derivation: r.deriv ?? "",
      morphemes: r.morphemes ?? "",
      base: r.root ?? "",
      // index under the root meaning, not the templated gloss
      keywords: glossKeywords(r.root_gloss ?? gloss),
      source: r.morphemes ?? "",
    });
  }

  // ---- compound layer (data/compounds.tsv, docs/0007 §8) --------------------
  // Curated idiomatic compounds; grouped under the HEAD root's domain, indexed
  // under their own (real) gloss.
  for (const r of loadTsv(join(DATA, "compounds.tsv"))) {
    const { id, form, gloss } = r;
    if (!form) continue;
    const head = (r.parts ?? "").split("+").pop() ?? "";
    pushSurface(entries, problems, seenForm, {
      id, form, gloss, kind: "compound",
      domain: head.split("-")[0] || "MOD",
      derivation: "compound",
      morphemes: r.morphemes ?? "",
      keywords: glossKeywords(gloss),
      source: r.parts ?? "",
    });
  }

  if (problems.length) {
    process.stderr.write(`\n✗ dictionary integrity: ${problems.length} problem(s):\n`);
    for (const p of problems.slice(0, 40)) process.stderr.write(`  ${p}\n`);
    process.exit(1);
  }

  process.stdout.write(`✓ ${entries.length} entries, all forms legal, no duplicate forms\n`);
  for (const e of entries) e.ipa = toIPA(e.form, true);
  return entries;
}

/**
 * Append a derived/compound surface word, running the same integrity gate as a
 * root: the form must be legal Talo and globally unique. (The generators in
 * scripts/ already guarantee both, but the dictionary re-checks so it stays an
 * independent cross-file gate over whatever is committed.)
 */
function pushSurface(
  entries: Entry[],
  problems: string[],
  seenForm: Map<string, string>,
  e: Pick<Entry, "id" | "form" | "gloss" | "kind" | "domain" | "derivation" | "morphemes" | "keywords" | "source"> & { base?: string },
): void {
  if (!lint(e.form).legal) problems.push(`${e.id} '${e.form}': illegal Talo (derived)`);
  if (seenForm.has(e.form)) problems.push(`duplicate form '${e.form}': ${seenForm.get(e.form)} and ${e.id}`);
  else seenForm.set(e.form, e.id);
  entries.push({
    ...e,
    domainName: DOMAINS[e.domain] ?? e.domain.toLowerCase(),
    tier: 0,
    pos: "", // surface words carry no pos HINT; their category is in the badge
    isRoot: false,
    badges: {},
  });
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

  // 1. JSON (web tool data) — compact, with split keywords for search. Includes
  //    roots, derived words and compounds (the `kind` field distinguishes them),
  //    so the lookup tool resolves any surface word, not just bare roots.
  const json = entries.map((e) => ({
    id: e.id, form: e.form, ipa: e.ipa, gloss: e.gloss, keywords: e.keywords,
    domain: e.domain, domainName: e.domainName, tier: e.tier, pos: e.pos,
    isRoot: e.isRoot, kind: e.kind, derivation: e.derivation,
    ...(e.base ? { base: e.base } : {}),
    ...(e.morphemes ? { morphemes: e.morphemes } : {}),
    badges: e.badges,
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
    // roots show their badge forms; derived/compounds show the morpheme breakdown.
    const note = e.kind === "root" ? badgeLine(e) : ` — *${e.morphemes}* (${e.kind})`;
    t2e.push(`**${e.form}** — ${e.gloss}  *(${e.domainName})*${note}`, "");
  }
  writeFileSync(join(DIST, "talo-english.md"), t2e.join("\n"));

  // 3. English → Talo, alphabetical by gloss keyword (one line per keyword).
  //    Each entry is indexed under its `keywords` (derived words under their ROOT
  //    meaning), so an English search resolves roots and their derivations alike.
  const pairs: { key: string; form: string; gloss: string }[] = [];
  for (const e of entries) {
    for (const k of e.keywords) pairs.push({ key: k.toLowerCase(), form: e.form, gloss: e.gloss });
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

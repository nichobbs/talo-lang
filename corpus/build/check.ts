#!/usr/bin/env -S node --experimental-strip-types
/**
 * Corpus gate. Validates every Talo clause in corpus/articles/*.md through the
 * parser, and enforces that the corpus uses ONLY real Talo — i.e. every content
 * root is either a lexicon entry (data/lexicon.tsv) or a declared proper noun
 * (corpus/proper-nouns.tsv). This is the fourth tool gate after the phonotactic
 * linter (legal words), the collision checker (distinct forms) and the parser
 * (legal sentences): this one keeps the running text honest.
 *
 *   node --experimental-strip-types build/check.ts
 *
 * Exit 0 only if every clause is structurally valid AND every content root is
 * known; 1 otherwise — so it composes in CI like the other tools. Concepts that
 * could not be expressed at all (and forced a paraphrase) are NOT detectable
 * here; those are tracked by hand in corpus/GAPS.md.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validate, analyze } from "../../tools/parser/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORPUS = join(__dirname, "..");
const ARTICLES = join(CORPUS, "articles");
const LEXICON = join(CORPUS, "..", "data", "lexicon.tsv");
const COMPOUNDS = join(CORPUS, "..", "data", "compounds.tsv");
const PROPER = join(CORPUS, "proper-nouns.tsv");

/**
 * Reserved grammatical roots that take a POS badge but are NOT lexicon entries,
 * so the analyzer reads them as content words: the copula `ya` (`yato`, 0002
 * §6.3). The existential/locative `kuna` (0005 §1) IS a lexicon entry. Kept here
 * so a copula clause isn't flagged as using an unknown word.
 */
const GRAMMATICAL_ROOTS = new Set(["ya"]);

/**
 * Load the legal forms from a lexicon TSV, VERBATIM. Forms are stored as bare
 * citation roots (e.g. `hito`, `gande`, `kota`), so we must NOT run them through
 * the analyzer — it would over-segment `hito` to `hi` (`-to` looks like a badge)
 * or `gande` to `gan` (`-de` looks like the place affix). We match a text token
 * by trying each of its candidate stems against this raw set instead.
 */
function loadLexiconRoots(path: string): Set<string> {
  const roots = new Set<string>();
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const fi = lines[0].split("\t").indexOf("form");
  if (fi === -1) throw new Error(`${path}: no 'form' column`);
  for (const line of lines.slice(1)) {
    const form = (line.split("\t")[fi] ?? "").trim().toLowerCase();
    if (form) roots.add(form);
  }
  return roots;
}

/**
 * Candidate stems for a content token, from the analyzer's root outward. The
 * analyzer peels the badge then every affix-shaped trailing syllable, which
 * over-segments monomorphemic roots — so we accept the token if ANY layer (the
 * bare root, or the root with affixes progressively re-added up to the full
 * badge-stripped stem) is a known form. This lets `gandepe`→{gan, gande} match
 * the root `gande`, while still letting a real derivation `ayalikika`→{ayali,
 * ayaliki} match its base `ayali`.
 */
function candidateStems(root: string, affixes: string[]): string[] {
  const out = [root];
  let s = root;
  for (const aff of affixes) {
    s += aff;
    out.push(s);
  }
  return out;
}

/** Load declared proper-noun roots (column 'root'); stored bare and lowercase. */
function loadProperRoots(path: string): Set<string> {
  const roots = new Set<string>();
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const ri = lines[0].split("\t").indexOf("root");
  if (ri === -1) throw new Error(`${path}: no 'root' column`);
  for (const line of lines.slice(1)) {
    const r = (line.split("\t")[ri] ?? "").trim().toLowerCase();
    if (r) roots.add(r);
  }
  return roots;
}

/** Pull validatable clauses out of ```talo fences (book convention). */
function clausesFrom(md: string): string[] {
  const out: string[] = [];
  const re = /```talo\s*\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    for (const raw of m[1].split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue; // blank or comment/gloss line
      // strip an inline gloss/translation after — · › or a 2+ space gap
      const clause = line.split(/\s+[—·›]\s+| {2,}/)[0].trim();
      if (clause && /[a-z]/.test(clause)) out.push(clause);
    }
  }
  return out;
}

function main(): void {
  const lexRoots = loadLexiconRoots(LEXICON);
  // Curated compounds (data/compounds.tsv) are whole surface forms (e.g.
  // `dobukebunka` zoo); the analyzer can't reduce them to a single root, so we
  // match the token verbatim against this set.
  const compoundForms = loadLexiconRoots(COMPOUNDS);
  const properRoots = loadProperRoots(PROPER);
  const files = readdirSync(ARTICLES).filter((f) => f.endsWith(".md")).sort();
  if (files.length === 0) {
    process.stderr.write("no articles found in corpus/articles/\n");
    process.exit(1);
  }

  const errors: string[] = [];
  const unknownRoots: string[] = [];
  let clauseCount = 0;

  for (const f of files) {
    const md = readFileSync(join(ARTICLES, f), "utf8");
    for (const clause of clausesFrom(md)) {
      clauseCount++;
      const r = validate(clause);
      if (!r.ok) {
        const codes = r.issues.filter((x) => x.severity === "error").map((x) => x.code).join(", ");
        errors.push(`[${f}] "${clause}" — ${codes}`);
      }
      // real-vocab check: every content word must reduce to a known form
      for (const tok of clause.split(/\s+/)) {
        if (compoundForms.has(tok.toLowerCase())) continue; // a curated compound surface form
        const a = analyze(tok);
        if (a.kind !== "content" || !a.root) continue;
        const known = candidateStems(a.root, a.affixes).some(
          (s) => lexRoots.has(s) || properRoots.has(s) || GRAMMATICAL_ROOTS.has(s),
        );
        if (!known) {
          unknownRoots.push(`[${f}] '${tok}' (root '${a.root}') is not in the lexicon or proper-nouns.tsv`);
        }
      }
    }
  }

  if (errors.length) {
    process.stderr.write(`\n✗ ${errors.length} clause(s) failed to validate:\n`);
    for (const e of errors) process.stderr.write(`  ${e}\n`);
  }
  if (unknownRoots.length) {
    process.stderr.write(`\n✗ ${unknownRoots.length} unknown content root(s) — typo, or an undeclared word:\n`);
    for (const u of unknownRoots) process.stderr.write(`  ${u}\n`);
  }
  if (errors.length || unknownRoots.length) process.exit(1);

  process.stdout.write(`✓ ${clauseCount} Talo clauses validated across ${files.length} article(s); all roots known\n`);
}

main();

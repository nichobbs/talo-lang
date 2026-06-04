/**
 * Cross-tool consistency: the parser's FUNCTION_WORDS and the checker's
 * collision protection must agree, so a closed-class grammatical word can never
 * be silently minted over.
 *
 * Every grammatical function word (role marker, particle, pronoun, coreference /
 * numeral / complementiser marker, coordinator …) must be **collision-protected**,
 * which happens one of two ways:
 *   - it is in the checker's RESERVED_FORMS (grammatical word with no data row —
 *     e.g. `na`, `ke`, `i`, `kai`, `ce`), OR
 *   - it is itself a lexicon form, so the homophone check guards it (e.g. the
 *     coordinator `o` "or" = FUN-009, the question words `sela`…).
 * If neither holds, a future root could collide with it — this test fails loudly.
 *
 * It is how a drift would be caught: add a new marker to FUNCTION_WORDS but forget
 * to reserve it (and it isn't a lexicon entry) → the first assertion fails.
 *
 * FUNCTION_WORDS.other is the lexicon-backed determiner/adverb class; its members
 * are expected to be lexicon forms, which this also checks.
 *
 * The one reserved word with no FUNCTION_WORDS entry is the copula root `ya`: it
 * takes a badge (`yato`), so it is reserved-only, not a bare function word.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { RESERVED_FORMS } from "../src/checker.ts";
import { FUNCTION_WORDS } from "../../parser/src/morphology.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEXICON = join(__dirname, "..", "..", "..", "data", "lexicon.tsv");

/** Surface forms attested in the root lexicon (col `form`). */
function lexiconForms(): Set<string> {
  const lines = readFileSync(LEXICON, "utf8").trim().split(/\r?\n/);
  const fi = lines[0].split("\t").indexOf("form");
  const out = new Set<string>();
  for (const line of lines.slice(1)) {
    const f = (line.split("\t")[fi] ?? "").trim().toLowerCase();
    if (f) out.add(f);
  }
  return out;
}

const ALL_FUNCTION_WORDS = Object.entries(FUNCTION_WORDS);
const GRAMMATICAL = ALL_FUNCTION_WORDS.filter(([n]) => n !== "other").flatMap(([, s]) => [...s]);
const RESERVED_ONLY = new Set(["ya"]); // copula root (0002 §6.3)

test("every grammatical function word is collision-protected (reserved OR lexicon form)", () => {
  const lex = lexiconForms();
  const unprotected = GRAMMATICAL.filter((w) => !RESERVED_FORMS.has(w) && !lex.has(w));
  assert.deepEqual(unprotected, [], `function words neither reserved nor in the lexicon: ${unprotected.join(", ")}`);
});

test("every RESERVED_FORM is a grammatical function word (or the copula `ya`)", () => {
  const known = new Set([...GRAMMATICAL, ...RESERVED_ONLY]);
  const stray = [...RESERVED_FORMS].filter((w) => !known.has(w));
  assert.deepEqual(stray, [], `reserved forms the parser doesn't know: ${stray.join(", ")}`);
});

test("every FUNCTION_WORDS.other member is a lexicon entry (no badge, but real word)", () => {
  const lex = lexiconForms();
  // demonstratives ini/itu are correlative-grid forms, not lexicon roots.
  const correlativeExceptions = new Set(["ini", "itu"]);
  const missing = [...FUNCTION_WORDS.other].filter((w) => !lex.has(w) && !correlativeExceptions.has(w));
  assert.deepEqual(missing, [], `parser 'other' words absent from the lexicon: ${missing.join(", ")}`);
});

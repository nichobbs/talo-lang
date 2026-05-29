/**
 * Tests for the Talo phonotactic linter.
 * Run: npm test   (node --experimental-strip-types --test test/linter.test.ts)
 *
 * Coverage is organised by the rules in docs/0001-phonology.md §5.3, plus the
 * worked examples table in §5.4 (used verbatim as a fixture below).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { lint, isLegal, type RuleCode } from "../src/linter.ts";

/** Assert a word is legal. */
function legal(word: string): void {
  const r = lint(word);
  assert.equal(
    r.legal,
    true,
    `expected '${word}' to be legal, got ${r.legal ? "" : (r as { violation: { rule: string; message: string } }).violation.rule + ": " + (r as { violation: { message: string } }).violation.message}`,
  );
}

/** Assert a word is illegal for a specific rule. */
function illegal(word: string, rule: RuleCode): void {
  const r = lint(word);
  assert.equal(r.legal, false, `expected '${word}' to be illegal (${rule})`);
  if (!r.legal) {
    assert.equal(
      r.violation.rule,
      rule,
      `'${word}': expected ${rule}, got ${r.violation.rule} — ${r.violation.message}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Legal words — the §5.4 fixture plus more shapes.
// ---------------------------------------------------------------------------
test("legal: §5.4 worked examples", () => {
  for (const w of [
    "talo",
    "tana",
    "tanta",
    "tan",
    "sanpa",
    "sanka",
    "eko",
    "ato",
    "a",
    "kaito",
    "wun",
    "cone",
  ]) {
    legal(w);
  }
});

test("legal: every consonant as an onset", () => {
  for (const c of ["p", "t", "k", "b", "d", "g", "c", "f", "s", "h", "m", "n", "l", "w", "y"]) {
    legal(c + "a");
  }
});

test("legal: every vowel as a bare one-syllable word", () => {
  for (const v of ["a", "e", "i", "o", "u"]) legal(v);
});

test("legal: vowel-initial words (onset optional, R3)", () => {
  for (const w of ["a", "e", "ato", "eko", "una", "ona"]) legal(w);
});

test("legal: coda 'n' before each permitted follower (R4) and word-final (R5)", () => {
  for (const c of ["p", "t", "k", "b", "d", "g", "c"]) {
    legal(`san${c}a`);
  }
  for (const w of ["tan", "wun", "san", "kanton"]) legal(w);
});

test("legal: unlike-vowel hiatus across syllables (R6)", () => {
  for (const w of ["kaito", "ai", "oa", "tao", "lua", "aute"]) legal(w);
});

test("legal: single medial consonant is always a fresh onset", () => {
  for (const w of ["tana", "talo", "kafe", "siwo", "haye"]) legal(w);
});

test("legal: multi-syllable derivation-shaped words stay legal", () => {
  for (const w of ["talofintan", "kantanpa", "ekonomi"]) legal(w);
});

// ---------------------------------------------------------------------------
// EMPTY
// ---------------------------------------------------------------------------
test("EMPTY: empty string", () => {
  illegal("", "EMPTY");
});

// ---------------------------------------------------------------------------
// R1 — Alphabet
// ---------------------------------------------------------------------------
test("R1: illegal letters j q r v x z", () => {
  for (const w of ["tar", "bjok", "qan", "vino", "xal", "zon"]) {
    illegal(w, "R1_ALPHABET");
  }
});

test("R1: 'r' gets the one-liquid hint", () => {
  const r = lint("tar");
  assert.equal(r.legal, false);
  if (!r.legal) {
    assert.match(r.violation.message, /one liquid, written `l`/);
    assert.equal(r.violation.index, 2);
  }
});

test("R1: uppercase, digits, spaces, punctuation rejected", () => {
  for (const w of ["Talo", "tal2", "ta lo", "ta-lo", "talo!"]) {
    illegal(w, "R1_ALPHABET");
  }
});

// ---------------------------------------------------------------------------
// R2 — Nucleus
// ---------------------------------------------------------------------------
test("R2: no vowel", () => {
  for (const w of ["pkt", "n", "s", "mn", "lk"]) illegal(w, "R2_NUCLEUS");
});

// ---------------------------------------------------------------------------
// R3 — Onset cluster
// ---------------------------------------------------------------------------
test("R3: word begins with a consonant cluster", () => {
  for (const w of ["npa", "pta", "kla", "swa", "nta"]) {
    illegal(w, "R3_ONSET_CLUSTER");
  }
});

// ---------------------------------------------------------------------------
// R4 — Medial juncture
// ---------------------------------------------------------------------------
test("R4: coda 'n' before a non-stop/affricate", () => {
  // n + fricative / nasal / liquid / glide / h
  for (const w of ["sanfa", "sansa", "sanha", "sanma", "sanna", "sanla", "sanwa", "sanya"]) {
    illegal(w, "R4_MEDIAL_CLUSTER");
  }
});

test("R4: medial two-consonant cluster whose first isn't 'n'", () => {
  for (const w of ["aspa", "atpa", "akta", "asta"]) {
    illegal(w, "R4_MEDIAL_CLUSTER");
  }
});

test("R4: three-or-more medial consonants", () => {
  for (const w of ["antpa", "ankta", "asppa"]) {
    illegal(w, "R4_MEDIAL_CLUSTER");
  }
});

test("R4: points at the offending second consonant for n+X", () => {
  const r = lint("sanfa"); // s a n f a -> 'nf' starts at index 2, follower 'f' at 3
  assert.equal(r.legal, false);
  if (!r.legal) assert.equal(r.violation.index, 3);
});

// ---------------------------------------------------------------------------
// R5 — Coda
// ---------------------------------------------------------------------------
test("R5: word ends in a consonant other than 'n'", () => {
  for (const w of ["tat", "tap", "tak", "tas", "tal", "tam"]) {
    illegal(w, "R5_CODA");
  }
});

test("R5: word ends in a consonant cluster", () => {
  for (const w of ["tant", "tank", "tanp"]) illegal(w, "R5_CODA");
});

// ---------------------------------------------------------------------------
// R6 — Doubled vowels
// ---------------------------------------------------------------------------
test("R6: identical adjacent vowels", () => {
  for (const w of ["taa", "aa", "tee", "kii", "boo", "fuu"]) {
    illegal(w, "R6_DOUBLED_VOWEL");
  }
});

test("R6: doubled vowel inside a longer vowel run", () => {
  illegal("taae", "R6_DOUBLED_VOWEL"); // 'aa' before legal 'e'
});

// ---------------------------------------------------------------------------
// Rule-ordering: the FIRST violation is reported.
// ---------------------------------------------------------------------------
test("ordering: R1 reported before later rules", () => {
  // 'r' (R1) appears, and the word also has no... still R1 wins as earliest.
  illegal("rpt", "R1_ALPHABET");
});

test("ordering: R2 (no vowel) reported before structural checks", () => {
  // all-legal-letters, no vowel, also a leading cluster — R2 is checked first.
  illegal("npk", "R2_NUCLEUS");
});

// ---------------------------------------------------------------------------
// isLegal convenience wrapper
// ---------------------------------------------------------------------------
test("isLegal mirrors lint().legal", () => {
  assert.equal(isLegal("talo"), true);
  assert.equal(isLegal("tar"), false);
  assert.equal(isLegal(""), false);
});

// ---------------------------------------------------------------------------
// Result shape contract
// ---------------------------------------------------------------------------
test("result carries the original word back", () => {
  assert.equal(lint("talo").word, "talo");
  const bad = lint("tar");
  assert.equal(bad.word, "tar");
});

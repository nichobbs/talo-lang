/**
 * Talo phonotactic linter — core.
 *
 * Implements, exactly, rules R1–R6 of docs/0001-phonology.md §5.3. This module
 * is the single source of truth for "is this a legal Talo word." It is the gate
 * every candidate lexicon entry (Phase 3) must pass.
 *
 * It is deliberately self-contained (no dependencies) and reports the FIRST
 * rule violated, with the offending position, so failures are explainable to a
 * novice ("rule R5: a word may only end in `n`").
 *
 * Scope note: this checks PHONOTACTIC legality only. It intentionally does NOT
 * check near-homophone collisions (b/p, d/t, g/k — §2.1) or cross-language
 * obscenities; those are the separate collision checker's job (§4/§8). A word
 * passing this linter is necessary, not sufficient, for lexicon admission.
 *
 * Stress is non-contrastive and unmarked (§6), so it is neither read nor
 * checked here.
 */

/** The five vowel graphemes (§1). */
export const VOWELS: ReadonlySet<string> = new Set(["a", "e", "i", "o", "u"]);

/** The fifteen consonant graphemes (§2). */
export const CONSONANTS: ReadonlySet<string> = new Set([
  "p", "t", "k", "b", "d", "g", // stops
  "c", // affricate /tʃ/
  "f", "s", "h", // fricatives
  "m", "n", // nasals
  "l", // liquid
  "w", "y", // glides
]);

/**
 * Consonants a coda `n` may legally precede (§2/R4): the stops and the
 * affricate. This is the only consonant cluster Talo permits.
 */
export const CODA_FOLLOWERS: ReadonlySet<string> = new Set([
  "p", "t", "k", "b", "d", "g", "c",
]);

/** Every legal grapheme (the 20-letter alphabet, §4). */
export const ALPHABET: ReadonlySet<string> = new Set([
  ...VOWELS,
  ...CONSONANTS,
]);

/** Machine-readable identifiers for each phonotactic rule (docs §5.3). */
export type RuleCode =
  | "R1_ALPHABET"
  | "R2_NUCLEUS"
  | "R3_ONSET_CLUSTER"
  | "R4_MEDIAL_CLUSTER"
  | "R5_CODA"
  | "R6_DOUBLED_VOWEL"
  | "EMPTY";

export interface Violation {
  /** Which rule failed. */
  rule: RuleCode;
  /** Human-readable, novice-facing explanation. */
  message: string;
  /**
   * Zero-based index into the (trimmed) candidate where the problem is, or null
   * for whole-word problems (empty / no vowel).
   */
  index: number | null;
}

export type LintResult =
  | { legal: true; word: string }
  | { legal: false; word: string; violation: Violation };

const isVowel = (ch: string): boolean => VOWELS.has(ch);
const isConsonant = (ch: string): boolean => CONSONANTS.has(ch);

/**
 * Validate a candidate word against Talo phonotactics (R1–R6).
 *
 * The check is performed left-to-right and returns as soon as the first rule is
 * violated, so the reported rule is the earliest problem in the word.
 *
 * @param candidate the word to test, as written (canonical Talo is lowercase).
 */
export function lint(candidate: string): LintResult {
  const word = candidate;

  // EMPTY: nothing to validate.
  if (word.length === 0) {
    return {
      legal: false,
      word,
      violation: {
        rule: "EMPTY",
        message: "Empty input: a Talo word must contain at least one syllable.",
        index: null,
      },
    };
  }

  // R1 — Alphabet. Every character must be a legal grapheme.
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (!ALPHABET.has(ch)) {
      const illegalLiquidHint =
        ch === "r"
          ? " (Talo has one liquid, written `l`; the letter `r` is not used)"
          : "";
      return {
        legal: false,
        word,
        violation: {
          rule: "R1_ALPHABET",
          message: `R1: '${ch}' is not a Talo letter. The alphabet is a b c d e f g h i k l m n o p s t u w y${illegalLiquidHint}.`,
          index: i,
        },
      };
    }
  }

  // R2 — Nucleus. The word must contain at least one vowel.
  let hasVowel = false;
  for (const ch of word) {
    if (isVowel(ch)) {
      hasVowel = true;
      break;
    }
  }
  if (!hasVowel) {
    return {
      legal: false,
      word,
      violation: {
        rule: "R2_NUCLEUS",
        message: "R2: a word must contain at least one vowel (a syllable needs a nucleus).",
        index: null,
      },
    };
  }

  // Segment the word into alternating consonant-runs and vowel-runs, then apply
  // the positional rules R3 (leading), R4 (medial), R5 (trailing), R6 (vowels).
  //
  // A "run" is a maximal stretch of same-class (consonant or vowel) characters.
  // Because the alphabet is partitioned cleanly into V and C, this segmentation
  // is unambiguous.
  type Run = { kind: "V" | "C"; text: string; start: number };
  const runs: Run[] = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const kind: "V" | "C" = isVowel(ch) ? "V" : "C";
    const last = runs[runs.length - 1];
    if (last && last.kind === kind) {
      last.text += ch;
    } else {
      runs.push({ kind, text: ch, start: i });
    }
  }

  for (let r = 0; r < runs.length; r++) {
    const run = runs[r];

    if (run.kind === "V") {
      // R6 — No doubled vowels: no two identical vowels adjacent.
      for (let j = 1; j < run.text.length; j++) {
        if (run.text[j] === run.text[j - 1]) {
          return {
            legal: false,
            word,
            violation: {
              rule: "R6_DOUBLED_VOWEL",
              message: `R6: doubled vowel '${run.text[j]}${run.text[j]}'. Talo has no length, so identical vowels may not be adjacent (unlike vowels such as 'ai' are fine).`,
              index: run.start + j,
            },
          };
        }
      }
      continue;
    }

    // run.kind === "C"
    const isLeading = r === 0;
    const isTrailing = r === runs.length - 1;
    const len = run.text.length;

    if (isLeading) {
      // R3 — Onset cluster: a word may begin with at most one consonant.
      if (len > 1) {
        return {
          legal: false,
          word,
          violation: {
            rule: "R3_ONSET_CLUSTER",
            message: `R3: '${run.text}' — a word may not begin with a consonant cluster (at most one onset consonant).`,
            index: run.start,
          },
        };
      }
      continue;
    }

    if (isTrailing) {
      // R5 — Coda: a word may end in at most one consonant, and only `n`.
      if (len > 1) {
        return {
          legal: false,
          word,
          violation: {
            rule: "R5_CODA",
            message: `R5: '${run.text}' — a word may not end in a consonant cluster; the only legal coda is a single 'n'.`,
            index: run.start,
          },
        };
      }
      if (run.text !== "n") {
        return {
          legal: false,
          word,
          violation: {
            rule: "R5_CODA",
            message: `R5: a word may not end in '${run.text}'. The only consonant that may close a word is 'n'.`,
            index: run.start,
          },
        };
      }
      continue;
    }

    // Medial consonant run (between two vowels). R4.
    if (len === 1) {
      // A single consonant is the onset of the following syllable — always fine.
      continue;
    }
    if (len === 2) {
      const [first, second] = [run.text[0], run.text[1]];
      // The only legal two-consonant juncture is coda `n` + stop/affricate.
      if (first !== "n") {
        return {
          legal: false,
          word,
          violation: {
            rule: "R4_MEDIAL_CLUSTER",
            message: `R4: '${run.text}' — the only consonant cluster Talo allows is 'n' followed by a stop or affricate (p t k b d g c). '${first}' may not stand in a coda.`,
            index: run.start,
          },
        };
      }
      if (!CODA_FOLLOWERS.has(second)) {
        return {
          legal: false,
          word,
          violation: {
            rule: "R4_MEDIAL_CLUSTER",
            message: `R4: coda 'n' may only precede a stop or affricate (p t k b d g c), not '${second}'.`,
            index: run.start + 1,
          },
        };
      }
      continue;
    }
    // len >= 3: never legal.
    return {
      legal: false,
      word,
      violation: {
        rule: "R4_MEDIAL_CLUSTER",
        message: `R4: '${run.text}' — too many consonants together. The only cluster Talo allows is 'n' + a single stop/affricate.`,
        index: run.start,
      },
    };
  }

  return { legal: true, word };
}

/** Convenience boolean wrapper. */
export function isLegal(candidate: string): boolean {
  return lint(candidate).legal;
}

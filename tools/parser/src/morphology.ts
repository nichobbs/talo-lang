/**
 * Talo morphology — word-level analysis.
 *
 * Implements the word template of docs/0002 §2.2:
 *
 *     content-word = ROOT (+ DERIV-AFFIX)* + BADGE
 *
 * Given a single token, this module decides what kind of word it is and, for a
 * content word, peels off its POS badge (§1) and any derivational affixes (§3.2)
 * so the validator can reason about category and structure. It is the parser's
 * equivalent of the linter's "is this a legal word" — but where the linter asks
 * *phonotactic* legality, this asks *morphological* shape.
 *
 * Zero dependencies (Node ≥ 22.6, run with --experimental-strip-types), matching
 * the other tools/.
 *
 * Scope: this does NOT re-check phonotactics (that's the linter) or whether a
 * root is a real lexicon entry (that's an optional lexicon-aware pass in the
 * validator). It classifies by *shape* and by the closed-class function-word
 * list, which is all the structural rules (§7) need.
 */

/** The three POS badges (0002 §1). Always word-final. */
export const BADGES = {
  ka: "noun",
  to: "verb",
  pe: "modifier",
} as const;

export type Category = (typeof BADGES)[keyof typeof BADGES];

/**
 * Derivational affixes (0002 §3.2), each a bound CV with a stop/affricate onset.
 * Listed so the analyzer can segment ROOT(+AFFIX)*+BADGE and so a future
 * derivation explorer can share the table.
 */
export const DERIV_AFFIXES: Readonly<Record<string, string>> = {
  ki: "agent",
  tu: "instrument",
  bo: "patient/result",
  de: "place",
  pa: "quality",
  ci: "diminutive",
  go: "augmentative",
  ku: "opposite",
  ta: "causative",
  pi: "inchoative",
};

/**
 * The closed class of function words (0002 §6, Appendix B) — words that take NO
 * badge and that the parser knows by listing. Grouped by role so the validator
 * can ask "is this an aspect particle?" etc.
 */
export const FUNCTION_WORDS = {
  /** role markers, postposed (§4) */
  roleMarkers: new Set(["na", "lo", "su", "fe", "wa", "we"]),
  /** aspect particles, post-verb (§5.1) */
  aspect: new Set(["li", "wi"]),
  /** plural (§5.2) + clusivity (§5.3) — post-noun / post-pronoun */
  number: new Set(["pu", "sa", "fo"]),
  /** pronouns (§6.1) */
  pronouns: new Set(["mi", "yu", "te"]),
  /** negator (§6.2) */
  negator: new Set(["ne"]),
  /** question particle, clause-final (§6.4) */
  question: new Set(["ke"]),
  /** coordinator (§6.5) */
  conjunction: new Set(["i", "o"]),
  /**
   * Other closed-class words that are lexicon entries but take no badge:
   * demonstratives, numerals, quantifiers (the postposed determiner class of
   * 0005 §3), plus high-frequency function words (yes/no, very, also, only,
   * if/but/because, …). These are recognised so the validator doesn't mistake
   * them for unbadged content. The full correlatives grid (§6.7) is matched
   * separately by pattern.
   */
  other: new Set([
    "ini", "itu",                 // demonstratives (§6.6)
    // numerals (0003 §5) — closed-class determiners, postposed (0005 §3)
    "so", "ta", "ki", "mo", "fu", "le", "pikae", "haba", "cewa", "huba",
    "diko", "samu", "sebu", "milion",
    // quantifiers (0005 §3 determiner class)
    "ote", "ingi", "kidogo", "badi", "hakuna", "lebi", "sukuna",
    "kila", "cuku", "setenga",
    "hi", "no",                   // yes / no answer
    "sana", "ti", "dake",         // very / also / only
    "ma", "fi",                   // but / if
    "lagia", "mungi",             // again / maybe
    "sababu", "sehinga", "walau", // because / so / although
    "leo", "keso", "yana", "inino", // today/tomorrow/yesterday/now (time-words)
  ]),
} as const;

/** Stems and category suffixes of the correlatives grid (0002 §6.7). */
const CORR_STEMS = ["se", "ini", "itu", "ba", "ha", "o"];
const CORR_CATS = ["la", "ko", "lo", "no", "fu", "wa", "mu"];
const CORRELATIVES: ReadonlySet<string> = new Set(
  CORR_STEMS.flatMap((s) => CORR_CATS.map((c) => s + c)),
);

export type WordKind = "content" | "function" | "correlative" | "unknown";

export interface WordAnalysis {
  /** the token as given */
  token: string;
  kind: WordKind;
  /** for content words: the POS the badge assigns */
  category: Category | null;
  /** for content words: the bare root (badge + any deriv affixes removed) */
  root: string | null;
  /** for content words: derivational affixes found, root→outward */
  affixes: string[];
  /** for function words: which group it belongs to (e.g. "roleMarker") */
  functionRole: string | null;
}

/** Is this token in any function-word set? Returns the role name or null. */
function functionRoleOf(token: string): string | null {
  if (FUNCTION_WORDS.roleMarkers.has(token)) return "roleMarker";
  if (FUNCTION_WORDS.aspect.has(token)) return "aspect";
  if (FUNCTION_WORDS.number.has(token)) return "number";
  if (FUNCTION_WORDS.pronouns.has(token)) return "pronoun";
  if (FUNCTION_WORDS.negator.has(token)) return "negator";
  if (FUNCTION_WORDS.question.has(token)) return "question";
  if (FUNCTION_WORDS.conjunction.has(token)) return "conjunction";
  if (FUNCTION_WORDS.other.has(token)) return "other";
  return null;
}

/**
 * Analyse one token into its morphological shape.
 *
 * Order of decision (mirrors how the parser locates category, §1):
 *  1. closed-class function word?  → kind "function"
 *  2. correlative grid form?       → kind "correlative" (function-like)
 *  3. ends in a badge -ka/-to/-pe? → kind "content", peel badge + affixes
 *  4. otherwise                    → kind "unknown" (likely a missing badge)
 */
export function analyze(token: string): WordAnalysis {
  const t = token.toLowerCase();
  const base: WordAnalysis = {
    token,
    kind: "unknown",
    category: null,
    root: null,
    affixes: [],
    functionRole: null,
  };

  const role = functionRoleOf(t);
  if (role) return { ...base, kind: "function", functionRole: role };

  if (CORRELATIVES.has(t)) return { ...base, kind: "correlative" };

  // Content word: must end in a two-letter badge.
  const badgeForm = t.slice(-2);
  const category = (BADGES as Record<string, Category>)[badgeForm];
  if (category) {
    let stem = t.slice(0, -2);
    const affixes: string[] = [];
    // Peel derivational affixes from the badge inward (outermost applied last),
    // greedily, while a 2-letter chunk is a known affix AND something remains.
    while (stem.length > 2) {
      const chunk = stem.slice(-2);
      if (DERIV_AFFIXES[chunk]) {
        affixes.unshift(chunk);
        stem = stem.slice(0, -2);
      } else break;
    }
    return {
      ...base,
      kind: "content",
      category,
      root: stem,
      affixes,
    };
  }

  return base;
}

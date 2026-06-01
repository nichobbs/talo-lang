/**
 * Talo sentence validator — structural well-formedness.
 *
 * Checks a clause against the locked syntax of docs/0002 (§3.5, §4, §5, §6, §7):
 *
 *   S1  every content word carries exactly one POS badge (§1) — no bare roots
 *   S2  the clause contains at least one verb, located by its -to badge (§3.5)
 *   S3  subject-first: a subject (noun/pronoun/correlative) precedes the verb
 *       (§3.5 — subject placement is enforced; verb placement is otherwise fluid)
 *   S4  role markers are POSTPOSED: each na/lo/su/fe/wa/we follows a nominal (§4)
 *   S5  aspect particles li/wi sit immediately AFTER a verb (§5.1)
 *   S6  the yes/no particle ke, if present, is clause-final (§6.4)
 *   S7  a modifier (-pe) precedes a head noun; a determiner (ini/itu/numeral/
 *       quantifier) FOLLOWS its head (0005 §3) — "describe before, determine after"
 *
 * These are warnings/errors a teaching tool and a regression harness both want.
 * The validator is deliberately conservative: it flags constructions the grammar
 * forbids, and stays quiet on anything the grammar permits (word order is fluid
 * by design, so most orderings are legal). It reports ALL problems found, each
 * with a novice-facing message, rather than stopping at the first.
 *
 * Phonotactic legality is NOT re-checked here (that's the linter); this is purely
 * morphosyntactic. An optional lexicon set lets it additionally flag a content
 * root that is not an attested lexicon entry (a "soft" warning, off by default).
 */

import { analyze, type WordAnalysis, type Category } from "./morphology.ts";

export type Severity = "error" | "warning";

export interface Issue {
  severity: Severity;
  /** stable code, e.g. "S1_BARE_ROOT", for tests and tooling */
  code: string;
  message: string;
  /** zero-based token index the issue concerns, or null for whole-clause */
  index: number | null;
}

export interface ValidateResult {
  ok: boolean;
  clause: string;
  tokens: WordAnalysis[];
  issues: Issue[];
}

export interface ValidateOptions {
  /**
   * If provided, content roots not in this set raise a "warning" (unknown root).
   * Pass the lexicon's root inventory to turn the validator into a vocabulary
   * checker as well. Omit to validate structure only.
   */
  knownRoots?: ReadonlySet<string>;
}

const isNominalKind = (a: WordAnalysis): boolean =>
  (a.kind === "content" && a.category === "noun") ||
  a.kind === "correlative" ||
  (a.kind === "function" &&
    (a.functionRole === "pronoun" || a.functionRole === "other"));

/** Tokenise a clause on whitespace, dropping surrounding punctuation. */
export function tokenize(clause: string): string[] {
  return clause
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[^a-z]+|[^a-z]+$/gi, ""))
    .filter((w) => w.length > 0);
}

export function validate(clause: string, opts: ValidateOptions = {}): ValidateResult {
  const rawTokens = tokenize(clause);
  const tokens = rawTokens.map(analyze);
  const issues: Issue[] = [];

  if (tokens.length === 0) {
    return {
      ok: false,
      clause,
      tokens,
      issues: [{ severity: "error", code: "EMPTY", message: "Empty clause.", index: null }],
    };
  }

  // S1 — no bare content roots: an "unknown" token is one that is neither a
  // function/correlative word nor a badged content word, i.e. almost always a
  // root that forgot its badge (§1).
  tokens.forEach((a, i) => {
    if (a.kind === "unknown") {
      issues.push({
        severity: "error",
        code: "S1_BARE_ROOT",
        message: `'${a.token}' has no POS badge and is not a known function word — every content word must end in -ka (noun), -to (verb) or -pe (modifier) (0002 §1).`,
        index: i,
      });
    }
  });

  // S2 — at least one verb, located by -to (§3.5). A verbless string is often a
  // valid fragment (greeting, phrase, one-word answer — 0004 §8.5), so this is a
  // warning, not an error: it flags "this is not a full clause" without rejecting.
  const verbIdx = tokens.flatMap((a, i) => (a.category === "verb" ? [i] : []));
  if (verbIdx.length === 0) {
    issues.push({
      severity: "warning",
      code: "S2_NO_VERB",
      message: "No verb (-to badge) — this is a fragment or phrase, not a full clause. (A predicative clause uses the copula yato; 0002 §3.5/§6.3.)",
      index: null,
    });
  }

  // S3 — subject-first: some nominal must precede the first verb (§3.5).
  if (verbIdx.length > 0) {
    const firstVerb = verbIdx[0];
    const hasSubjectBefore = tokens.slice(0, firstVerb).some(isNominalKind);
    if (!hasSubjectBefore) {
      issues.push({
        severity: "error",
        code: "S3_SUBJECT_FIRST",
        message: "Subject-first is enforced: a subject (noun, pronoun or correlative) must come before the verb (0002 §3.5).",
        index: firstVerb,
      });
    }
  }

  // S4 — role markers are postposed: each must follow a nominal (§4).
  tokens.forEach((a, i) => {
    if (a.kind === "function" && a.functionRole === "roleMarker") {
      const prev = tokens[i - 1];
      const follows = prev && (isNominalKind(prev) || prev.category === "noun");
      if (!follows) {
        issues.push({
          severity: "error",
          code: "S4_ROLE_MARKER_POSTPOSED",
          message: `Role marker '${a.token}' must directly follow the noun phrase it marks (postpositions, 0002 §4).`,
          index: i,
        });
      }
    }
  });

  // S5 — aspect particles immediately after a verb (§5.1).
  tokens.forEach((a, i) => {
    if (a.kind === "function" && a.functionRole === "aspect") {
      const prev = tokens[i - 1];
      if (!prev || prev.category !== "verb") {
        issues.push({
          severity: "error",
          code: "S5_ASPECT_POSTVERB",
          message: `Aspect particle '${a.token}' must come immediately after a verb (0002 §5.1).`,
          index: i,
        });
      }
    }
  });

  // S6 — ke is clause-final (§6.4).
  tokens.forEach((a, i) => {
    if (a.kind === "function" && a.functionRole === "question" && i !== tokens.length - 1) {
      issues.push({
        severity: "error",
        code: "S6_KE_FINAL",
        message: "The yes/no particle 'ke' must be the last word of the clause (0002 §6.4).",
        index: i,
      });
    }
  });

  // S7 — a -pe modifier must have a head noun AFTER it (modifier-before-head,
  // §6.3). A trailing -pe with nothing nominal following is only valid as a
  // predicate after the copula; we flag a dangling attributive modifier softly.
  tokens.forEach((a, i) => {
    if (a.category === "modifier") {
      const afterHasNoun = tokens.slice(i + 1).some((b) => b.category === "noun" || isNominalKind(b));
      const prevIsCopula =
        tokens.slice(0, i).some((b) => b.category === "verb" && b.root === "ya");
      if (!afterHasNoun && !prevIsCopula) {
        issues.push({
          severity: "warning",
          code: "S7_MODIFIER_BEFORE_HEAD",
          message: `Modifier '${a.token}' normally precedes its head noun (0002 §6.3); here nothing nominal follows it. (Fine if it is a predicate after the copula yato.)`,
          index: i,
        });
      }
    }
  });

  // Optional: unknown-root vocabulary check.
  if (opts.knownRoots) {
    tokens.forEach((a, i) => {
      if (a.kind === "content" && a.root && !opts.knownRoots!.has(a.root)) {
        issues.push({
          severity: "warning",
          code: "LEX_UNKNOWN_ROOT",
          message: `Root '${a.root}' (in '${a.token}') is not in the supplied lexicon.`,
          index: i,
        });
      }
    });
  }

  const ok = !issues.some((x) => x.severity === "error");
  return { ok, clause, tokens, issues };
}

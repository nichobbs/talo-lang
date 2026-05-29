/**
 * Talo collision checker — core.
 *
 * The SECOND lexicon gate (docs/0000 §4; docs/0001 §2.1 & §8). A candidate Talo
 * form is admissible only if it is BOTH:
 *   1. phonotactically legal  (delegated to the phonotactic linter, R1–R6); and
 *   2. collision-free, meaning it does not
 *      (a) duplicate an existing form           — HOMOPHONE
 *      (b) collide with a grammatical word       — RESERVED
 *      (c) merge with another form under the weak stop contrast — NEAR_HOMOPHONE
 *      (d) hit the cross-language obscenity screen — OBSCENITY
 *
 * The phonotactic linter is NECESSARY but NOT SUFFICIENT (it says so itself);
 * this module adds the sufficiency conditions §4/§8 require.
 *
 * Near-homophones (condition c) implement docs/0001 §2.1: the stop contrast
 * b/p, d/t, g/k is the weakest in the inventory and may not distinguish meaning
 * by itself, so two forms that are identical once that contrast is collapsed are
 * treated as the same word.
 */
import { lint } from "../../phonotactic-linter/src/index.ts";

/**
 * The weak stop contrast (docs/0001 §2.1): voiced→voiceless representative.
 * Collapsing these is what defines a near-homophone.
 */
const WEAK_CONTRAST: Readonly<Record<string, string>> = { b: "p", d: "t", g: "k" };

/**
 * Reduce a form to its merge-skeleton: lowercase, with the weak stop contrast
 * neutralised. Two forms are near-homophones iff they share a skeleton.
 *   skeleton("bata") === skeleton("pada") === "pata"
 */
export function skeleton(form: string): string {
  let out = "";
  for (const ch of form.toLowerCase()) out += WEAK_CONTRAST[ch] ?? ch;
  return out;
}

/**
 * Grammatical free words fixed in docs/0002. A content root surfaces only with
 * a POS badge, never bare, but we still reserve these so no root's bare form (or
 * its skeleton) clashes with a high-frequency function word.
 */
export const RESERVED_FORMS: ReadonlySet<string> = new Set([
  // role markers (0002 §4)
  "na", "lo", "su", "fe", "wa", "we",
  // aspect (§5.1), plural (§5.2), clusivity (§5.3)
  "li", "wi", "pu", "sa", "fo",
  // pronouns (§6.1), negator (§6.2), copula root (§6.3), question (§6.4), and (§6.5)
  "mi", "yu", "te", "ne", "ya", "ke", "i",
]);

export type Conflict =
  | { kind: "PHONOTACTIC"; message: string }
  | { kind: "OBSCENITY"; match: string; message: string }
  | { kind: "RESERVED"; with: string; message: string }
  | { kind: "HOMOPHONE"; with: string; label?: string; message: string }
  | { kind: "NEAR_HOMOPHONE"; with: string; label?: string; skeleton: string; message: string };

export type CheckResult =
  | { form: string; ok: true }
  | { form: string; ok: false; conflict: Conflict };

/** An already-claimed form (a prior lexicon entry or a reserved grammatical word). */
export interface Occupied {
  form: string;
  /** Concept id / gloss, or "reserved" for grammatical words. */
  label: string;
}

/**
 * Does `form` hit the obscenity blocklist? Exact matches always count; longer
 * blocked substrings (≥4 chars) also count, to catch embeddings — but short
 * entries match only as whole words, so e.g. "kut" does not flag "kuto" (knife).
 * The screen FLAGS for human review; it is conservative by design.
 */
function obscenityHit(form: string, blocklist: readonly string[]): string | null {
  const low = form.toLowerCase();
  for (const raw of blocklist) {
    const bad = raw.trim().toLowerCase();
    if (!bad) continue;
    if (low === bad) return bad;
    if (bad.length >= 4 && low.includes(bad)) return bad;
  }
  return null;
}

/**
 * Check one form against the set of already-occupied forms and the blocklist.
 * Returns the FIRST conflict found, in priority order
 * (phonotactic → obscenity → exact clash → near-homophone), or ok.
 */
export function checkForm(
  form: string,
  occupied: Iterable<Occupied>,
  blocklist: readonly string[] = [],
): CheckResult {
  // 1. Phonotactic legality (R1–R6), delegated.
  const lintRes = lint(form);
  if (!lintRes.legal) {
    return { form, ok: false, conflict: { kind: "PHONOTACTIC", message: lintRes.violation.message } };
  }

  // 2. Obscenity screen.
  const hit = obscenityHit(form, blocklist);
  if (hit !== null) {
    return {
      form,
      ok: false,
      conflict: {
        kind: "OBSCENITY",
        match: hit,
        message: `flagged by the cross-language obscenity screen (matches '${hit}') — needs human review`,
      },
    };
  }

  const occ = [...occupied];

  // 3a. Exact clash (homophone / reserved word).
  for (const o of occ) {
    if (o.form === form) {
      if (o.label === "reserved") {
        return { form, ok: false, conflict: { kind: "RESERVED", with: o.form, message: `identical to the reserved grammatical word '${o.form}' (docs/0002)` } };
      }
      return { form, ok: false, conflict: { kind: "HOMOPHONE", with: o.form, label: o.label, message: `identical to existing form '${o.form}' (${o.label})` } };
    }
  }

  // 3b. Near-homophone (weak stop contrast collapsed) — docs/0001 §2.1.
  const sk = skeleton(form);
  for (const o of occ) {
    if (skeleton(o.form) === sk) {
      return {
        form,
        ok: false,
        conflict: {
          kind: "NEAR_HOMOPHONE",
          with: o.form,
          label: o.label === "reserved" ? undefined : o.label,
          skeleton: sk,
          message: `near-homophone of '${o.form}'${o.label === "reserved" ? " (reserved grammatical word)" : ` (${o.label})`}: the two differ only by the weak stop contrast b/p · d/t · g/k (docs/0001 §2.1)`,
        },
      };
    }
  }

  return { form, ok: true };
}

export interface BatchOptions {
  reserved?: ReadonlySet<string>;
  blocklist?: readonly string[];
}

/** A candidate to validate, optionally labelled (e.g. by concept id). */
export interface Candidate {
  form: string;
  label?: string;
}

/**
 * Validate a whole set of candidates: each is checked against the reserved
 * words AND every earlier candidate, so internal collisions are caught. The
 * first occurrence of a colliding skeleton wins; later ones are reported.
 */
export function checkBatch(
  candidates: ReadonlyArray<string | Candidate>,
  { reserved = RESERVED_FORMS, blocklist = [] }: BatchOptions = {},
): CheckResult[] {
  const occupied: Occupied[] = [...reserved].map((form) => ({ form, label: "reserved" }));
  const results: CheckResult[] = [];
  for (const c of candidates) {
    const form = typeof c === "string" ? c : c.form;
    const label = typeof c === "string" ? form : c.label ?? form;
    const res = checkForm(form, occupied, blocklist);
    results.push(res);
    if (res.ok) occupied.push({ form, label });
  }
  return results;
}

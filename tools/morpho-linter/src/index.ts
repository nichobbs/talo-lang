/**
 * Talo morphological linter — validates word-INTERNAL structure.
 *
 * The phonotactic linter (tools/phonotactic-linter) asks "is this whole word a
 * legal Talo string?"; this asks the complementary question docs/0002 §3.1/§3.2
 * leaves to tooling: "do the morphemes join LEGALLY, and does the buffer-vowel
 * rule fire exactly where it must?". It is the executable form of the compounding
 * seam rule.
 *
 * The word template (0002 §2.2) is  ROOT (+ ROOT)* (+ AFFIX)* + BADGE , written in
 * the data as a `morphemes` column joined by `+` (e.g. `pani+kama+ka` bathroom,
 * `ta+pe` first, `kelua+ta+to` evacuate). Given that decomposition this module:
 *   - checks every piece is a non-empty Talo-letter string and the last is a badge;
 *   - JOINS the pieces applying the §3.1 buffer rule — insert `a` only at an
 *     `n`-final piece meeting a non-stop onset, the single seam that would be
 *     illegal — and returns the surface form it should produce;
 *   - confirms that form is phonotactically legal (delegating R1–R6 to the linter).
 *
 * `checkRow(form, morphemes)` additionally asserts the claimed surface `form`
 * equals the reconstruction — so the data gate catches any compound/derived row
 * whose `form` and `morphemes` disagree (a buffer slip or a hand-edit).
 *
 * Zero dependencies (Node ≥ 22.6, --experimental-strip-types), like the other tools.
 */
import { lint } from "../../phonotactic-linter/src/index.ts";

/** The three POS badges (0002 §1); a well-formed word ends in one. */
export const BADGES: ReadonlySet<string> = new Set(["ka", "to", "pe"]);

const STOPS = new Set([..."ptkbdgc"]); // stops + affricate `c` (0001 §2)
const VOWELS = new Set([..."aeiou"]);

export type MorphCode =
  | "EMPTY"
  | "EMPTY_PIECE"
  | "NON_TALO"
  | "NO_BADGE"
  | "ILLEGAL_FORM"
  | "FORM_MISMATCH";

export interface MorphIssue {
  code: MorphCode;
  message: string;
}

export interface MorphResult {
  ok: boolean;
  /** the surface form the pieces should produce (buffer applied) */
  form: string;
  issues: MorphIssue[];
}

/**
 * Join morpheme pieces into a surface form, applying the §3.1 buffer rule: an
 * `a` is inserted only when an `n`-final piece meets a non-stop, non-vowel onset
 * (the one seam Talo phonotactics would otherwise reject). This is the single
 * source of truth the generator (scripts/derive-compounds.mjs) should mirror.
 */
export function joinWithBuffer(pieces: readonly string[]): string {
  let out = pieces[0] ?? "";
  for (let i = 1; i < pieces.length; i++) {
    const next = pieces[i];
    if (!next) continue;
    const last = out[out.length - 1];
    const head = next[0];
    if (last === "n" && !VOWELS.has(head) && !STOPS.has(head)) out += "a"; // buffer
    out += next;
  }
  return out;
}

/** Lint a `+`-joined morpheme decomposition on its own. */
export function lintMorphemes(morphemes: string): MorphResult {
  const issues: MorphIssue[] = [];
  const pieces = morphemes.trim().toLowerCase().split("+");
  if (pieces.length < 2) {
    issues.push({ code: "EMPTY", message: `'${morphemes}' has no '+': a word is at least ROOT+BADGE.` });
    return { ok: false, form: "", issues };
  }
  for (const p of pieces) {
    if (!p) issues.push({ code: "EMPTY_PIECE", message: `empty morpheme in '${morphemes}'.` });
    else if (!/^[aeiouptkbdgcfshmnlwy]+$/.test(p))
      issues.push({ code: "NON_TALO", message: `morpheme '${p}' has a non-Talo letter.` });
  }
  const badge = pieces[pieces.length - 1];
  if (!BADGES.has(badge))
    issues.push({ code: "NO_BADGE", message: `last morpheme '${badge}' is not a badge (-ka/-to/-pe).` });

  const form = joinWithBuffer(pieces);
  const lr = lint(form);
  if (!lr.legal)
    issues.push({ code: "ILLEGAL_FORM", message: `the joined form '${form}' is illegal: ${lr.violation.message}` });

  return { ok: issues.length === 0, form, issues };
}

/**
 * Lint a row from a generated layer: the `morphemes` must be well-formed AND must
 * reconstruct the stated surface `form` (catches buffer slips / corrupted rows).
 */
export function checkRow(form: string, morphemes: string): MorphResult {
  const r = lintMorphemes(morphemes);
  const expected = form.trim().toLowerCase();
  if (r.form && r.form !== expected) {
    r.issues.push({
      code: "FORM_MISMATCH",
      message: `'${morphemes}' joins to '${r.form}', but the row's form is '${expected}'.`,
    });
  }
  return { ...r, ok: r.issues.length === 0 };
}

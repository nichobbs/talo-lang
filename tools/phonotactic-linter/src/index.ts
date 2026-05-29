/**
 * Public API for the Talo phonotactic linter.
 * See docs/0001-phonology.md for the spec these enforce.
 */
export {
  lint,
  isLegal,
  VOWELS,
  CONSONANTS,
  CODA_FOLLOWERS,
  ALPHABET,
} from "./linter.ts";
export type { LintResult, Violation, RuleCode } from "./linter.ts";

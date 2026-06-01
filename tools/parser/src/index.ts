/**
 * Public API for the Talo parser / sentence validator.
 * See docs/0002 (grammar) and docs/0005 §3 (determiner order) for the spec.
 */
export {
  analyze,
  BADGES,
  DERIV_AFFIXES,
  FUNCTION_WORDS,
} from "./morphology.ts";
export type { WordAnalysis, WordKind, Category } from "./morphology.ts";

export { validate, tokenize } from "./validator.ts";
export type {
  Issue,
  Severity,
  ValidateResult,
  ValidateOptions,
} from "./validator.ts";

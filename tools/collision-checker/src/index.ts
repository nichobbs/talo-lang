/**
 * Public API for the Talo collision checker — the second lexicon gate.
 * See docs/0000 §4 and docs/0001 §2.1/§8 for the spec these enforce.
 */
export {
  skeleton,
  checkForm,
  checkBatch,
  RESERVED_FORMS,
} from "./checker.ts";
export type {
  Conflict,
  CheckResult,
  Occupied,
  Candidate,
  BatchOptions,
} from "./checker.ts";

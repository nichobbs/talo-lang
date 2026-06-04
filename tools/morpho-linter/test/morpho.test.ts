/**
 * Morphological linter tests: the buffer rule, badge/legality checks, and the
 * form↔morphemes reconstruction used by the data gate.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { joinWithBuffer, lintMorphemes, checkRow } from "../src/index.ts";

// ---------- the §3.1 buffer rule ----------

test("buffer fires only at an n-final piece + non-stop onset", () => {
  // n + non-stop (m) → insert `a`  (e.g. the daylight-type seam)
  assert.equal(joinWithBuffer(["din", "moto"]), "dinamoto");
  // n + stop (k) → no buffer (n+stop is a legal cluster)
  assert.equal(joinWithBuffer(["din", "ko"]), "dinko");
  // n + vowel → no buffer
  assert.equal(joinWithBuffer(["din", "ami"]), "dinami");
  // non-n final → never buffers
  assert.equal(joinWithBuffer(["pani", "kama", "ka"]), "panikamaka");
  // affix seams (stop onsets) never buffer
  assert.equal(joinWithBuffer(["kelua", "ta", "to"]), "keluatato");
});

// ---------- lintMorphemes ----------

test("a well-formed decomposition is legal and reconstructs its form", () => {
  const r = lintMorphemes("pani+kama+ka");
  assert.equal(r.ok, true);
  assert.equal(r.form, "panikamaka");
});

test("rejects a missing badge, a non-Talo letter, and a too-short decomposition", () => {
  assert.ok(lintMorphemes("pani+kama+xa").issues.some((i) => i.code === "NON_TALO" || i.code === "NO_BADGE"));
  assert.ok(lintMorphemes("pani+kama+ku").issues.some((i) => i.code === "NO_BADGE")); // -ku is an affix, not a badge
  assert.ok(lintMorphemes("panika").issues.some((i) => i.code === "EMPTY"));
});

test("rejects a decomposition that joins to an illegal form", () => {
  // two stop-initial roots with no vowel between can make an illegal cluster
  const r = lintMorphemes("tak+ka");
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.code === "ILLEGAL_FORM"));
});

// ---------- checkRow (the data-gate assertion) ----------

test("checkRow flags a form that disagrees with its morphemes", () => {
  assert.equal(checkRow("panikamaka", "pani+kama+ka").ok, true);
  const bad = checkRow("panikama", "pani+kama+ka"); // missing the buffer/real join
  assert.equal(bad.ok, false);
  assert.ok(bad.issues.some((i) => i.code === "FORM_MISMATCH"));
});

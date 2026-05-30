import { test } from "node:test";
import assert from "node:assert/strict";
import { skeleton, checkForm, checkBatch, RESERVED_FORMS } from "../src/index.ts";

test("skeleton collapses the weak stop contrast b/p, d/t, g/k", () => {
  assert.equal(skeleton("bata"), "pata");
  assert.equal(skeleton("pada"), "pata");
  assert.equal(skeleton("gada"), "kata");
  // unaffected segments are preserved
  assert.equal(skeleton("solu"), "solu");
  assert.equal(skeleton("MILO"), "milo");
});

test("phonotactically illegal forms are rejected first", () => {
  const r = checkForm("tar", [], []); // 'r' not in alphabet
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.conflict.kind, "PHONOTACTIC");
});

test("exact duplicate of an existing form is a HOMOPHONE", () => {
  const r = checkForm("kanu", [{ form: "kanu", label: "ANI-002 dog" }]);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.conflict.kind, "HOMOPHONE");
});

test("clash with a reserved grammatical word is RESERVED", () => {
  assert.ok(RESERVED_FORMS.has("na"));
  const occ = [...RESERVED_FORMS].map((form) => ({ form, label: "reserved" }));
  const r = checkForm("na", occ);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.conflict.kind, "RESERVED");
});

test("differ-by-voicing-only is a NEAR_HOMOPHONE", () => {
  const r = checkForm("pata", [{ form: "bata", label: "X-001" }]);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.conflict.kind, "NEAR_HOMOPHONE");
  assert.equal(r.ok === false && r.conflict.kind === "NEAR_HOMOPHONE" && r.conflict.skeleton, "pata");
});

test("near-homophone is detected against reserved words too", () => {
  // 'de' collapses to skeleton 'te'; 'te' is the reserved 3rd-person pronoun.
  const occ = [...RESERVED_FORMS].map((form) => ({ form, label: "reserved" }));
  const r = checkForm("de", occ);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.conflict.kind, "NEAR_HOMOPHONE");
});

test("obscenity screen: exact match and long-substring embedding flag", () => {
  const bl = ["kaka", "xyz"];
  assert.equal(checkForm("kaka", [], bl).ok, false); // exact
  assert.equal(checkForm("kakato", [], bl).ok, false); // ≥4-char substring
  // a short blocklist entry only matches as a whole word
  assert.equal(checkForm("kuto", [], ["kut"]).ok, true); // 'kut' (len 3) does NOT flag 'kuto'
});

test("a clean, novel form passes", () => {
  const r = checkForm("solu", [{ form: "kanu", label: "ANI-002" }], ["kaka"]);
  assert.equal(r.ok, true);
});

test("checkBatch catches internal collisions and reserved clashes", () => {
  const res = checkBatch(["pata", "bata", "solu", "na"]);
  assert.equal(res[0].ok, true); // pata — first, clear
  assert.equal(res[1].ok, false); // bata — near-homophone of pata
  assert.equal(res[1].ok === false && res[1].conflict.kind, "NEAR_HOMOPHONE");
  assert.equal(res[2].ok, true); // solu — clear
  assert.equal(res[3].ok, false); // na — reserved
  assert.equal(res[3].ok === false && res[3].conflict.kind, "RESERVED");
});

test("checkBatch with an all-clear set returns all ok", () => {
  const res = checkBatch(["kanu", "solu", "miko", "tefa"]);
  assert.ok(res.every((r) => r.ok));
});

test("false-friend screen blocks SEVERE/HIGH by default", () => {
  const ff = new Map([["ano", [{ lang: "Spanish", meaning: "anus", severity: "SEVERE" }]]]);
  const r = checkForm("ano", [], [], ff);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.conflict.kind, "FALSE_FRIEND");
});

test("false-friend screen ignores MEDIUM/LOW by default, but can be tightened", () => {
  const ff = new Map([["du", [{ lang: "German", meaning: "you", severity: "MEDIUM" }]]]);
  assert.equal(checkForm("du", [], [], ff).ok, true); // MEDIUM not blocked by default
  assert.equal(checkForm("du", [], [], ff, new Set(["MEDIUM"])).ok, false); // tightened
});

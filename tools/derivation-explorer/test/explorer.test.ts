/** Talo derivation explorer tests — over a small in-memory dictionary. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIndices, wordFamily, confusables, explain, type DictEntry } from "../src/index.ts";

const DICT: DictEntry[] = [
  { form: "edu", gloss: "learn / teach", kind: "root" },
  { form: "eduka", gloss: "act of learn", kind: "derived", base: "edu", morphemes: "edu+ka" },      // trivial badge
  { form: "edukika", gloss: "teacher", kind: "derived", base: "edu", morphemes: "edu+ki+ka" },       // real derivation
  { form: "edukama", gloss: "school", kind: "compound", morphemes: "edu+kama+ka" },
  { form: "buta", gloss: "pig", kind: "root", falseFriend: 'looks like "pig" (Japanese)' },
  { form: "puta", gloss: "to put", kind: "root" },                                                   // near-homophone of buta
  { form: "kama", gloss: "room", kind: "root" },
];

const ix = buildIndices(DICT);

test("family keeps real derivations + compounds, drops the bare-badge form", () => {
  const fam = wordFamily("edu", ix).map((e) => e.form).sort();
  assert.deepEqual(fam, ["edukama", "edukika"]); // eduka (root+badge) excluded
});

test("confusables: roots sharing a merge-skeleton, self excluded", () => {
  assert.deepEqual(confusables("buta", ix).map((e) => e.form), ["puta"]);
  assert.deepEqual(confusables("puta", ix).map((e) => e.form), ["buta"]);
});

test("explain: a surface word resolves to its root and that root's family", () => {
  const r = explain("edukika", ix);
  assert.equal(r.entry?.form, "edukika");
  assert.equal(r.root?.form, "edu");
  assert.deepEqual(r.family.map((e) => e.form).sort(), ["edukama", "edukika"]);
});

test("explain: a root reports its own family and confusables", () => {
  const r = explain("buta", ix);
  assert.equal(r.entry?.kind, "root");
  assert.equal(r.entry?.falseFriend, 'looks like "pig" (Japanese)');
  assert.deepEqual(r.confusables.map((e) => e.form), ["puta"]);
});

test("explain: an unknown form yields no entry but does not throw", () => {
  const r = explain("zzz", ix);
  assert.equal(r.entry, undefined);
  assert.deepEqual(r.family, []);
});

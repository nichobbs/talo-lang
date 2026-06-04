/** Talo derivation explorer tests — over a small in-memory dictionary. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIndices, wordFamily, confusables, badgeCoincidences, explain, type DictEntry } from "../src/index.ts";

const DICT: DictEntry[] = [
  { form: "edu", gloss: "learn / teach", kind: "root" },
  { form: "eduka", gloss: "act of learn", kind: "derived", base: "edu", morphemes: "edu+ka" },      // trivial badge
  { form: "edukika", gloss: "teacher", kind: "derived", base: "edu", morphemes: "edu+ki+ka" },       // real derivation
  { form: "edukama", gloss: "school", kind: "compound", morphemes: "edu+kama+ka" },
  { form: "buta", gloss: "pig", kind: "root", falseFriend: 'looks like "pig" (Japanese)' },
  { form: "puta", gloss: "to put", kind: "root" },                                                   // near-homophone of buta
  { form: "kama", gloss: "room", kind: "root" },
  // citation-form coincidences: a content root whose headword spells another
  // content root + badge (and the reverse), plus a function-word stem that must NOT count.
  { form: "kuna", gloss: "exist", kind: "root", pos: "v" },
  { form: "kunato", gloss: "lock", kind: "root", pos: "v" },        // = kuna + V
  { form: "kan", gloss: "see", kind: "root", pos: "v" },
  { form: "kanto", gloss: "office", kind: "root", pos: "n" },       // = kan + V
  { form: "kanka", gloss: "crab", kind: "root", pos: "n" },         // = kan + N
  { form: "ma", gloss: "but", kind: "root", pos: "fun" },           // function word (no badges)
  { form: "maka", gloss: "border", kind: "root", pos: "n" },        // looks like ma+N, but ma is fun → not flagged
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

test("badgeCoincidences: a headword that spells another content root + badge", () => {
  const b = badgeCoincidences("kunato", ix);                 // reads as kuna(exist)+V
  assert.equal(b.readsAs?.stem.form, "kuna");
  assert.equal(b.readsAs?.badge, "V");
  assert.deepEqual(b.spells, []);
});

test("badgeCoincidences: a content stem whose own badge forms spell other roots", () => {
  const b = badgeCoincidences("kan", ix);                    // kan+N=kanka(crab), kan+V=kanto(office)
  assert.equal(b.readsAs, undefined);
  assert.deepEqual(
    b.spells.map((s) => `${s.badge}:${s.root.form}`).sort(),
    ["N:kanka", "V:kanto"],
  );
});

test("badgeCoincidences: a function-word stem does NOT count (it takes no badge)", () => {
  assert.equal(badgeCoincidences("maka", ix).readsAs, undefined); // ma is pos=fun
  assert.deepEqual(badgeCoincidences("maka", ix).spells, []);
});

test("explain carries the badge coincidence", () => {
  assert.equal(explain("kunato", ix).badge.readsAs?.stem.form, "kuna");
});

/** Talo reading-coverage harness tests — over small fixtures. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEnglishIndex, isExpressible, coverageReport, type RefConcept, type CovEntry } from "../src/index.ts";

const DICT: CovEntry[] = [
  { gloss: "dog", keywords: ["dog"] },
  { gloss: "buy", keywords: ["buy"] },
  { gloss: "person / human", keywords: ["person", "human"] },
  { gloss: "birth", keywords: ["birth"] },
];
const index = buildEnglishIndex(DICT);

test("buildEnglishIndex: keywords and split gloss senses are indexed", () => {
  assert.ok(index.has("dog"));
  assert.ok(index.has("person"));
  assert.ok(index.has("human"));
});

test("isExpressible: direct, structural, synonym-split, and head-word matches", () => {
  assert.equal(isExpressible("dog", index), true);                    // direct keyword
  assert.equal(isExpressible("and", index), true);                    // structural word
  assert.equal(isExpressible("a menudo, dog", index), true);          // one synonym matches
  assert.equal(isExpressible("give birth", index), true);             // head word "birth"
  assert.equal(isExpressible("merchant", index), false);              // genuine gap
  assert.equal(isExpressible("third", index), false);                 // derivable, but lower-bound counts it missing
});

const REF: RefConcept[] = [
  { id: "IDS-1", english: "dog", chapter: "3", gloss: "DOG" },
  { id: "IDS-2", english: "person, human", chapter: "2", gloss: "PERSON" },
  { id: "IDS-3", english: "merchant", chapter: "19", gloss: "MERCHANT" },
  { id: "IDS-4", english: "oar", chapter: "10", gloss: "OAR" },
  { id: "IDS-5", english: "and", chapter: "14", gloss: "AND" },
];

test("coverageReport: counts, percentage, and the missing queue", () => {
  const r = coverageReport(REF, DICT);
  assert.equal(r.total, 5);
  assert.equal(r.covered, 3);                       // dog, person, and
  assert.equal(r.pct, 60);
  assert.deepEqual(r.missing.map((m) => m.id), ["IDS-3", "IDS-4"]); // merchant, oar
});

test("coverageReport: gaps grouped by chapter, most-missing first", () => {
  const r = coverageReport(REF, DICT);
  const ch19 = r.byChapter.find((c) => c.chapter === "19")!;
  const ch10 = r.byChapter.find((c) => c.chapter === "10")!;
  assert.equal(ch19.missing, 1);
  assert.equal(ch10.missing, 1);
  // chapters with no gaps still appear with missing 0
  assert.equal(r.byChapter.find((c) => c.chapter === "3")!.missing, 0);
});

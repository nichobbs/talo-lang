/** Talo interlinear glosser tests — over a small in-memory dictionary. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildContext, glossToken, glossClause, isUnglossed, type GlossEntry } from "../src/index.ts";

const DICT: GlossEntry[] = [
  { form: "bukama", gloss: "earthquake", keywords: ["earthquake"], kind: "root" },
  { form: "tuyoi", gloss: "strong", keywords: ["strong"], kind: "root" },
  { form: "tataku", gloss: "hit / strike", keywords: ["hit", "strike"], kind: "root" },
  { form: "hito", gloss: "person / human", keywords: ["person", "human"], kind: "root" },
  { form: "mati", gloss: "die", keywords: ["die"], kind: "root" },
  { form: "mau", gloss: "want", keywords: ["want"], kind: "root" },
  { form: "pani", gloss: "water", keywords: ["water"], kind: "root" },
  { form: "cakula", gloss: "food", keywords: ["food"], kind: "root" },
  { form: "yana", gloss: "yesterday", keywords: ["yesterday"], kind: "root" },   // time-word (dict)
  { form: "ingi", gloss: "many / much", keywords: ["many", "much"], kind: "root" },
  { form: "seko", gloss: "what", keywords: ["what"], kind: "root" },             // correlative (dict)
  { form: "edukika", gloss: "teacher", keywords: ["teacher"], kind: "derived" }, // surface word
  { form: "lukutu", gloss: "look at / watch", keywords: ["look at", "watch"], kind: "root" }, // multiword sense
];
const PROPER = [{ root: "yapan", source: "Japan" }];

const ctx = buildContext(DICT, PROPER);

test("content word: root gloss + category from the badge it wears", () => {
  assert.equal(glossToken("bukamaka", ctx), "earthquake-N");
  assert.equal(glossToken("tatakuto", ctx), "hit-V");       // prefers root, not parser's tataku→ta
  assert.equal(glossToken("tuyoipe", ctx), "strong-MOD");
});

test("grammatical words use the fixed Leipzig labels", () => {
  assert.equal(glossToken("li", ctx), "COMPLETIVE");
  assert.equal(glossToken("wi", ctx), "PROGRESSIVE");
  assert.equal(glossToken("i", ctx), "and");
  assert.equal(glossToken("ne", ctx), "NEG");
  assert.equal(glossToken("pu", ctx), "PL");
  assert.equal(glossToken("yu", ctx), "you");
  assert.equal(glossToken("lo", ctx), "at");
  assert.equal(glossToken("yato", ctx), "COP");             // copula root ya, badged
});

test("proper noun → English name + badge", () => {
  assert.equal(glossToken("Yapanka", ctx), "Japan-N");
});

test("dictionary non-content words (correlatives, time-words) gloss untagged", () => {
  assert.equal(glossToken("seko", ctx), "what");
  assert.equal(glossToken("yana", ctx), "yesterday");
  assert.equal(glossToken("ingi", ctx), "many");
});

test("surface derived word resolves to its own gloss + badge", () => {
  assert.equal(glossToken("edukika", ctx), "teacher-N");
});

test("multiword sense uses dots (Leipzig), and punctuation is stripped", () => {
  assert.equal(glossToken("lukututo", ctx), "look.at-V");
  assert.equal(glossToken("matito,", ctx), "die-V");        // trailing comma ignored
});

test("a whole clause glosses to its interlinear line", () => {
  assert.equal(
    glossClause("bukamaka tuyoipe tatakuto Yapanka yana", ctx),
    "earthquake-N strong-MOD hit-V Japan-N yesterday",
  );
  assert.equal(glossClause("hitoka mauto panika i cakulaka", ctx), "person-N want-V water-N and food-N");
});

test("unknown word is flagged with a trailing ?", () => {
  const g = glossToken("zumboka", ctx);
  assert.ok(isUnglossed(g), `expected '${g}' to be flagged`);
  assert.equal(g, "zumbo-N?");
});

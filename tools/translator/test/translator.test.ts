/**
 * Talo → English translator tests.
 *
 * Integration tests: build the context from the real dictionary.json +
 * proper-nouns.tsv (so the lexical layer is exercised end-to-end) and assert the
 * English transfer for representative sentences spanning the core grammar —
 * SVO, aspect→tense, negation, plural, numerals (incl. multi-token), copula,
 * correlative questions, and proper nouns.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildContext, translate, type GlossEntry } from "../src/index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const entries: GlossEntry[] = JSON.parse(readFileSync(join(ROOT, "dictionary", "dist", "dictionary.json"), "utf8"));
const properRows = readFileSync(join(ROOT, "corpus", "proper-nouns.tsv"), "utf8")
  .trim().split(/\r?\n/).slice(1).filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split("\t")).map((c) => ({ root: c[0], source: c[1] }));
const ctx = buildContext(entries, properRows);
const tr = (s: string) => translate(s, ctx);

test("SVO and basic transfer", () => {
  assert.equal(tr("Gouka kanto nekoka."), "Dog see cat.");
  assert.equal(tr("Mi motuto gouka nu."), "I have 2 dogs.");        // postposed numeral → prenominal + plural
});

test("aspect → tense", () => {
  assert.equal(tr("Te makanto wi."), "It is eating.");             // wi → progressive
  assert.equal(tr("baitika ingi pecato li"), "Many houses broke."); // li → past (irregular), quantifier → plural
  assert.equal(tr("tolonaka datanto wi inino"), "Help is coming now.");
});

test("negation and copula", () => {
  assert.equal(tr("Mi ne tauto."), "I do not know.");
  assert.equal(tr("mausaka yato gandepe").startsWith("Weather is "), true); // copula yato → is
});

test("numerals: multi-token place groups", () => {
  assert.equal(tr("kelopoka okoato hitoka nu diko"), "Group rescue 20 persons."); // nu diko = 20
  assert.equal(tr("taunka nu sebu nu diko le"), "2025 years.");                   // 2000+20+5
});

test("correlative question", () => {
  assert.equal(tr("Mi tauto seko ke"), "I know what?");            // seko → what, ke → ?
});

test("proper nouns keep their English name (badge stripped)", () => {
  assert.equal(tr("bukamaka tuyoipe tatakuto Yapanka yana"), "Strong earthquake hit Japan yesterday.");
});

test("empty / whitespace is empty", () => {
  assert.equal(tr(""), "");
  assert.equal(tr("   "), "");
});

/**
 * Exercise bank + grader + generator tests (integration: real dictionary + bank).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildContext, type GlossEntry } from "../../translator/src/index.ts";
import { parseBank, validateBank, gradeComprehension, gradeProduction, generate, buildDeck, normalizeEn } from "../src/index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const entries: GlossEntry[] = JSON.parse(readFileSync(join(ROOT, "dictionary", "dist", "dictionary.json"), "utf8"));
const properRows = readFileSync(join(ROOT, "corpus", "proper-nouns.tsv"), "utf8").trim().split(/\r?\n/).slice(1)
  .filter((l) => l && !l.startsWith("#")).map((l) => l.split("\t")).map((c) => ({ root: c[0], source: c[1] }));
const ctx = buildContext(entries, properRows);
const knownRoots = new Set<string>([
  ...entries.filter((e: any) => e.kind === "root").map((e) => e.form),
  ...properRows.map((r) => r.root),
]);
const bank = parseBank(readFileSync(join(ROOT, "data", "exercises.tsv"), "utf8"));

test("the authored bank is non-empty and every sentence parses with known roots", () => {
  assert.ok(bank.length >= 25);
  assert.deepEqual(validateBank(bank, knownRoots), []);
});

test("normalizeEn ignores articles, case, punctuation", () => {
  assert.equal(normalizeEn("The dog sees the cat."), normalizeEn("dog sees cat"));
});

test("comprehension grading accepts the reference and the translator rendering", () => {
  const ex = bank.find((e) => e.id === "EX-001")!;            // "Gouka kanto nekoka." / "The dog sees the cat."
  assert.equal(gradeComprehension("The dog sees the cat.", ex, ctx).correct, true);
  assert.equal(gradeComprehension("dog see cat", ex, ctx).correct, true);   // translator-style
  assert.equal(gradeComprehension("the cat eats food", ex, ctx).correct, false);
});

test("production grading: exact reference, equivalent meaning, and rejections", () => {
  const ex = bank.find((e) => e.id === "EX-001")!;
  assert.equal(gradeProduction("Gouka kanto nekoka.", ex, ctx, knownRoots).correct, true);  // exact
  assert.equal(gradeProduction("gou kan neko", ex, ctx, knownRoots).correct, false);        // bare roots → ungrammatical
  assert.equal(gradeProduction("Totoka makanto cakulaka.", ex, ctx, knownRoots).correct, false); // wrong meaning
});

test("generator is deterministic and grammatical", () => {
  const a = generate(7, 6, ctx);
  const b = generate(7, 6, ctx);
  assert.deepEqual(a.map((x) => x.talo), b.map((x) => x.talo));
  assert.deepEqual(validateBank(a, knownRoots), []);          // generated items parse too
  assert.ok(a.every((x) => x.generated && x.english.length > 0));
});

test("buildDeck = bank + generated, ids unique", () => {
  const deck = buildDeck(bank, ctx, knownRoots);
  assert.ok(deck.length > bank.length);
  assert.equal(new Set(deck.map((e) => e.id)).size, deck.length);
});

test("buildDeck enriches each item with token tooltips + acceptable answers", () => {
  const deck = buildDeck(bank, ctx, knownRoots);
  const ex = deck.find((e) => e.id === "EX-001")!;
  assert.ok(ex.tokens && ex.tokens.length === 3);                 // Gouka kanto nekoka.
  assert.equal(ex.tokens![0].gloss, "dog");
  assert.equal(ex.tokens![0].pos, "noun");
  assert.ok(/^\/.*\/$/.test(ex.tokens![0].ipa));                  // IPA with slashes
  assert.ok(ex.accept && ex.accept.includes("dog see cat"));      // translator rendering accepted
  // every deck item is fully enriched
  assert.ok(deck.every((e) => e.tokens!.length > 0 && e.accept!.length > 0 && e.acceptTalo!.length > 0));
});

test("production: acceptTalo includes the reference AND valid same-meaning reorderings", () => {
  const deck = buildDeck(bank, ctx, knownRoots);
  const ex = deck.find((e) => e.id === "EX-001")!;               // "Gouka kanto nekoka." (SVO)
  assert.ok(ex.acceptTalo!.includes("gouka kanto nekoka"));      // reference
  assert.ok(ex.acceptTalo!.includes("gouka nekoka kanto"));      // SOV — also accepted
});

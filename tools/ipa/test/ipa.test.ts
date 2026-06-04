/** Talo IPA renderer tests. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { syllabify, toIPA } from "../src/index.ts";

test("syllabify: (C)V(n), lone C onsets next, n+stop splits", () => {
  assert.deepEqual(syllabify("panika"), ["pa", "ni", "ka"]);
  assert.deepEqual(syllabify("dinko"), ["din", "ko"]);   // n+stop
  assert.deepEqual(syllabify("oke"), ["o", "ke"]);        // vowel-initial
  assert.deepEqual(syllabify("ai"), ["a", "i"]);          // V.V
  assert.deepEqual(syllabify("a"), ["a"]);                // bare vowel
  assert.deepEqual(syllabify("din"), ["din"]);            // final coda n
});

test("toIPA: initial stress + syllable dots", () => {
  assert.equal(toIPA("panika"), "ˈpa.ni.ka");
  assert.equal(toIPA("oke"), "ˈo.ke");
  assert.equal(toIPA("panika", true), "/ˈpa.ni.ka/");
});

test("toIPA: c = /tʃ/, y = /j/", () => {
  assert.equal(toIPA("cao"), "ˈtʃa.o");
  assert.equal(toIPA("yato"), "ˈja.to");
});

test("toIPA: coda n → [ŋ] before k/g", () => {
  assert.equal(toIPA("dinko"), "ˈdiŋ.ko");
  assert.equal(toIPA("tanga"), "ˈtaŋ.ga");
  assert.equal(toIPA("nana"), "ˈna.na"); // n NOT before k/g stays [n]
});

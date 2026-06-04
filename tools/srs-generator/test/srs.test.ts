/** Talo SRS deck generator tests — over a small in-memory dictionary. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDeck, badgeForms, type DeckEntry } from "../src/index.ts";

const DICT: DeckEntry[] = [
  { form: "seko", gloss: "what", ipa: "/ˈse.ko/", domain: "FUN", domainName: "function word", tier: 1, kind: "root",
    badges: {}, examples: [{ talo: "yu tendato seko keso", en: "What will you do tomorrow?" }] },
  { form: "bukama", gloss: "earthquake", ipa: "/ˈbu.ka.ma/", domain: "PHY", domainName: "physical world", tier: 3, kind: "root",
    badges: { noun: "bukamaka" } },
  { form: "ame", gloss: "rain", ipa: "/ˈa.me/", domain: "PHY", domainName: "physical world", tier: 2, kind: "root",
    badges: { noun: "ameka", verb: "ameto" } },
  // a generated derivation — must NEVER become a card.
  { form: "bukamaka", gloss: "earthquake (noun)", domain: "PHY", domainName: "physical world", tier: 0, kind: "derived" },
  // a curated compound — only when asked.
  { form: "panikamaka", gloss: "bathroom", ipa: "/ˈpa.ni.ka.ma.ka/", domain: "DWE", domainName: "dwelling", tier: 0, kind: "compound" },
];

test("scope: only roots by default; derivations excluded", () => {
  const deck = buildDeck(DICT);
  assert.deepEqual(deck.map((c) => c.talo), ["seko", "ame", "bukama"]); // tier 1,2,3; no bukamaka, no compound
});

test("order: tier ascending, then alphabetical within tier", () => {
  const deck = buildDeck([
    { form: "zeta", gloss: "z", domain: "X", domainName: "x", tier: 1, kind: "root" },
    { form: "alfa", gloss: "a", domain: "X", domainName: "x", tier: 1, kind: "root" },
    { form: "core", gloss: "c", domain: "X", domainName: "x", tier: 2, kind: "root" },
  ]);
  assert.deepEqual(deck.map((c) => c.talo), ["alfa", "zeta", "core"]);
});

test("maxTier filters the long tail", () => {
  assert.deepEqual(buildDeck(DICT, { maxTier: 1 }).map((c) => c.talo), ["seko"]);
  assert.deepEqual(buildDeck(DICT, { maxTier: 2 }).map((c) => c.talo), ["seko", "ame"]);
});

test("compounds admitted only with includeCompounds, and sorted last", () => {
  const deck = buildDeck(DICT, { includeCompounds: true });
  assert.equal(deck.at(-1)?.talo, "panikamaka");        // tier 0 → after graded roots
  assert.equal(deck.at(-1)?.kind, "compound");
});

test("card carries IPA, badge forms, and the first example", () => {
  const seko = buildDeck(DICT)[0];
  assert.equal(seko.ipa, "/ˈse.ko/");
  assert.equal(seko.example, "yu tendato seko keso");
  assert.equal(seko.exampleEn, "What will you do tomorrow?");
  const ame = buildDeck(DICT).find((c) => c.talo === "ame")!;
  assert.equal(ame.badges, "ameka (n), ameto (v)");
  assert.equal(ame.example, ""); // no example available → empty, not undefined
});

test("badgeForms renders the conventional forms", () => {
  assert.equal(badgeForms({ noun: "x", verb: "y", modifier: "z" }), "x (n), y (v), z (mod)");
  assert.equal(badgeForms({}), "");
  assert.equal(badgeForms(undefined), "");
});

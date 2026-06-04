/** Talo coverage-stats tests — over small in-memory fixtures. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { attributeFamily, buildReport, FAMILY_CAP_PCT, type LexRow, type ConRow } from "../src/index.ts";

const lx = (id: string, source: string, rationale: string, notes: string): LexRow =>
  ({ id, form: id.toLowerCase(), source, rationale, notes });

test("attributeFamily: source codes, family word, donor language, and the (was …) trap", () => {
  assert.equal(attributeFamily(lx("A", "COIN", "se- series", "function")), "coined");
  assert.equal(attributeFamily(lx("B", "DERIV", "", "")), "derived");
  assert.equal(attributeFamily(lx("C", "INTL", "Swahili sana", "Bantu")), "Bantu");
  assert.equal(attributeFamily(lx("D", "INTL", "Indonesian lebih", "Austronesian (was Spanish mas)")), "Austronesian");
  // the rejected-source aside must NOT win — notes "(was Romance)" is stripped:
  assert.equal(attributeFamily(lx("E", "INTL", "Swahili -ingi", "Bantu (was Romance)")), "Bantu");
  // a genuinely Latinate modern-layer root IS Romance:
  assert.equal(attributeFamily(lx("F", "INTL", "Latin natio", "Romance")), "Romance");
  // src-only blend rows can't be attributed:
  assert.equal(attributeFamily(lx("G", "INTL", "blend rubric; src 'haba'", "blend")), "UNATTRIBUTED");
});

const LEX: LexRow[] = [
  lx("R1", "INTL", "Swahili a", "Bantu"),
  lx("R2", "INTL", "Swahili b", "Bantu"),
  lx("R3", "INTL", "Japanese c", "Japonic"),
  lx("R4", "INTL", "blend; src 'x'", "blend"),     // unattributed
  lx("C1", "COIN", "", ""),
  lx("D1", "DERIV", "", ""),
];
const CON: ConRow[] = [
  { id: "R1", domain: "PHY", tier: "1", is_root: "yes" },
  { id: "R2", domain: "PHY", tier: "2", is_root: "yes" },
  { id: "R3", domain: "ACT", tier: "2", is_root: "yes" },
  { id: "X1", domain: "ACT", tier: "2", is_root: "no" },   // derivable, no form → expected
  { id: "X2", domain: "KIN", tier: "1", is_root: "yes" },  // ROOT with no form → real hole
];

test("buildReport: donor total excludes coined/derived; shares over donor total", () => {
  const r = buildReport(LEX, CON);
  assert.equal(r.forms, 6);
  assert.equal(r.coined, 1);
  assert.equal(r.derived, 1);
  assert.equal(r.donorSourced, 4); // 6 − coined − derived
  const bantu = r.families.find((f) => f.family === "Bantu")!;
  assert.equal(bantu.count, 2);
  assert.equal(bantu.pctOfDonor, 50); // 2/4
  assert.equal(r.unattributed, 1);
});

test("buildReport: a family at/over the cap is a provable breach", () => {
  const r = buildReport(LEX, CON);
  // Bantu is 50% of the donor total here → over the 25% cap.
  assert.ok(r.provenOverCap.some((f) => f.family === "Bantu"));
  assert.ok(FAMILY_CAP_PCT === 25);
  // UNATTRIBUTED is never counted as a breach even if large.
  assert.ok(!r.provenOverCap.some((f) => f.family === "UNATTRIBUTED"));
});

test("buildReport: tier/domain tallies and the root-hole vs derivable split", () => {
  const r = buildReport(LEX, CON);
  assert.deepEqual(r.tiers, [{ tier: "1", count: 2 }, { tier: "2", count: 3 }]);
  assert.equal(r.domains.find((d) => d.domain === "PHY")?.count, 2);
  assert.deepEqual(r.derivableWithoutForm, ["X1"]); // is_root=no, fine
  assert.deepEqual(r.rootsWithoutForm, ["X2"]);     // is_root=yes, a real hole
});

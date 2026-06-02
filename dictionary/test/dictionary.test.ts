/**
 * Dictionary generator tests.
 *
 * The generator is also the cross-file integrity gate for data/, so these tests
 * assert both (a) it builds the real data without error and (b) the structural
 * guarantees the web tool and book rely on: every form legal, every entry
 * carries a gloss, badges match the pos hint, and the English index round-trips.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { lint } from "../../tools/phonotactic-linter/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DICT = join(__dirname, "..");

test("generator builds the real data cleanly (integrity gate)", () => {
  // --check exits 0 only if every form is legal and there are no duplicates.
  const out = execFileSync(
    "node",
    ["--experimental-strip-types", join(DICT, "src", "build.ts"), "--check"],
    { encoding: "utf8" },
  );
  assert.match(out, /entries, all forms legal, no duplicate forms/);
});

test("generated JSON is well-formed and every form is legal Talo", () => {
  // Build, then load dist/dictionary.json and re-check invariants.
  execFileSync("node", ["--experimental-strip-types", join(DICT, "src", "build.ts")], { encoding: "utf8" });
  const jsonPath = join(DICT, "dist", "dictionary.json");
  assert.ok(existsSync(jsonPath), "dictionary.json should exist after build");
  const data = JSON.parse(readFileSync(jsonPath, "utf8")) as Array<{
    id: string; form: string; gloss: string; pos: string; badges: Record<string, string>;
  }>;
  assert.ok(data.length > 1400, "should have the full lexicon");
  for (const e of data) {
    assert.ok(e.form && e.gloss, `entry ${e.id} needs form + gloss`);
    assert.ok(lint(e.form).legal, `form ${e.form} must be legal Talo`);
    // badge consistency: a noun-hint root's noun badge ends in -ka, etc.
    if (e.pos === "n" && e.badges.noun) assert.match(e.badges.noun, /ka$/);
    if (e.pos === "v" && e.badges.verb) assert.match(e.badges.verb, /to$/);
    if (e.pos === "mod" && e.badges.modifier) assert.match(e.badges.modifier, /pe$/);
    // function words carry no badge
    if (e.pos === "fun") assert.equal(Object.keys(e.badges).length, 0, `${e.form} (fun) should have no badge`);
  }
});

test("derived words and compounds are folded in and resolve", () => {
  const data = JSON.parse(readFileSync(join(DICT, "dist", "dictionary.json"), "utf8")) as Array<{
    form: string; kind: string; base?: string; morphemes?: string; keywords: string[];
  }>;
  const kinds = new Map<string, number>();
  for (const e of data) kinds.set(e.kind, (kinds.get(e.kind) ?? 0) + 1);
  // all three layers present (docs/0007): roots + derived + compounds
  assert.ok((kinds.get("root") ?? 0) > 1400, "roots present");
  assert.ok((kinds.get("derived") ?? 0) > 5000, "derived layer folded in");
  assert.ok((kinds.get("compound") ?? 0) > 0, "compound layer folded in");
  const byForm = new Map(data.map((e) => [e.form, e]));
  // a known derived word resolves, carries its breakdown, and is searchable by root meaning
  const d = byForm.get("tendakika");
  assert.ok(d && d.kind === "derived", "tendakika should be a derived entry");
  assert.equal(d!.base, "tenda");
  assert.equal(d!.morphemes, "tenda+ki+ka");
  assert.ok(d!.keywords.includes("make"), "derived word indexed under its root meaning");
  // every derived/compound carries a morpheme breakdown
  for (const e of data) {
    if (e.kind !== "root") assert.ok(e.morphemes, `${e.form} (${e.kind}) needs a morpheme breakdown`);
  }
});

test("English index headwords all resolve to a real form", () => {
  const data = JSON.parse(readFileSync(join(DICT, "dist", "dictionary.json"), "utf8")) as Array<{ form: string }>;
  const forms = new Set(data.map((e) => e.form));
  const e2t = readFileSync(join(DICT, "dist", "english-talo.md"), "utf8");
  const arrows = [...e2t.matchAll(/→ (\S+)$/gm)].map((m) => m[1]);
  assert.ok(arrows.length > 0);
  for (const f of arrows) assert.ok(forms.has(f), `index points to unknown form '${f}'`);
});

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

test("English index headwords all resolve to a real form", () => {
  const data = JSON.parse(readFileSync(join(DICT, "dist", "dictionary.json"), "utf8")) as Array<{ form: string }>;
  const forms = new Set(data.map((e) => e.form));
  const e2t = readFileSync(join(DICT, "dist", "english-talo.md"), "utf8");
  const arrows = [...e2t.matchAll(/→ (\S+)$/gm)].map((m) => m[1]);
  assert.ok(arrows.length > 0);
  for (const f of arrows) assert.ok(forms.has(f), `index points to unknown form '${f}'`);
});

/** Talo deprecation-registry tests — over small in-memory fixtures. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRegistry, type Deprecation, type LiveView } from "../src/index.ts";

const dep = (old_form: string, new_form: string, id: string): Deprecation =>
  ({ old_form, new_form, id, gloss: "x", reason: "r", decision: "0011 §5.1", date: "2026-06-04" });

/** A live view where id→form is given and liveForms is the set of those forms. */
function live(byId: Record<string, string>, extra: string[] = []): LiveView {
  const formById = new Map(Object.entries(byId));
  const liveForms = new Set([...Object.values(byId), ...extra]);
  return { liveForms, formById };
}

test("clean registry: retired form dead, replacement live under its id", () => {
  const deps = [dep("tebana", "wola", "ACT-033")];
  const problems = checkRegistry(deps, live({ "ACT-033": "wola" }));
  assert.deepEqual(problems, []);
});

test("resurrected: a retired form that is live again is flagged", () => {
  const deps = [dep("tebana", "wola", "ACT-033")];
  // tebana reappears as some other live form → violation.
  const problems = checkRegistry(deps, live({ "ACT-033": "wola" }, ["tebana"]));
  assert.equal(problems.length, 1);
  assert.equal(problems[0].kind, "resurrected");
});

test("replacement-missing: lexicon form for the id isn't the recorded new_form", () => {
  const deps = [dep("tebana", "wola", "ACT-033")];
  const problems = checkRegistry(deps, live({ "ACT-033": "tobu" })); // not wola
  assert.equal(problems.length, 1);
  assert.equal(problems[0].kind, "replacement-missing");
});

test("unknown-id: a registry id no longer in the lexicon is flagged", () => {
  const deps = [dep("tebana", "wola", "ACT-999")];
  const problems = checkRegistry(deps, live({ "ACT-033": "wola" }));
  assert.equal(problems.length, 1);
  assert.equal(problems[0].kind, "unknown-id");
});

test("retirement with no replacement (∅) only checks the form stays dead", () => {
  const deps = [dep("oldword", "∅", "ACT-033")];
  assert.deepEqual(checkRegistry(deps, live({ "ACT-033": "wola" })), []);       // dead → clean
  assert.equal(checkRegistry(deps, live({ "ACT-033": "wola" }, ["oldword"]))[0].kind, "resurrected");
});

/**
 * Talo deprecation registry (docs/0000 discipline; data/deprecations.tsv).
 *
 * Form-retirement should be a recorded, gated act — never a silent change. This
 * module validates the registry against the live data so that:
 *
 *   1. no retired `old_form` is still LIVE anywhere (lexicon / derived / compound)
 *      — a dead spelling stays dead, and so can never silently come back for a
 *      DIFFERENT meaning (the trap the registry exists to prevent);
 *   2. each `new_form` IS live under its `id` — the recorded replacement is real,
 *      not aspirational;
 *   3. each `id` still resolves to a lexicon concept.
 *
 * Pure: it takes the parsed registry + a view of the live forms and returns the
 * list of problems (empty = clean). The CLI owns I/O. Zero dependencies.
 */

/** A registry row (data/deprecations.tsv). */
export interface Deprecation {
  old_form: string;
  /** the replacement form, or "∅" for a retirement with no replacement. */
  new_form: string;
  id: string;
  gloss: string;
  reason: string;
  decision: string;
  date: string;
}

/** A live view of the dataset the registry is checked against. */
export interface LiveView {
  /** every surface/root form currently in the data (lexicon + derived + compound). */
  liveForms: Set<string>;
  /** id → its current lexicon form, for the new_form-under-id consistency check. */
  formById: Map<string, string>;
}

export interface Problem {
  kind: "resurrected" | "replacement-missing" | "unknown-id";
  old_form: string;
  id: string;
  detail: string;
}

/** Validate the registry against the live data. Returns [] when clean. */
export function checkRegistry(deprecations: Deprecation[], live: LiveView): Problem[] {
  const problems: Problem[] = [];
  for (const d of deprecations) {
    // 1. a retired form must not be live again.
    if (live.liveForms.has(d.old_form)) {
      problems.push({
        kind: "resurrected",
        old_form: d.old_form,
        id: d.id,
        detail: `retired form '${d.old_form}' (${d.gloss}) is live again — a deprecated spelling must stay retired`,
      });
    }
    // 3. the id must still exist.
    const current = live.formById.get(d.id);
    if (current === undefined) {
      problems.push({
        kind: "unknown-id",
        old_form: d.old_form,
        id: d.id,
        detail: `registry id '${d.id}' is not in the lexicon`,
      });
      continue;
    }
    // 2. the recorded replacement must be the live form for that id.
    if (d.new_form !== "∅" && current !== d.new_form) {
      problems.push({
        kind: "replacement-missing",
        old_form: d.old_form,
        id: d.id,
        detail: `registry says ${d.id} → '${d.new_form}', but the lexicon has '${current}'`,
      });
    }
  }
  return problems;
}

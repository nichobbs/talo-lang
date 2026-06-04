/**
 * Talo derivation explorer (docs/0007) — the dictionary's cross-reference layer,
 * as a library + CLI.
 *
 * Given any Talo form it surfaces the four relations the web lookup shows:
 *   - its source ROOT (for a derived/compound surface word);
 *   - its word FAMILY (the non-trivial derivations + compounds of a root);
 *   - the words it COULD BE CONFUSED WITH by ear (shared merge-skeleton, i.e.
 *     near-homophones under the b/p·d/t·g/k collapse), and
 *   - any cross-language FALSE FRIEND warning.
 *
 * It operates over the already-enriched dictionary.json (the committed artifact
 * from `dictionary/src/build.ts`), so examples and false-friend notes come along
 * for free and the explorer never re-derives data — it only indexes it. The
 * index-building mirrors web/src/app.js exactly so the CLI and the site agree.
 *
 * Zero dependencies; reuses the collision checker's skeleton().
 */
import { skeleton } from "../../collision-checker/src/checker.ts";

export interface DictEntry {
  form: string;
  gloss: string;
  kind: "root" | "derived" | "compound";
  base?: string;
  morphemes?: string;
  ipa?: string;
  examples?: { talo: string; en: string }[];
  falseFriend?: string;
}

export interface Indices {
  byForm: Map<string, DictEntry>;
  /** root form → its non-trivial derivations and compounds. */
  family: Map<string, DictEntry[]>;
  /** merge-skeleton → root entries sharing it. */
  skel: Map<string, DictEntry[]>;
}

/**
 * Build the cross-reference indices once over a dictionary. The family index
 * keeps the unpredictable derivations (root+affix+badge) and compounds, and
 * drops the trivial bare-badge forms (root+badge) a learner can predict.
 */
export function buildIndices(entries: DictEntry[]): Indices {
  const byForm = new Map<string, DictEntry>();
  for (const e of entries) if (!byForm.has(e.form)) byForm.set(e.form, e);

  const family = new Map<string, DictEntry[]>();
  const add = (root: string, e: DictEntry) => {
    const arr = family.get(root);
    if (arr) arr.push(e);
    else family.set(root, [e]);
  };
  for (const e of entries) {
    if (e.kind === "derived" && e.base) {
      if ((e.morphemes ?? "").split("+").length >= 3) add(e.base, e);
    } else if (e.kind === "compound" && e.morphemes) {
      const segs = e.morphemes.split("+").filter((s) => !["ka", "to", "pe"].includes(s));
      for (const s of new Set(segs)) if (byForm.has(s)) add(s, e);
    }
  }

  const skel = new Map<string, DictEntry[]>();
  for (const e of entries) {
    if (e.kind !== "root") continue;
    const k = skeleton(e.form);
    const arr = skel.get(k);
    if (arr) arr.push(e);
    else skel.set(k, [e]);
  }

  return { byForm, family, skel };
}

/** The word family of a root form (empty if it has none / isn't a root). */
export function wordFamily(form: string, ix: Indices): DictEntry[] {
  return ix.family.get(form) ?? [];
}

/** Near-homophone confusables of a form: other roots with the same skeleton. */
export function confusables(form: string, ix: Indices): DictEntry[] {
  return (ix.skel.get(skeleton(form)) ?? []).filter((x) => x.form !== form);
}

export interface Explanation {
  entry?: DictEntry;
  root?: DictEntry;
  family: DictEntry[];
  confusables: DictEntry[];
}

/** Everything the explorer knows about one form, resolved through the indices. */
export function explain(form: string, ix: Indices): Explanation {
  const entry = ix.byForm.get(form);
  const root = entry?.base ? ix.byForm.get(entry.base) : undefined;
  // a derived/compound's family is its root's family; a root's is its own.
  const familyKey = entry?.kind === "root" ? form : entry?.base ?? form;
  return {
    entry,
    root,
    family: wordFamily(familyKey, ix),
    confusables: confusables(entry?.kind === "root" ? form : entry?.base ?? form, ix),
  };
}

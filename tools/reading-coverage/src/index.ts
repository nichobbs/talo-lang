/**
 * Talo reading-coverage harness (docs/0013).
 *
 * Measures how much of a reference concept set (data/reading-reference.tsv — the
 * IDS spine) the lexicon already EXPRESSES, and emits the uncovered concepts as
 * the prioritised mint queue. This is the instrument the 98 %-coverage scaling
 * target is defined against (0013 §3).
 *
 * "Expressible" is judged by an English→Talo index built from the dictionary's
 * gloss keywords: a reference concept is covered if any of its English synonyms
 * (the field is comma/semicolon/slash-separated, sometimes with a "(…)" note)
 * matches a Talo entry's gloss, or its head word does, or it is a grammatical
 * word Talo renders structurally. This is a deliberate LOWER BOUND — exact gloss
 * match misses synonyms (`big`/`large`) and counts derivable concepts (`third` =
 * number+`-pe`, `sell` = buy+`-ku`) as uncovered. The uncovered list is therefore
 * a *candidate* queue: it is triaged (root / derived / compound) before minting,
 * per 0013 §3. The trend line, driven upward batch over batch, is the signal.
 *
 * Pure; the CLI owns I/O. Zero dependencies.
 */

/** A reference concept (data/reading-reference.tsv). */
export interface RefConcept {
  id: string;
  english: string;
  chapter: string;
  gloss: string;
}

/** A dictionary entry, as far as coverage needs it. */
export interface CovEntry {
  gloss: string;
  keywords?: string[];
}

/**
 * Grammatical English words Talo expresses STRUCTURALLY (no content root needed):
 * articles, copula, pronouns, core conjunctions/quantifiers/numerals, etc. These
 * count as covered. Kept deliberately small and high-confidence.
 */
export const STRUCTURAL = new Set(
  ("the a an of is are am was were be been being this that these those it its " +
   "i you he she we they me him her them my your his their our and or not no yes " +
   "to at in on for from with by about as than more less most one two three four " +
   "five six seven eight nine ten zero who what where when why how which if then so")
    .split(/\s+/),
);

/** Normalise an English term to a comparable token form. */
const norm = (s: string): string => s.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z\s]/g, "").trim();

/** Build the set of English terms the lexicon can express, from gloss keywords. */
export function buildEnglishIndex(entries: CovEntry[]): Set<string> {
  const idx = new Set<string>();
  const add = (s: string) => {
    const n = norm(s);
    if (n) idx.add(n);
  };
  for (const e of entries) {
    for (const k of e.keywords ?? []) add(k);
    for (const part of (e.gloss ?? "").split(/[/,;]/)) add(part);
  }
  return idx;
}

/** Is a reference concept expressible by the lexicon (lower-bound test)? */
export function isExpressible(english: string, index: Set<string>): boolean {
  const synonyms = english.split(/\s*[,;/]\s*/).map(norm).filter(Boolean);
  for (const syn of synonyms) {
    if (index.has(syn) || STRUCTURAL.has(syn)) return true;
    const words = syn.split(/\s+/);
    if (words.length === 1 && STRUCTURAL.has(words[0])) return true;
    // head-word match: "give birth" → "birth", "sea creature" → "creature"
    if (words.length > 1 && index.has(words[words.length - 1])) return true;
  }
  return false;
}

export interface CoverageReport {
  total: number;
  covered: number;
  pct: number;
  /** uncovered concepts (the candidate queue), in reference order. */
  missing: RefConcept[];
  /** uncovered count per chapter, desc — shows where the gaps cluster. */
  byChapter: { chapter: string; missing: number; total: number }[];
}

/** Measure lexicon coverage of the reference concept set. Pure. */
export function coverageReport(reference: RefConcept[], entries: CovEntry[]): CoverageReport {
  const index = buildEnglishIndex(entries);
  const missing: RefConcept[] = [];
  const chapTotal = new Map<string, number>();
  const chapMiss = new Map<string, number>();
  for (const c of reference) {
    chapTotal.set(c.chapter, (chapTotal.get(c.chapter) ?? 0) + 1);
    if (!isExpressible(c.english, index)) {
      missing.push(c);
      chapMiss.set(c.chapter, (chapMiss.get(c.chapter) ?? 0) + 1);
    }
  }
  const covered = reference.length - missing.length;
  const byChapter = [...chapTotal.entries()]
    .map(([chapter, total]) => ({ chapter, total, missing: chapMiss.get(chapter) ?? 0 }))
    .sort((a, b) => b.missing - a.missing);
  return {
    total: reference.length,
    covered,
    pct: reference.length ? (100 * covered) / reference.length : 0,
    missing,
    byChapter,
  };
}

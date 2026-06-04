/**
 * Talo interlinear glosser (docs/0002) — auto-produces the morpheme-by-morpheme
 * gloss line that `corpus/articles/*.md` currently writes by hand, e.g.
 *
 *   bukamaka tuyoipe tatakuto Yapanka yana
 *   earthquake-N strong-MOD hit-V Japan-N yesterday
 *
 * It is a teaching aid (read any clause aloud), a corpus-authoring aid (draft the
 * `# gloss:` line, then refine), and a coverage gate (every token must gloss —
 * an unglossable word means a typo or a word that isn't real Talo yet).
 *
 * How a token is glossed, in order:
 *   1. a closed-class GRAMMATICAL word (role marker, aspect, pronoun, copula …)
 *      → its fixed Leipzig-style label from FUNCTION_GLOSS below. These are the
 *      only words that aren't in the dictionary (they take no badge, 0002 App. B);
 *   2. a CONTENT word → its root's English gloss + a category tag from the badge
 *      it wears (`-ka` N, `-to` V, `-pe` MOD). Resolved by SURFACE FORM against
 *      the dictionary, preferring the bare root a learner knows (so `tatakuto`
 *      glosses as `hit-V`, not via the parser's over-eager `tataku → ta`);
 *   3. a PROPER NOUN (capitalised) → its English name from corpus/proper-nouns;
 *   4. anything else in the dictionary (correlatives, numerals, quantifiers,
 *      time-words) → its dictionary gloss, untagged;
 *   5. otherwise → the token marked with a trailing `?` (unglossable).
 *
 * Pure: the transform takes a dictionary + a proper-noun map in, gloss out. The
 * CLI owns I/O. Zero dependencies; reuses the parser's analyze().
 */
import { analyze } from "../../parser/src/index.ts";

/**
 * Fixed glosses for the closed-class grammatical words (0002 §4–6, App. B) — the
 * morphemes that take no badge and so never appear in the dictionary. Role
 * markers and conjunctions get readable lowercase glosses; grammatical
 * categories (aspect, number, person, …) get Leipzig-style upper-case labels.
 */
export const FUNCTION_GLOSS: Readonly<Record<string, string>> = {
  // role markers, postposed (§4)
  na: "to", lo: "at", su: "toward", fe: "from", wa: "with", we: "of",
  // aspect, post-verb (§5.1)
  li: "COMPLETIVE", wi: "PROGRESSIVE",
  // number + clusivity (§5.2–3)
  pu: "PL", sa: "INCL", fo: "EXCL",
  // pronouns (§6.1)
  mi: "I", yu: "you", te: "s/he/it",
  // negator (§6.2)
  ne: "NEG",
  // coreference (§6.8)
  sendi: "self", salin: "each.other",
  // numeral markers (0010)
  kai: "TIMES", bagi: "FRACTION",
  // question (§6.4), coordinators (§6.5), complementiser (0012), copula (§6.3)
  ke: "Q", i: "and", o: "or", ce: "that", ya: "COP",
};

/** The badge a content token wears → its interlinear category tag. */
function badgeTag(token: string): "N" | "V" | "MOD" | null {
  if (token.endsWith("ka")) return "N";
  if (token.endsWith("to")) return "V";
  if (token.endsWith("pe")) return "MOD";
  return null;
}

/** A dictionary entry, as far as the glosser needs it. */
export interface GlossEntry {
  form: string;
  gloss: string;
  keywords?: string[];
  kind: "root" | "derived" | "compound";
}

export interface GlossContext {
  byForm: Map<string, GlossEntry>;
  /** proper-noun root (lower-case) → English name, from corpus/proper-nouns.tsv. */
  proper: Map<string, string>;
}

/** Build the lookup context from dictionary entries + proper-noun rows. */
export function buildContext(entries: GlossEntry[], properRows: { root: string; source: string }[] = []): GlossContext {
  const byForm = new Map<string, GlossEntry>();
  for (const e of entries) if (!byForm.has(e.form)) byForm.set(e.form, e);
  const proper = new Map<string, string>();
  for (const r of properRows) if (r.root) proper.set(r.root.toLowerCase(), r.source);
  return { byForm, proper };
}

/** The citation gloss of an entry: its first sense, spaces → dots (Leipzig). */
function senseOf(e: GlossEntry): string {
  const first = (e.keywords && e.keywords[0]) || e.gloss.split(/\s*[/,]\s*/)[0] || e.gloss;
  return first.trim().replace(/\s+/g, ".");
}

/** Resolve a content token to its dictionary entry, preferring the bare root. */
function resolveContent(low: string, ctx: GlossContext): GlossEntry | undefined {
  const exact = ctx.byForm.get(low);
  if (exact && exact.kind === "root") return exact;
  if (/(ka|to|pe)$/.test(low)) {
    const root = ctx.byForm.get(low.slice(0, -2));
    if (root) return root;
  }
  return exact;
}

/** Gloss a single token. Never throws; an unknown word returns `token?`. */
export function glossToken(token: string, ctx: GlossContext): string {
  // strip surrounding punctuation (corpus clauses carry commas, etc.); a token
  // that is ALL punctuation glosses to itself.
  const word = token.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
  if (!word) return token;
  token = word;
  const low = token.toLowerCase();

  // 1. closed-class grammatical word.
  if (Object.prototype.hasOwnProperty.call(FUNCTION_GLOSS, low)) return FUNCTION_GLOSS[low];

  const a = analyze(low);

  // 2. content word: root gloss + category badge.
  if (a.kind === "content") {
    const tag = badgeTag(low);
    const stem = /(ka|to|pe)$/.test(low) ? low.slice(0, -2) : low;
    // the copula root `ya` surfaces as a content verb (`yato`) — gloss as COP.
    if (Object.prototype.hasOwnProperty.call(FUNCTION_GLOSS, stem)) return FUNCTION_GLOSS[stem];

    const entry = resolveContent(low, ctx);
    if (entry) return tag ? `${senseOf(entry)}-${tag}` : senseOf(entry);

    // 3. proper noun (capitalised, in the proper-noun table).
    if (token[0] !== low[0] && ctx.proper.has(stem)) {
      return tag ? `${ctx.proper.get(stem)}-${tag}` : ctx.proper.get(stem)!;
    }
    return `${stem}${tag ? "-" + tag : ""}?`;
  }

  // 4. correlatives / quantifiers / numerals / time-words — dictionary entries.
  const entry = ctx.byForm.get(low);
  if (entry) return senseOf(entry);

  // proper noun that the parser read as a function word, just in case.
  if (token[0] !== low[0] && ctx.proper.has(low)) return ctx.proper.get(low)!;

  return `${token}?`;
}

/** Gloss a whole clause; returns the space-joined gloss line. */
export function glossClause(clause: string, ctx: GlossContext): string {
  return clause
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => glossToken(t, ctx))
    .join(" ");
}

/** True if a gloss token is unresolved (ends in the `?` marker). */
export const isUnglossed = (g: string): boolean => g.endsWith("?");

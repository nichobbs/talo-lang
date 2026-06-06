/**
 * Talo translation exercises — the graded bank + grader + generator behind the
 * web "Practice" tool.
 *
 *  - parse + validate the authored bank (data/exercises.tsv); every Talo sentence
 *    must pass the parser and use only real lexicon roots.
 *  - GRADE a learner answer in either direction, reusing the translator:
 *      comprehension (Talo→English): does the answer mean the reference?
 *      production  (English→Talo): is the answer grammatical AND does it
 *                  back-translate to the reference meaning?
 *  - GENERATE higher-level items from grammar templates + leveled vocab, with the
 *    translator supplying the reference English — deterministic, so the built
 *    deck is a stable, gateable artifact.
 *
 * Zero deps (Node ≥ 22.6). Pure; file IO + dictionary loading live in cli.ts.
 */
import { validate } from "../../parser/src/validator.ts";
import { analyze } from "../../parser/src/morphology.ts";
import { toIPA } from "../../ipa/src/index.ts";
import { translate, type GlossContext } from "../../translator/src/index.ts";

/** Per-token tooltip data shipped to the web Practice page. */
export interface TokenInfo { s: string; gloss: string; pos: string; ipa: string }

export interface Exercise {
  id: string;
  level: number;
  skills: string[];
  talo: string;
  english: string;
  generated?: boolean;
  /** enriched by buildDeck for the web: per-token tooltips + acceptable answers. */
  tokens?: TokenInfo[];
  accept?: string[];
}

/** Learner-friendly glosses for the closed-class particles (not in the dictionary). */
const FRIENDLY: Record<string, string> = {
  na: "to (recipient)", lo: "at / in", su: "toward", fe: "from", wa: "with / by", we: "of",
  li: "(completed / past)", wi: "(ongoing)", pu: "(plural)", sa: "(we, incl.)", fo: "(we, excl.)",
  mi: "I / me", yu: "you", te: "he / she / it", ne: "not", ke: "(question)",
  i: "and", o: "or", ce: "that", ya: "be", kena: "(passive)", sendi: "-self", salin: "each other",
  sana: "very", ti: "also", dake: "only", tai: "too", lebi: "more", ini: "this", itu: "that",
  hi: "yes", no: "no", kai: "(times)", bagi: "(fraction)", mae: "before", ato: "after",
};
const POS_NAME: Record<string, string> = { n: "noun", v: "verb", mod: "modifier", num: "number", fun: "particle" };

/** Describe one surface token for a tooltip: gloss + part of speech + IPA. */
export function tokenInfo(raw: string, ctx: GlossContext): TokenInfo {
  const low = raw.replace(/[.,!?;:]/g, "").toLowerCase();
  const ipa = low ? toIPA(low, true) : "";
  const first = (g: string) => g.split(/\s*[/,(]\s*/)[0].trim() || g;
  const a = analyze(low);
  if (a.category) { // badged content word
    const e = ctx.byForm.get(low.slice(0, -2)) ?? ctx.byForm.get(low);
    const gloss = e ? first(e.gloss) : (ctx.proper.get(low.slice(0, -2)) ?? low);
    return { s: raw, gloss, pos: a.category, ipa };
  }
  const e = ctx.byForm.get(low);                 // correlative / numeral / other dict entry
  if (e) return { s: raw, gloss: first(e.gloss), pos: POS_NAME[(e as any).pos] ?? "word", ipa };
  if (FRIENDLY[low]) return { s: raw, gloss: FRIENDLY[low], pos: "particle", ipa };
  return { s: raw, gloss: "?", pos: "?", ipa };
}

/** Parse data/exercises.tsv into rows (skips comments + header). */
export function parseBank(tsv: string): Exercise[] {
  const out: Exercise[] = [];
  for (const line of tsv.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || line.startsWith("id\t")) continue;
    const [id, level, skills, talo, english] = line.split("\t");
    if (!id || !talo) continue;
    out.push({ id, level: Number(level), skills: skills ? skills.split(",") : [], talo, english });
  }
  return out;
}

/** Validate the bank: each Talo sentence parses (no error issues) with known roots. */
export function validateBank(bank: Exercise[], knownRoots: Set<string>): { id: string; codes: string[] }[] {
  const bad: { id: string; codes: string[] }[] = [];
  for (const ex of bank) {
    const r = validate(ex.talo, { knownRoots });
    const errs = r.issues.filter((x) => x.severity === "error");
    if (errs.length) bad.push({ id: ex.id, codes: errs.map((e) => e.code) });
  }
  return bad;
}

/** Normalise English for grading: lowercase, drop articles/punctuation, collapse. */
export function normalizeEn(s: string): string {
  return s.toLowerCase().replace(/[.,!?;:]/g, " ").replace(/\b(a|an|the)\b/g, " ")
    .replace(/\s+/g, " ").trim();
}
/** Normalise Talo for comparison: lowercase, drop punctuation, collapse. */
export function normalizeTalo(s: string): string {
  return s.toLowerCase().replace(/[.,!?;:]/g, " ").replace(/\s+/g, " ").trim();
}

export interface Grade { correct: boolean; expected: string; detail?: string }

/** Grade a comprehension answer (learner typed English for a Talo prompt). */
export function gradeComprehension(answer: string, ex: Exercise, ctx: GlossContext): Grade {
  const targets = [ex.english, translate(ex.talo, ctx)].map(normalizeEn);
  const a = normalizeEn(answer);
  const correct = targets.includes(a) || contentMatch(a, targets);
  return { correct, expected: ex.english };
}

/** Grade a production answer (learner typed Talo for an English prompt). */
export function gradeProduction(answer: string, ex: Exercise, ctx: GlossContext, knownRoots: Set<string>): Grade {
  const grammatical = validate(answer, { knownRoots }).issues.every((x) => x.severity !== "error");
  if (!grammatical) return { correct: false, expected: ex.talo, detail: "not grammatical" };
  // exact reference, or same meaning by back-translation
  if (normalizeTalo(answer) === normalizeTalo(ex.talo)) return { correct: true, expected: ex.talo };
  const mine = normalizeEn(translate(answer, ctx));
  const ref = [ex.english, translate(ex.talo, ctx)].map(normalizeEn);
  const correct = ref.includes(mine) || contentMatch(mine, ref);
  return { correct, expected: ex.talo, detail: correct ? "equivalent meaning" : "different meaning" };
}

/** Loose match: every content word of a target appears in the answer (any order). */
function contentMatch(answer: string, targets: string[]): boolean {
  const aw = new Set(answer.split(" ").filter(Boolean));
  return targets.some((t) => {
    const tw = t.split(" ").filter(Boolean);
    return tw.length > 0 && tw.every((w) => aw.has(w));
  });
}

// ---------- generator (higher levels) ----------

/** Leveled vocab pools (verified lexicon roots). */
const SUBJ = ["gou", "neko", "hito", "toto", "adami", "wanita", "iha"];
const VERB = ["kan", "makan", "mau", "suki", "baca"];
const OBJ = ["pani", "cakula", "hon", "gou", "neko"];

/**
 * Deterministically generate exercises for a template level (7 = SVO present,
 * 8 = SVO past). Enumerates subject×verb×object in fixed order and takes `n`,
 * with the translator supplying the reference English.
 */
export function generate(level: number, n: number, ctx: GlossContext): Exercise[] {
  const out: Exercise[] = [];
  let k = 0;
  outer: for (const s of SUBJ) for (const v of VERB) for (const o of OBJ) {
    if (s === o) continue;
    const aspect = level >= 8 ? " li" : "";
    const cap = (w: string) => w[0].toUpperCase() + w.slice(1);
    const talo = `${cap(s)}ka ${v}to${aspect} ${o}ka.`;
    out.push({
      id: `GEN-${level}-${String(++k).padStart(3, "0")}`,
      level, skills: level >= 8 ? ["SVO", "aspect"] : ["SVO"],
      talo, english: translate(talo, ctx), generated: true,
    });
    if (out.length >= n) break outer;
  }
  return out;
}

/** Enrich one exercise with per-token tooltips + the acceptable-answer set. */
function enrich(ex: Exercise, ctx: GlossContext): Exercise {
  const tokens = ex.talo.split(/\s+/).filter(Boolean).map((t) => tokenInfo(t, ctx));
  const accept = [...new Set([normalizeEn(ex.english), normalizeEn(translate(ex.talo, ctx))])].filter(Boolean);
  return { ...ex, tokens, accept };
}

/**
 * Build the full deck for the web: authored bank + a fixed set of generated
 * higher-level items, each enriched with tooltips + acceptable answers. Pure and
 * deterministic, so the committed data/exercises.json is a stable artifact.
 */
export function buildDeck(bank: Exercise[], ctx: GlossContext): Exercise[] {
  return [...bank, ...generate(7, 8, ctx), ...generate(8, 8, ctx)].map((ex) => enrich(ex, ctx));
}

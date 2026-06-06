/**
 * Talo → English translator — a rule-based transfer engine.
 *
 * Talo is near-ideal for rule-based MT: every content word wears a POS badge,
 * the function-word class is closed, morphology is regular, and forms are
 * collision-checked (no lexical ambiguity). So translation is:
 *
 *   1. LEX   — gloss each token (reuse the glosser + the 14k-entry dictionary,
 *              which already carries roots, derivations and compounds).
 *   2. PARSE — classify each token (reuse the parser's morphology analyzer):
 *              content N/V/MOD, function word + role, correlative, numeral.
 *   3. TRANSFER — reorder Talo→English (postposed determiners → prenominal,
 *              postpositions → prepositions, fluid/SOV verb → SVO) and realise
 *              function words (aspect → tense, `ne` → not, `pu` → plural,
 *              `kena` → passive, correlatives → wh-words, numerals → digits).
 *
 * Output is understandable, deliberately literal English — a reading aid and the
 * grader behind the web translation exercises, not literary translation.
 *
 * Zero dependencies (Node ≥ 22.6, --experimental-strip-types). Pure: all file IO
 * lives in cli.ts; `translate()` takes a prebuilt context so it is testable and
 * usable at the web build step.
 */
import { analyze } from "../../parser/src/morphology.ts";
import { tokenize } from "../../parser/src/validator.ts";
import { buildContext, type GlossContext, type GlossEntry } from "../../glosser/src/index.ts";

export type { GlossEntry, GlossContext };
export { buildContext };

/** Numeral morpheme → value (0019 Major-System set + powers of ten). */
const NUM: Record<string, number> = {
  so: 0, ta: 1, nu: 2, mo: 3, hu: 4, le: 5, co: 6, ki: 7, fa: 8, po: 9,
  diko: 10, samu: 100, sebu: 1000, milion: 1_000_000,
};
const NUM_MORPHS = Object.keys(NUM).sort((a, b) => b.length - a.length); // longest-first

/** Segment a (possibly fused) numeral token into morphemes, or null. */
function numeralMorphs(t: string): number[] | null {
  let s = t;
  const out: number[] = [];
  while (s.length) {
    const m = NUM_MORPHS.find((n) => s.startsWith(n));
    if (!m) return null;
    out.push(NUM[m]);
    s = s.slice(m.length);
  }
  return out.length ? out : null;
}

/** Evaluate Talo numeral morphemes to an integer (decimal place-value). */
function numeralValue(morphs: number[]): number {
  let total = 0, current = 0;
  for (const v of morphs) {
    if (v >= 1000) { total += (current || 1) * v; current = 0; }
    else if (v >= 10) { current = (current || 1) * v; }
    else { current += v; }
  }
  return total + current;
}

/**
 * Consume a run of consecutive numeral tokens from `start` and evaluate them as
 * one number — Talo writes large numbers as space-separated place groups
 * (`nu diko` = 20, `nu sebu nu diko le` = 2025). Returns null if `start` is not a
 * numeral. (A token that segments wholly into numeral morphemes and is not a
 * badged content word is a numeral — same rule as the parser.)
 */
function numeralRun(tokens: string[], start: number): { value: number; end: number } | null {
  const morphs: number[] = [];
  let j = start;
  while (j < tokens.length) {
    const t = tokens[j].toLowerCase();
    const m = numeralMorphs(t);
    if (!m || analyze(t).kind === "content") break;
    morphs.push(...m);
    j++;
  }
  return j === start ? null : { value: numeralValue(morphs), end: j };
}

/** Correlative grid (0002 §6.7): stem (who/this/some/no/every…) × category. */
const CORR_STEM: Record<string, string> = {
  se: "wh", ini: "this", itu: "that", ba: "some", ha: "no", o: "every",
};
const CORR_CAT: Record<string, { wh: string; other: string }> = {
  la: { wh: "who", other: "one" },        // person
  ko: { wh: "what", other: "thing" },     // thing
  lo: { wh: "where", other: "where" },    // place
  no: { wh: "when", other: "time" },      // time
  fu: { wh: "why", other: "reason" },     // reason
  wa: { wh: "how", other: "way" },        // way
  mu: { wh: "how much", other: "amount" },// amount
};
function correlativeEnglish(t: string): string | null {
  for (const cat of Object.keys(CORR_CAT)) {
    if (!t.endsWith(cat)) continue;
    const stem = t.slice(0, -cat.length);
    if (!CORR_STEM[stem]) continue;
    const c = CORR_CAT[cat];
    if (stem === "se") return c.wh;                       // sela→who, selo→where
    if (stem === "ini" || stem === "itu") return `${CORR_STEM[stem]} ${c.other}`; // inino→this time
    return `${CORR_STEM[stem]}${c.other === "one" ? "one" : " " + c.other}`;       // hala→no one, hano→no time
  }
  return null;
}

/** Plain-English function-word lexicon (richer than the Leipzig gloss tags). */
const FW: Record<string, string> = {
  // pronouns
  mi: "I", yu: "you", te: "it",
  // role markers → prepositions
  na: "to", lo: "in", su: "to", fe: "from", wa: "with", we: "of",
  // demonstratives / answers
  ini: "this", itu: "that", hi: "yes", no: "no",
  // degree / focus
  sana: "very", ti: "also", dake: "only", tai: "too", lebi: "more",
  // quantifiers
  ote: "all", ingi: "many", kidogo: "a little", badi: "few", hakuna: "no",
  sukuna: "scarce", kila: "every", cuku: "enough", setenga: "half", hoka: "other",
  // time-words
  leo: "today", keso: "tomorrow", yana: "yesterday", inino: "now", masi: "still",
  toki: "then", lagia: "again", mungi: "maybe", mae: "before", ato: "after",
  // connectives
  ma: "but", fi: "if", andai: "if", sababu: "because", sehinga: "so", walau: "although",
  i: "and", o: "or", ce: "that",
  // coreference
  sendi: "itself", salin: "each other",
};

/** Postposed role markers that become English prepositions. */
const PREP: Record<string, string> = { na: "to", lo: "in", su: "to", fe: "from", wa: "with", we: "of" };

/** A small irregular past/-ing table; everything else gets regular orthography. */
const PAST: Record<string, string> = {
  be: "was", have: "had", do: "did", go: "went", come: "came", see: "saw",
  eat: "ate", give: "gave", take: "took", make: "made", say: "said", run: "ran",
  know: "knew", grow: "grew", fall: "fell", begin: "began", break: "broke",
  build: "built", buy: "bought", catch: "caught", find: "found", hold: "held",
  send: "sent", think: "thought", fight: "fought", read: "read", rise: "rose",
};
function pastTense(v: string): string {
  if (PAST[v]) return PAST[v];
  if (/e$/.test(v)) return v + "d";
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ied";
  return v + "ed";
}
function gerund(v: string): string {
  if (/[^aeiou]e$/.test(v)) return v.slice(0, -1) + "ing";
  return v + "ing";
}

// ---------- token classification ----------

type Unit =
  | { t: "np"; words: string; prep?: string }
  | { t: "verb"; verb: string; neg: boolean; aspect?: "li" | "wi" }
  | { t: "conn"; word: string }            // connective / adverbial / time-word
  | { t: "cop" }                           // copula ya
  | { t: "q" };                            // question particle

/** The first English sense of a dictionary gloss ("person / human" → "person"). */
function firstSense(gloss: string): string {
  return gloss.split(/\s*[/,(]\s*/)[0].trim() || gloss;
}

/**
 * Resolve a content token to its clean English word, against the dictionary's
 * byForm map (roots keyed bare; derivations/compounds keyed by full surface).
 *
 * A badged content root never surfaces bare, so for a badged token the badge-
 * stripped ROOT wins over an exact same-spelled headword (glosser §resolveContent:
 * `kunato` = kuna+V "exist", not the `kunato` "lock" root). Only if no stem-root
 * exists do we take the exact surface form (a derived/compound word).
 */
function contentEnglish(token: string, ctx: GlossContext): string {
  const low = token.toLowerCase();
  if (/(ka|to|pe)$/.test(low)) {
    const root = low.slice(0, -2);
    const stem = ctx.byForm.get(root);
    if (stem) return firstSense(stem.gloss);
    if (ctx.proper.has(root)) return ctx.proper.get(root)!;   // proper noun + badge (Yapanka→Japan)
    const exact = ctx.byForm.get(low);
    if (exact) return firstSense(exact.gloss);
  } else {
    const exact = ctx.byForm.get(low);
    if (exact) return firstSense(exact.gloss);
  }
  const a = analyze(low);                       // last resort: bare root gloss
  if (a.root) { const re = ctx.byForm.get(a.root); if (re) return firstSense(re.gloss); }
  if (ctx.proper.has(low)) return ctx.proper.get(low)!;
  return low;
}

const ASPECT = new Set(["li", "wi"]);
const DETERMINER_FW = new Set([
  "ini", "itu", "ote", "ingi", "kidogo", "badi", "hakuna", "sukuna",
  "kila", "cuku", "setenga", "hoka",
]);
/** Quantifiers that imply a plural head noun (many houses, all people). */
const PLURAL_QUANT = new Set(["ote", "ingi", "badi", "sukuna"]);
/** The copula root `ya` ("be"), which surfaces as the verb `yato`. */
function verbEnglish(low: string, ctx: GlossContext): string {
  return analyze(low).root === "ya" ? "be" : contentEnglish(low, ctx);
}

/**
 * Parse a token list into ordered units, assembling noun phrases (head noun +
 * postposed determiners/numerals/modifiers, optionally closed by a postposition).
 */
function unitize(tokens: string[], ctx: GlossContext): Unit[] {
  const units: Unit[] = [];
  let i = 0;
  const isNumeralToken = (t: string) => numeralMorphs(t) !== null && analyze(t).kind !== "content";

  while (i < tokens.length) {
    const tok = tokens[i];
    const low = tok.toLowerCase();
    const a = analyze(low);

    // negator + verb
    if (a.functionRole === "negator") {
      // attach to the next verb if present
      const next = tokens[i + 1] ? analyze(tokens[i + 1].toLowerCase()) : null;
      if (next && next.category === "verb") {
        const v = verbEnglish(tokens[i + 1].toLowerCase(), ctx);
        let aspect: "li" | "wi" | undefined;
        if (tokens[i + 2] && ASPECT.has(tokens[i + 2].toLowerCase())) aspect = tokens[i + 2].toLowerCase() as "li" | "wi";
        units.push({ t: "verb", verb: v, neg: true, aspect });
        i += aspect ? 3 : 2;
        continue;
      }
      units.push({ t: "conn", word: "not" });
      i += 1;
      continue;
    }

    // verb (content -to)
    if (a.category === "verb") {
      let aspect: "li" | "wi" | undefined;
      if (tokens[i + 1] && ASPECT.has(tokens[i + 1].toLowerCase())) aspect = tokens[i + 1].toLowerCase() as "li" | "wi";
      units.push({ t: "verb", verb: verbEnglish(low, ctx), neg: false, aspect });
      i += aspect ? 2 : 1;
      continue;
    }

    if (low === "ya") { units.push({ t: "cop" }); i += 1; continue; }
    if (a.functionRole === "question") { units.push({ t: "q" }); i += 1; continue; }
    if (a.functionRole === "voice") { units.push({ t: "conn", word: "(passive)" }); i += 1; continue; }

    // noun-phrase head: pronoun, content noun, correlative, or bare numeral
    const corr = a.kind === "correlative" ? correlativeEnglish(low) : null;
    const isHead =
      a.functionRole === "pronoun" || a.category === "noun" || corr || isNumeralToken(low);
    if (isHead) {
      let det = "", num = "", adj = "", plural = false, head = "";
      if (isNumeralToken(low)) {
        const r = numeralRun(tokens, i)!; num = String(r.value); plural = r.value !== 1; i = r.end;
      } else {
        if (a.functionRole === "pronoun") head = FW[low];
        else if (corr) head = corr;
        else head = contentEnglish(low, ctx);
        i += 1;
      }

      // absorb postposed modifiers
      while (i < tokens.length) {
        const nl = tokens[i].toLowerCase();
        const na = analyze(nl);
        if (na.functionRole === "number" && nl === "pu") { plural = true; i += 1; continue; }
        if (isNumeralToken(nl)) { const r = numeralRun(tokens, i)!; num = String(r.value); plural = r.value !== 1; i = r.end; continue; }
        if (DETERMINER_FW.has(nl)) { det = FW[nl] || nl; if (PLURAL_QUANT.has(nl)) plural = true; i += 1; continue; }
        if (na.category === "modifier") { adj = (adj ? adj + " " : "") + contentEnglish(nl, ctx); i += 1; continue; }
        break;
      }

      let noun = head;
      if (plural && noun) noun = pluralize(noun);
      const words = [det, num, adj, noun].filter(Boolean).join(" ");

      // postposition closes the NP into an oblique
      const after = tokens[i] ? tokens[i].toLowerCase() : "";
      if (PREP[after]) { units.push({ t: "np", words, prep: PREP[after] }); i += 1; }
      else units.push({ t: "np", words });
      continue;
    }

    // standalone function word / connective / time-word
    if (FW[low]) { units.push({ t: "conn", word: FW[low] }); i += 1; continue; }

    // unknown — keep, flag
    units.push({ t: "conn", word: tok });
    i += 1;
  }
  return units;
}

function pluralize(n: string): string {
  if (/(s|x|z|ch|sh)$/.test(n)) return n + "es";
  if (/[^aeiou]y$/.test(n)) return n.slice(0, -1) + "ies";
  return n + "s";
}

function realizeVerb(u: Extract<Unit, { t: "verb" }>): string {
  const base = u.verb;
  if (base === "be") {                                 // copula `yato`
    if (u.aspect === "li") return u.neg ? "was not" : "was";
    return u.neg ? "is not" : "is";
  }
  if (u.aspect === "wi") return `${u.neg ? "is not" : "is"} ${gerund(base)}`;
  if (u.aspect === "li") return u.neg ? `did not ${base}` : pastTense(base);
  return u.neg ? `do not ${base}` : base;
}

/**
 * Translate one Talo clause to English. Strategy: subject = first NP; main verb =
 * first verb unit; any NP between subject and verb (SOV) moves after the verb;
 * obliques and trailing material keep order; leading/!-NP connectives front.
 */
export function translateClause(clause: string, ctx: GlossContext): string {
  const tokens = tokenize(clause).filter(Boolean);
  if (!tokens.length) return "";
  const question = tokens.some((t) => t.toLowerCase() === "ke") || /\?\s*$/.test(clause);
  const units = unitize(tokens, ctx);

  const out: string[] = [];
  const verbIdx = units.findIndex((u) => u.t === "verb");

  // leading connectives (before the subject)
  let k = 0;
  while (k < units.length && units[k].t === "conn") { out.push((units[k] as any).word); k++; }

  if (verbIdx === -1) {
    // verbless: NP (cop) NP  → "NP is NP", else join
    const nps = units.filter((u) => u.t === "np") as Extract<Unit, { t: "np" }>[];
    if (nps.length >= 2) return cap([...out, np(nps[0]), "is", ...nps.slice(1).map(np)].join(" "), question);
    if (nps.length === 1) return cap([...out, np(nps[0])].join(" "), question);
    return cap(out.join(" "), question);
  }

  const subject = units.slice(k, verbIdx).filter((u) => u.t === "np") as Extract<Unit, { t: "np" }>[];
  const preVerbConn = units.slice(k, verbIdx).filter((u) => u.t === "conn") as Extract<Unit, { t: "conn" }>[];
  const verb = units[verbIdx] as Extract<Unit, { t: "verb" }>;
  const rest = units.slice(verbIdx + 1);

  // subject: first NP; any further pre-verb NPs are SOV objects → move post-verb
  const subjNP = subject[0];
  const movedObjects = subject.slice(1);

  if (subjNP) out.push(np(subjNP));
  for (const c of preVerbConn) out.push(c.word);
  out.push(realizeVerb(verb));
  for (const o of movedObjects) out.push(np(o));
  for (const u of rest) {
    if (u.t === "np") out.push(np(u));
    else if (u.t === "conn") out.push(u.word);
    else if (u.t === "cop") out.push("is");
    else if (u.t === "verb") out.push("to " + (u as any).verb); // serial verb
  }
  return cap(out.filter(Boolean).join(" "), question);
}

function np(u: Extract<Unit, { t: "np" }>): string {
  return u.prep ? `${u.prep} ${u.words}` : u.words;
}

function cap(s: string, question: boolean): string {
  let r = s.trim().replace(/\s+/g, " ");
  if (!r) return "";
  r = r[0].toUpperCase() + r.slice(1);
  return r + (question ? "?" : ".");
}

/** Translate a whole sentence (split on commas into clauses, rejoin). */
export function translate(sentence: string, ctx: GlossContext): string {
  const parts = sentence.split(/\s*,\s*/).filter(Boolean);
  if (parts.length <= 1) return translateClause(sentence, ctx);
  const clauses = parts.map((p, idx) => {
    const t = translateClause(p, ctx);
    return idx === 0 ? t : t.replace(/[.?]$/, "").replace(/^./, (c) => c.toLowerCase());
  });
  // join: first clause keeps terminal punctuation from the last
  const tail = /\?\s*$/.test(sentence) || sentence.includes(" ke") ? "?" : ".";
  return clauses.map((c) => c.replace(/[.?]$/, "")).join(", ") + tail;
}

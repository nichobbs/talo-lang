/**
 * Talo coverage statistics (docs/0003 §7b, 0006).
 *
 * Reports the health of the dataset along three axes:
 *
 *   1. DONOR-FAMILY BALANCE — the blend rubric caps any one source family at
 *      ≤25% (0003 §7b). Family is recorded in free text (rationale/notes), so we
 *      attribute it best-effort: prefer the canonical family word in the notes
 *      (Bantu/Japonic/Austronesian/…), else the donor language in the rationale,
 *      after stripping any "(was …)" REJECTED-source aside (those name a source
 *      that was replaced, not the current one — a trap that otherwise inflates
 *      Romance/Latin). Forms whose family can't be recovered (the Phase-5b
 *      "blend; src 'X'" rows) land in UNATTRIBUTED and are reported honestly.
 *
 *   2. TIER × DOMAIN COVERAGE — how the concept list spreads across frequency
 *      tiers and semantic domains (from concepts.tsv).
 *
 *   3. GATE HEALTH — structural counts: concepts vs forms, coined/derived, and
 *      whether every concept has a form.
 *
 * The cap check is SOUND in one direction: a family's TRUE share is at least its
 * attributed share (the unattributed forms can only add to it), so an attributed
 * share ≥25% is a *provable* cap violation. We can't prove compliance while
 * forms are unattributed, but we can prove a breach — and that's what --check
 * gates on. Pure; the CLI owns I/O. Zero dependencies.
 */

/** A lexicon row (data/lexicon.tsv). */
export interface LexRow {
  id: string;
  form: string;
  source: string;
  rationale: string;
  notes: string;
}

/** A concept row (data/concepts.tsv) — only the fields we tally. */
export interface ConRow {
  id: string;
  domain: string;
  tier: string;
  /** "yes" if the concept is a root to be minted; "no" if it's derivable. */
  is_root: string;
}

/** The ≤25% blend-rubric cap (0003 §7b). */
export const FAMILY_CAP_PCT = 25;

/**
 * Source-family signatures, most specific first. Each maps a regex (matched
 * against the canonical-family notes, then the donor-language rationale) to a
 * family name. Order matters only where one text could match two — list the
 * intended winner earlier.
 */
export const FAMILY_SIGNATURES: ReadonlyArray<readonly [RegExp, string]> = [
  [/bantu|swahili/i, "Bantu"],
  [/austronesian|indonesian|malay|tagalog|filipino/i, "Austronesian"],
  [/japonic|japanese/i, "Japonic"],
  [/indo-aryan|hindi|sanskrit|urdu|bengali/i, "Indo-Aryan"],
  [/sinitic|chinese|mandarin|cantonese/i, "Sinitic"],
  [/semitic|arabic|hebrew/i, "Semitic"],
  [/slavic|russian|polish/i, "Slavic"],
  [/dravidian|tamil|telugu|kannada/i, "Dravidian"],
  [/koreanic|korean/i, "Koreanic"],
  [/turkic|turkish/i, "Turkic"],
  [/iranian|persian|farsi/i, "Iranian"],
  [/hellenic|greek/i, "Hellenic"],
  [/romance|latin|spanish|italian|portuguese|french/i, "Romance"],
  [/germanic|english|german|dutch/i, "Germanic"],
];

/** Strip "(was …)" rejected-source asides — they name a replaced donor. */
const stripRejected = (s: string): string => (s || "").replace(/\(was[^)]*\)/gi, "");

/**
 * Attribute a lexicon row to a source family. COIN→"coined", DERIV→"derived";
 * otherwise the canonical family word in the notes wins, then the donor language
 * in the rationale; failing both, "UNATTRIBUTED".
 */
export function attributeFamily(row: LexRow): string {
  if (row.source === "COIN") return "coined";
  if (row.source === "DERIV") return "derived";
  const notes = stripRejected(row.notes);
  const rationale = stripRejected(row.rationale);
  for (const [re, name] of FAMILY_SIGNATURES) if (re.test(notes)) return name;
  for (const [re, name] of FAMILY_SIGNATURES) if (re.test(rationale)) return name;
  return "UNATTRIBUTED";
}

export interface FamilyShare {
  family: string;
  count: number;
  /** share of the DONOR-sourced total (excludes coined + derived). */
  pctOfDonor: number;
}

export interface CoverageReport {
  forms: number;
  concepts: number;
  /** forms attributed to a real donor source (everything but coined/derived). */
  donorSourced: number;
  coined: number;
  derived: number;
  unattributed: number;
  /** every family (incl. UNATTRIBUTED), share of donorSourced, desc by count. */
  families: FamilyShare[];
  /** families whose ATTRIBUTED share already meets/exceeds the cap — provable breaches. */
  provenOverCap: FamilyShare[];
  tiers: { tier: string; count: number }[];
  domains: { domain: string; count: number }[];
  /** is_root=no concepts with no form — expected (derived per the pruning policy). */
  derivableWithoutForm: string[];
  /** is_root=yes concepts with no form — a REAL coverage hole (gate-worthy). */
  rootsWithoutForm: string[];
}

/** Build the full coverage report from the lexicon + concept rows. Pure. */
export function buildReport(lex: LexRow[], con: ConRow[]): CoverageReport {
  const famCount = new Map<string, number>();
  for (const r of lex) {
    const f = attributeFamily(r);
    famCount.set(f, (famCount.get(f) ?? 0) + 1);
  }
  const coined = famCount.get("coined") ?? 0;
  const derived = famCount.get("derived") ?? 0;
  const unattributed = famCount.get("UNATTRIBUTED") ?? 0;
  const donorSourced = lex.length - coined - derived;

  const families: FamilyShare[] = [...famCount.entries()]
    .filter(([f]) => f !== "coined" && f !== "derived")
    .map(([family, count]) => ({
      family,
      count,
      pctOfDonor: donorSourced ? (100 * count) / donorSourced : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const provenOverCap = families.filter(
    (f) => f.family !== "UNATTRIBUTED" && f.pctOfDonor >= FAMILY_CAP_PCT,
  );

  const tierCount = new Map<string, number>();
  const domainCount = new Map<string, number>();
  for (const c of con) {
    tierCount.set(c.tier, (tierCount.get(c.tier) ?? 0) + 1);
    domainCount.set(c.domain, (domainCount.get(c.domain) ?? 0) + 1);
  }
  const tiers = [...tierCount.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([tier, count]) => ({ tier, count }));
  const domains = [...domainCount.entries()].sort((a, b) => b[1] - a[1]).map(([domain, count]) => ({ domain, count }));

  const haveForm = new Set(lex.map((r) => r.id));
  const withoutForm = con.filter((c) => !haveForm.has(c.id));
  const derivableWithoutForm = withoutForm.filter((c) => c.is_root !== "yes").map((c) => c.id);
  const rootsWithoutForm = withoutForm.filter((c) => c.is_root === "yes").map((c) => c.id);

  return {
    forms: lex.length,
    concepts: con.length,
    donorSourced,
    coined,
    derived,
    unattributed,
    families,
    provenOverCap,
    tiers,
    domains,
    derivableWithoutForm,
    rootsWithoutForm,
  };
}

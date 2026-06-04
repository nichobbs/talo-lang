/**
 * Talo SRS (spaced-repetition) deck generator.
 *
 * Turns the dictionary into a spaced-repetition study deck — the kind a learner
 * imports into Anki or a flashcard app. Two design choices make it a *teachable*
 * deck rather than a data dump:
 *
 *   1. SCOPE = the teachable core. Only acategorial ROOTS (and, optionally, the
 *      curated idiomatic compounds) become cards. The ~11k generated derivations
 *      are predictable from a root + the badge/affix rules (docs/0002, 0007), so
 *      drilling them as flashcards would be noise — the learner studies the root
 *      and the rules, not every paradigm cell.
 *   2. ORDER = frequency tier first. Cards come out tier 1 → 3 (core vocabulary
 *      before the long tail), then alphabetically, so an importer that preserves
 *      order introduces the highest-value words first.
 *
 * Each card carries the Talo form, its IPA, the English gloss, the conventional
 * badge forms (noun/verb/modifier), domain, tier, and one attested example from
 * the corpus when available — context that makes a card learnable, not just a
 * bare pair. The transformation is pure (entries in → cards out); the CLI owns
 * the I/O and the Anki/JSON serialisation.
 *
 * Zero dependencies.
 */

/** One dictionary entry, as far as the deck builder needs it. */
export interface DeckEntry {
  form: string;
  gloss: string;
  ipa?: string;
  domain: string;
  domainName: string;
  tier: number;
  kind: "root" | "derived" | "compound";
  badges?: { noun?: string; verb?: string; modifier?: string };
  examples?: { talo: string; en: string }[];
}

/** A single study card. */
export interface Card {
  talo: string;
  ipa: string;
  english: string;
  /** conventional badge forms, e.g. "bukamaka (n)" — empty for function words. */
  badges: string;
  domain: string;
  domainName: string;
  tier: number;
  kind: "root" | "compound";
  /** one attested example clause + its English, when the corpus has one. */
  example: string;
  exampleEn: string;
}

export interface DeckOptions {
  /** include cards up to and including this tier (default: all tiers). */
  maxTier?: number;
  /** also include curated idiomatic compounds (default: roots only). */
  includeCompounds?: boolean;
}

/** Render an entry's badge map as a compact "form (n), form (v)" string. */
export function badgeForms(b: DeckEntry["badges"]): string {
  if (!b) return "";
  const parts: string[] = [];
  if (b.noun) parts.push(`${b.noun} (n)`);
  if (b.verb) parts.push(`${b.verb} (v)`);
  if (b.modifier) parts.push(`${b.modifier} (mod)`);
  return parts.join(", ");
}

/**
 * Build the ordered study deck from a dictionary: teachable cards (roots, plus
 * compounds when asked), tier-ascending then alphabetical. Pure.
 */
export function buildDeck(entries: DeckEntry[], opts: DeckOptions = {}): Card[] {
  const maxTier = opts.maxTier ?? Infinity;
  const wantCompounds = opts.includeCompounds ?? false;

  const cards: Card[] = [];
  for (const e of entries) {
    const teachable = e.kind === "root" || (wantCompounds && e.kind === "compound");
    if (!teachable) continue;
    // compounds carry tier 0 (not graded); always admit them when requested.
    if (e.kind === "root" && e.tier > maxTier) continue;

    const ex = e.examples?.[0];
    cards.push({
      talo: e.form,
      ipa: e.ipa ?? "",
      english: e.gloss,
      badges: badgeForms(e.badges),
      domain: e.domain,
      domainName: e.domainName,
      tier: e.tier,
      kind: e.kind === "compound" ? "compound" : "root",
      example: ex?.talo ?? "",
      exampleEn: ex?.en ?? "",
    });
  }

  // roots tier 1→3, then compounds (tier 0) last; alphabetical within a tier.
  // Treat tier 0 (compounds) as coming AFTER graded roots, not before.
  const rank = (c: Card) => (c.tier === 0 ? Infinity : c.tier);
  cards.sort((a, b) => rank(a) - rank(b) || a.talo.localeCompare(b.talo));
  return cards;
}

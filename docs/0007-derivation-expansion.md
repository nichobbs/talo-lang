# Talo — Phase 6 (cont.): Derivation expansion — the generated derived dictionary

**Status:** Decided / data-generating. This ADR records the **methodology** for
materialising the productive derived dictionary; it adds **no new grammar** and
reverses nothing. Everything here is an application of decisions already frozen
in `docs/0002` (the badge system §1, acategorial roots §2, and the derivational
affix inventory §3.2). Low cost to change — the output is fully regenerable from
one script.

**Parent:** `docs/0002-morphology-grammar.md` §1–§3 and §9 ("Derivation … is what
lets the ~1,000–1,500 root target cover the long tail"), and `docs/0006`
(the root-lexicon scaling that produced the 1,468 roots this builds on).

-----

## 1. What this resolves

`docs/0002` fixed the machinery that multiplies the lexicon — three POS badges
and ten derivational affixes over acategorial roots — but the dataset stopped at
the **bare roots** (`data/lexicon.tsv`). A learner or tool asking "what is the
Talo word for *teacher / school / to enlarge / puppy*?" had to *derive it by hand*
from the root plus the §3.2 table. This phase **materialises** that paradigm into
a generated dictionary, `data/derived-lexicon.tsv`, so the surface words exist as
data — the concrete realisation of the "derivation explorer" anticipated in
`0002` §9.

It does **not** touch the root lexicon: `data/lexicon.tsv` remains the curated
source of truth (one row per acategorial root). The derived file is a **separate,
fully regenerable layer** (`scripts/derive-lexicon.mjs`).

-----

## 2. Method — a *selective* paradigm, not a blind cross-product

A naive expansion (every root × every affix × every badge) would be ~44,000
forms, most of them noise: the *instrument of a colour*, the *causative of a
chair*, the *place of an adjective*. `0000` rule 3 (predictability) does not mean
"generate the meaningless and predictable"; it means a learner can **trust the
words that exist**. So derivations are emitted **per `pos_hint`** (from
`data/concepts.tsv`), choosing only the slots that yield a conventional,
useful word for that class. Function words (`fun`) and numerals (`num`) are
closed-class and are **not** derived.

The dataset is built in **three layers**, each a stricter level of curation:
**A** — first-order affixes (one affix), emitted per `pos_hint` (this section);
**B** — curated second-order **affix stacks** (two affixes, §7);
**C** — curated **compounds** (§8, a separate file). The table below is the
first-order set (A), with the slots added in the second expansion marked **(+)**:

| Root class | Badges emitted | First-order affixes (then badged) |
|---|---|---|
| **verb** (`v`, 319 roots) | `-ka` act-noun, `-to` verb, `-pe` modifier | `-ki` agent · `-tu` instrument · `-bo` patient/result · `-de` place · `-ta` causative · **(+)** `-pi` inchoative ("begin to X") |
| **noun** (`n`, 891 roots) | `-ka` noun, `-pe` modifier ("of/like X"), **(+)** `-to` verb ("to use/act as X") | `-ci` diminutive · `-go` augmentative · **(+)** `-de` place ("place of X") |
| **modifier** (`mod`, 159 roots) | `-pe` modifier, `-ka` quality-noun | `-pa` quality · `-ku` opposite · `-ta` causative · `-pi` inchoative · **(+)** `-go`/`-ci` as intensity ("very X" / "X-ish", kept on `-pe`) |

**Rationale per slot.**
- **Verbs** are the richest source: agent (*teacher*), instrument (*a cutter*),
  result (*lesson*), place (*school*) and causative (*to make X happen*) are the
  cross-linguistically dominant deverbal relations (`0002` §3.2 rationale). The
  three bare badges give the act-noun and the participle-like modifier for free.
- **Nouns** take the two **size** affixes — `-ci`/`-go` apply to almost any
  concrete noun and roughly *triple* the noun stock at zero judgement
  (*dog → puppy → big hound*). The `-pe` badge gives the relational modifier
  (*of/like X*). Agent/instrument/place/causative on a bare noun are usually
  non-idiomatic, so they are left to deliberate coinage, not auto-generated.
- **Modifiers/properties** take the two **valency** affixes that turn a property
  into a verb — causative `-ta` (*make big*) and inchoative `-pi` (*become big*)
  — plus quality `-pa` (*bigness*) and opposite `-ku` (*un-big*). `-ku` makes the
  antonym half of the modifier vocabulary **additive** (`0002` §3.2), so it is
  always emitted.

The English glosses are **templated hints** built from the root gloss (e.g.
`one who 'X's; 'X'-er`); the **Talo form and the morpheme labels** (`root+affix+badge`)
are what is normative — the gloss is a teaching aid, exactly as `0002` §2.1 says
the conventional badge-gloss is a lexicon convention, not a derived fact.

-----

## 3. Gating — the same two gates, gate on the real exit code

Every generated surface form passes through the **real** collision checker
(`tools/collision-checker`), which runs the phonotactic linter (R1–R6) first and
then the homophone / near-homophone / reserved / obscenity / false-friend
screens (`0001` §2.1, `0000` §4). Each candidate is checked against:

1. the reserved grammatical words (`0002` Appendix B),
2. the full correlatives grid + the closed-class determiners/quantifiers/
   time-words the parser lists (`0002` §6.7, `0005` §3),
3. every **root** in `data/lexicon.tsv` (a derived form must not collide with a
   real root — the root wins), and
4. **every other derived form** (internal collisions caught, first-wins).

A colliding candidate is **dropped and reported**, never silently mangled. The
generator then **re-reads the file it wrote** and re-checks every line against
the same screen, failing non-zero if any written form is illegal or duplicated
(CLAUDE.md: *gate on the real exit code, re-derive from the committed file*).

**Run:**
```
node --experimental-strip-types scripts/derive-lexicon.mjs
node --experimental-strip-types tools/collision-checker/src/cli.ts --lexicon data/derived-lexicon.tsv   # independent gate
```

-----

## 4. Result (verified, exit 0)

Totals after **all three layers** (A first-order affixes + B stacks, both in
`data/derived-lexicon.tsv`; C compounds in `data/compounds.tsv`):

| | |
|---|---|
| Content roots processed | 1,369 (of 1,468; 99 are `fun`/`num`, not derived) |
| Paradigm slots considered | 10,764 |
| **Affix-derived forms (A+B)** | **10,658** → `data/derived-lexicon.tsv` |
| **Curated compounds (C)** | **32** → `data/compounds.tsv` |
| Dropped (collisions) | 106 — `OBSCENITY 60 · NEAR_HOMOPHONE 29 · HOMOPHONE 17` |
| Both gates | green — generator self-validation **10,658/10,658 clear, exit 0**; independent checker CLI exit 0 on both files |
| **Total dictionary** | 1,468 roots + 10,658 derived + 32 compounds = **12,158 surface entries** |

The **106 drops** are the screen working as intended: most are the obscenity
screen catching a root-final `ka` + the `-ka` noun badge surfacing as `…kaka`
(flagged for review, not auto-shipped), the rest are derived forms that would
homophone or near-homophone an existing root. They are listed in the generator
output and left **uncoined** rather than patched, so the derived layer never
contradicts a gate. (The first expansion shipped 6,989 forms from the
first-order high-yield slots; the second added the omitted first-order slots,
the second-order stacks (§7) and the compound seed (§8).)

-----

## 5. Costs & known limitations (recorded explicitly)

1. **Templated glosses are hints, not editorial.** A multi-word root gloss reads
   awkwardly through a template (`'do / make'-er`). Acceptable: the form +
   morpheme breakdown is normative; a future euphony/gloss polish pass can refine
   high-frequency entries (cf. the `0006` polish debt).
2. **Segmentation ambiguity for root-final affix-shaped syllables.** A root
   ending in a syllable that is also an affix (e.g. `gande` "big" ends in `-de`,
   the place affix) makes the parser's greedy analyzer over-segment
   `gandekupe` as `gan+de+ku` rather than `gande+ku`. This is an inherent
   property of the affix homonymy in `0002` §3.2 (not introduced here); the
   **surface form is correct and legal**. A lexicon-aware segmentation pass in
   the parser is the proper fix and is left as future work.
3. **Selective, not exhaustive.** The per-class paradigm (§2) deliberately omits
   low-yield slots. Coining e.g. a noun's causative remains possible **by hand**;
   it is simply not auto-generated. The set is regenerable, so widening it later
   is a one-line edit to `PARADIGM` + a re-run.
4. **Regenerate, don't hand-edit.** `data/derived-lexicon.tsv` is a build product.
   Fixes belong in `scripts/derive-lexicon.mjs` (or upstream in the root lexicon),
   followed by a re-run; the script is order-preserving so diffs stay readable.

-----

## 6. Interfaces to later phases

- **Parser/derivation explorer** (`0002` §9). This file is the dataset that tool
  can serve directly; limitation §5.2 is a concrete task for it.
- **SRS / teaching material.** The `deriv` and `morphemes` columns make the file
  a ready source of *generative* drills ("given the root and the affix, produce
  the word") rather than rote vocabulary.
- **Governance / freeze** (`0000` §6, O-6). The derived layer is **derived**, so
  the freeze boundary need only fix the **roots + the affix paradigm**; the
  surface dictionary follows automatically and need not be frozen line-by-line.

-----

## 7. Layer B — curated second-order affix stacks

The word template `ROOT(+AFFIX)*+BADGE` (`0002` §2.2) permits **affix chains**.
A blind two-affix cross-product (10 × 10) is mostly noise, so — exactly as §2
selects first-order slots — we emit only a **curated whitelist** of pairs that
name a real concept, applied to the appropriate root class. They live in the
same generator/file as layer A, tagged in the `deriv` column:

| Stack | On | Surface (root→outward) | Meaning |
|---|---|---|---|
| causative + agent | verb | `…ta+ki+ka` | one who makes/causes X; instigator |
| causative + result | verb | `…ta+bo+ka` | what is brought about by X |
| agent + place | verb | `…ki+de+ka` | place of the one who Xs |
| opposite + quality | modifier | `…ku+pa+ka` | un-X-ness |
| causative + agent | modifier | `…ta+ki+ka` | one who makes things X |

Each is gated identically (§3). The same root-final/affix segmentation ambiguity
(§5.2) applies and is again a parser concern, not a generation one.

-----

## 8. Layer C — curated compounding (seed)

Compounding (`0002` §3.1: *modifier-root(s) + head-root + one badge*) is the
largest multiplier and the most editorial. It is **open-ended N×N**, so it is the
one layer that must **not** be auto-generated as a cross-product. Instead
`scripts/derive-compounds.mjs` holds a hand-curated, **real-glossed** seed
(`data/compounds.tsv`), each entry referencing concept **IDs** (robust to form
edits) and grouped into productive sub-grids — *X-room/X-house* (bathroom,
kitchen, library, hospital, bank…), *X-person* (patient, worker, cook, elder…),
*body + pain* (headache, toothache), *eye-water* (tears), *X-light*
(sunlight, daylight), *word-book* (dictionary), and so on.

The generator applies the **§3.1 buffer-vowel rule** at an illegal `n`-seam
(`din`+`hikali` → `din‑a‑hikali` "daylight"; `hon`+`mise` → `hon‑a‑mise`
"bookstore") and is **fail-fast**: because the list is curated, *every* entry
must clear the gate — a failure aborts the build rather than shipping a mangled
compound (this is how the seam `pika`+`kama` "cook-room", which surfaces the
obscenity-screened `…kaka`, was caught and re-routed to `cook-house`). 32
compounds in the seed; it is explicitly extensible.

-----

## 9. What is **not** derivable (recorded, so it isn't retried)

- **Pronouns and function words** (`0002` §6) take **no badge** and are
  closed-class, so the badge/affix machinery does not apply. Richer pronouns
  (reflexive, reciprocal, dedicated possessive) are **new closed-class words** →
  a governance/ADR decision, not a generation pass.
- **Numeral derivations** (ordinals, multiplicatives) likewise need a *new affix*
  fixed by ADR before they can be generated; numerals are closed-class
  determiners today.
- **The correlatives grid** (`0002` §6.7) is already complete and closed (42).

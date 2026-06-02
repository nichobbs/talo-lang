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

| Root class | Badges emitted | Affixes emitted (then badged) |
|---|---|---|
| **verb** (`v`, 319 roots) | `-ka` act-noun, `-to` verb, `-pe` modifier | `-ki` agent · `-tu` instrument · `-bo` patient/result · `-de` place · `-ta` causative |
| **noun** (`n`, 891 roots) | `-ka` noun, `-pe` modifier ("of/like X") | `-ci` diminutive · `-go` augmentative |
| **modifier** (`mod`, 159 roots) | `-pe` modifier, `-ka` quality-noun | `-pa` quality · `-ku` opposite · `-ta` causative · `-pi` inchoative |

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

| | |
|---|---|
| Content roots processed | 1,369 (of 1,468; 99 are `fun`/`num`, not derived) |
| Paradigm slots considered | 7,070 |
| **Derived forms written** | **6,989** → `data/derived-lexicon.tsv` |
| Dropped (collisions) | 81 — `OBSCENITY 51 · NEAR_HOMOPHONE 19 · HOMOPHONE 11` |
| By POS | noun 4,514 · modifier 1,527 · verb 948 |
| By derivation | dim 891 · aug 891 · agent 319 · instrument 319 · result 319 · place 318 · causative 477 · quality 159 · opposite 159 · inchoative 159 · bare-badge noun 1,298 / mod 1,368 / verb 312 |
| Both gates | green — generator self-validation **6,989/6,989 clear, exit 0**; independent checker CLI **6,989/6,989 clear, 0 conflict, exit 0** |
| Total dictionary | 1,468 roots + 6,989 derived = **8,457 surface entries** |

The **81 drops** are the screen working as intended: most are the obscenity
screen catching a root-final `ka` + the `-ka` noun badge surfacing as `…kaka`
(flagged for review, not auto-shipped), the rest are derived forms that would
homophone or near-homophone an existing root. They are listed in the generator
output and left **uncoined** rather than patched, so the derived layer never
contradicts a gate.

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

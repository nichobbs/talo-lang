# Talo — 0013: reading-coverage lexicon scaling

**Status:** Accepted (maintainer decision, this session). A new **target** for the
lexicon-scaling program — the methodology of `0006` continues unchanged; what
changes is *how far we build and how we know we're done*.

**Parent:** `docs/0003-lexicon.md` (sets the original ~1,500 frequency-cutoff
target this ADR extends), `docs/0006-lexicon-scaling.md` (the batch-log method we
keep using), `docs/0002` (the derivation rules that keep root count ≪ word count),
`docs/0000` §4/§7 (frequency-cutoff scoping; adoption, not design, is the goal).

-----

## 1. Decision

Replace the fixed **~1,500-root cutoff** (`0003` §3) with a **coverage-defined
target**:

> Build the root inventory until the lexicon **expresses ≥ 98 % of running tokens**
> in a cleaned, representative reading reference (interim milestone **95 %**),
> where "express" = a known root, a legal derivation/compound, or a grammatical
> word. The root count is the *output* of hitting that line, not an input.

Why a coverage target, not a count: it ties minting to the actual goal (readable
text), is frequency-weighted by construction (the most common gaps surface most
often), and is **measurable on every commit** by the same tooling that already
gates the corpus. 98 % is Nation's comfortable-unassisted-reading threshold; 95 %
is the assisted-reading threshold and a usable interim release.

**Expected scale:** after derivation triage (below), 98 % coverage converges to
roughly **3,500–4,500 roots** — i.e. **~+2,000–3,000** on today's 1,496, *not*
+6,500. Roots ≠ reading words: Talo's acategorial roots + 10 affixes +
compounding already turn 1,496 roots into 12,416 dictionary entries (an **8.3×**
multiplier), and a large share of any reading vocabulary is derived, not minted.

## 2. Baseline (measured, this session)

- 1,496 roots; the **whole** 16-article corpus exercises only **177 distinct
  roots (11.8 %)** — confirming corpus-exposure alone is too slow to drive scale.
- Lower-bound coverage of a standard 10k English frequency list (exact-match,
  pre-triage): **56.6 % of the top 1,000, 48.0 % of the top 2,000, 36.2 % of the
  top 5,000.** True coverage is higher (exact-match misses synonyms and counts
  derivable compounds as gaps); the absolute numbers matter less than the *trend
  line* we drive up.

## 3. Engine: concerted minting, corpus as validator

A frequency-anchored program is the **engine**; the corpus is the **prioritiser
and hard validator**. The loop:

1. **Reference backbone (layered, vendored, CC-licensed).** A *cleaned,
   concept-based* reference — not raw web frequency, which is full of web-isms
   (`page`, `site`, `ebay`) and abbreviations. Drawn from **Concepticon**
   (CC-BY): the **IDS** spine (~1,310 cross-linguistic concepts, already named as
   the lexicon spine in `0003` §1), **NGSL** for learner-frequency ordering, and
   **Swadesh / Leipzig-Jakarta** for the stable core. Frequency *orders* the
   queue; the concept lists make it *meaning-complete*.
2. **Coverage harness** (`tools/`, to build). Builds an English→Talo index from
   the dictionary's keywords/glosses, measures token coverage of the reference,
   and emits the **frequency-ranked gap queue**. This is the instrument the 98 %
   target is defined against; it reports coverage on every run.
3. **Derivation triage** — the step that keeps the root count honest. Each gap is
   classed **root / derived / compound** under the `0003` pruning policy: only
   non-derivable meanings are minted as **roots**; the rest are recorded as
   derivations/compounds (like the 23 already-pruned concepts). This is what
   bends "8,000 words" down to "~4,000 roots".
4. **Donor-balanced batch minting** — continue the `0006` script method
   (append-only, fail-fast, self-validating through both gates). Donor balance is
   now **auto-enforced**: `tools/coverage-stats --check` fails any batch that
   pushes a family provably over the ≤25 % cap (`0003` §7b).
5. **Corpus validation** — growing reading material is translated and run through
   `tools/glosser --corpus`; any unresolved token is a residual gap the reference
   missed (register, discourse, culture-specific), minted next round.
6. **Stop** when reference coverage ≥ 98 % and the corpus gate is clean.

## 4. Costs & risks (accepted, recorded)

- **Donor drift at scale.** Mitigated, and now *gated* — the cap check is a CI
  job, so a skewing batch fails the build rather than slipping through.
- **Over-minting derivable meanings.** The triage step (3) is mandatory; a gap is
  only minted as a root if it is genuinely non-derivable. Skipping triage would
  inflate the root count and violate `0003`'s pruning policy.
- **Reference bias.** Any single list is biased (web frequency → web-isms; a
  concept list → its compilers' domains). Mitigated by *layering* frequency +
  concept sources and by the corpus validator catching what lists miss.
- **The long tail.** 98 % is the line; technical/rare vocabulary beyond it is
  deferred to derivation and the post-1.0 correction window. Chasing 99 %+ is
  explicit non-goal here (diminishing roots-per-coverage).
- **Licensing.** Only CC/open sources are vendored, with attribution recorded
  alongside the data.

## 5. Relationship to the freeze (`0011`)

This is a **vocabulary** program; it does **not** touch the frozen grammar or the
closed class. `0000` §7 names adoption, not design, as the determinant, and the
lexicon is explicitly the *extensible* layer — vocabulary keeps growing across
1.0, gated the whole way. The freeze boundary is unaffected.

## 6. Change set

1. `0003` §3: the ~1,500 cutoff is **extended** by this ADR to the coverage-
   defined target (pointer added there).
2. To build next: the **coverage harness** tool + the **vendored reference**
   data, then frequency-ordered minting batches logged in the `0006` style (or a
   sibling batch log), each green through both gates + the cap check + the corpus
   glosser gate.

# Talo — Phase 5b: lexicon scaling (batch log)

**Status:** Ongoing. This is **not** a new design decision — it executes the
methodology already fixed in `docs/0003` (meanings-first, tier system, blend
sourcing §7b, the ~1,500 frequency-cutoff target) and the derivation rules in
`0002`. It is a **batch log**: each entry records a tranche of catalogued
concepts + minted forms, how they were produced, and the gate result. Design
questions, if any arise, are escalated to a real ADR — not decided here.

**Parent:** `docs/0003-lexicon.md` (the lexicon spec this scales), `docs/0002`
(derivation/phonotactics every form obeys), `docs/0005` (the now-complete grammar
that lets new vocabulary slot in cleanly).

-----

## Method (shared by all batches)

Every batch is produced by a script under `scripts/` that is **append-only**,
**fail-fast**, and **self-validating through the real collision checker**
(`CLAUDE.md` discipline):

1. New concepts are authored inline `[domain, gloss, tier, pos, donor-source,
   family]`, frequency-ordered within each domain, deduped against the existing
   catalogue by gloss.
2. Each donor source is **legalised to Talo** by *simplification* (per `0003`
   §7b: `r→l`, `j→y`, `v→w`, `z→s`; romanisation digraphs `sh→s`, `ch→c`, `ts→s`,
   `ngg→ng`, …; **drop** the offending consonant at an illegal cluster/coda rather
   than insert a buffer vowel — recognisability beats length, rule 1).
3. The candidate is checked against the **live lexicon + reserved forms** via the
   real `checkForm()`; on a collision it mutates deterministically until clear.
4. The script **aborts** (writes nothing) if any gloss duplicates the catalogue or
   any form cannot be minted.
5. After running, the **whole lexicon** is re-run through the collision checker
   and confirmed **exit 0**, and both tool suites are run, before commit.

> **Append-only guarantee.** Every pre-existing concept/lexicon row is preserved
> byte-identical; batches only add rows. Verified per batch with a `diff` of the
> prior file against the new file's head.

-----

## Batch 1 — People/social/mind · Everyday/material life · Modern/tech/civic

**Script:** `scripts/mint-5b-batch1.mjs`. **Added: 170 forms** (catalogue
410 → 580 concepts; lexicon 394 → 564 forms). **Gate: 564/564 clear, exit 0;**
both tool suites pass (linter exit 0; checker 12/12).

**Domains touched** (new counts are additions this batch):

| area | domains | added |
|---|---|---|
| People/social/mind | KIN, SOC, EMO, COG, SPE | ~66 |
| Everyday/material life | FOO, ANI, CLO, DWE, AGR | ~78 |
| Modern/tech/civic | MOD, TIM | ~26 |

Selection was frequency-first within each domain (e.g. KIN added
grandmother/grandfather/family/baby/neighbour before tribe/member; MOD added
shop/map/music/ship before factory/bicycle). Tier-3 internationalisms
(`polisi`, `radio`, `kamela`, `terebi`, `bank`, `hoteru`) are admitted per
`0003` §7b's allowance for the Greco-Latin modern layer.

**Donor-family state after batch 1** (explicitly-tagged forms, of 564):

| family | ~% | headroom to 25% cap |
|---|---|---|
| Austronesian | ~21% | tightening |
| Japonic | ~19% | tightening |
| Bantu | ~13% | ample |
| Indo-Aryan | ~2% | ample |
| Romance | ~1% | (≈3-root cap, held) |
| Sinitic / Semitic / Slavic | <1% each | ample |

No family exceeds the **≤25%** cap (`0003` §7b). **Note for batch 2:** Austronesian
and Japonic are now the two leaders and approaching the cap; the next batch should
lean **Bantu, Indo-Aryan, Sinitic, and selective Romance/Semitic** to keep the
blend balanced as the lexicon grows.

**Quality pass.** The first mint produced ~12 over-simplified or misleading forms
(e.g. buffer-padded `sahokuyi`, or `mimi` "dream" colliding semantically with
Japanese "ear"); the legaliser was switched from buffer-padding to
cluster-simplification and those donors were re-picked (dream `yume`, chicken
`niwatoli`, box `sanduku`, bag `muko`, …) before the batch was accepted. Forms are
recognisable adaptations of their donors (e.g. `sakai` shakai, `tetanga` tetangga,
`baisikeli` bicycle, `terebi` television).

-----

## Running totals

| after | concepts | lexicon forms | toward ~1,500 |
|---|---|---|---|
| Phase 3 | 402 | 386 | ~26% |
| Phase 5a | 410 | 394 | ~27% |
| **Phase 5b batch 1** | **580** | **564** | **~39%** |

-----

## Interfaces / next

- **Batch 2+** continue domain-by-domain toward ~1,500, rebalancing donors toward
  Bantu/Indo-Aryan/others (see note above). Abstract/relational and the remaining
  modern/civic frontier are the obvious next areas.
- **Derivation still covers the long tail** (`0002` §3): pruned-as-derivable
  concepts (school = learn+`-de`, leader = lead+`-ki`, etc.) are deliberately
  *not* minted as roots.
- **Parser fixtures** (`0005` §8): the growing lexicon is the vocabulary these
  future tools test against.

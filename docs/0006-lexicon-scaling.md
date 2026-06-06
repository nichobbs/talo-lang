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

## Batches 2–7 — the sweep to ~1,500

Batches 2–7 carried the lexicon from 564 to **1468 forms / 1484 concepts** — the
`0003` ~1,500 frequency-cutoff target. Each used the same gated pipeline; two new
helpers made the volume tractable: a **probe** (legalise a donor + check it against
the live lexicon before minting) and an **autofix resolver** (when a donor's
legalised form collides, try recognisable extensions until one clears, instead of
emitting buffer-vowel junk). Every batch was confirmed **exit 0** on the full
lexicon and append-only before commit.

| batch | areas (domains) | added | cumulative |
|---|---|---|---|
| 2 | body / health / perception / motion (BOD PER MOT MOD) | +122 | 686 |
| 3 | abstract / cognition / quantity / time / spatial (PROP COG QTY TIM SPA) | +148 | 834 |
| 4 | nature / plants / animals (PHY AGR ANI) | +136 | 970 |
| 5 | actions / society / material life (ACT SOC DWE FOO CLO) | +118 | 1088 |
| 6 | emotion / cognition / speech / trade / people / social (EMO COG SPE POS KIN SOC) | +167 | 1255 |
| 7 | modern·tech / built-environment / transport / cooking (MOD DWE MOT ACT FOO …) | +213 | 1468 |

**Donor-balance management.** Batch 1 left Austronesian (~21%) and Japonic (~19%)
near the cap, so batches 3–5 leaned **Indo-Aryan / Sinitic / Romance / Semitic**
(then <6% each), and batches 6–7 leaned **Romance / Japonic / Semitic** for the
abstract-social and tech registers. The nature/animal batch (4) unavoidably leaned
Indo-Aryan/Bantu (cleanest CV donors for flora/fauna) and was spread back by
re-sourcing ~28 rows. **Final blend, all under the ≤25% cap (`0003` §7b):**

| family | forms | % |
|---|---|---|
| Japonic | 273 | 18.6% |
| Bantu | 258 | 17.6% |
| (pre-5b, family-in-prose) | 225 | 15.3% |
| Indo-Aryan | 209 | 14.2% |
| Romance | 194 | 13.2% |
| Austronesian | 149 | 10.1% |
| Semitic | 86 | 5.9% |
| Sinitic | 38 | 2.6% |
| international | 35 | 2.4% |
| Slavic | 1 | 0.1% |

**Gates earned their keep.** Across the sweep the screens caught — and forced fixes
for — multiple **obscenity-substring** hits (`kaaka` "crow", `kakadi` "cucumber",
`kontasena` "password" all contain blocked substrings), a **false-friend**
(`pesa` = Swahili "money"), and hundreds of homophone / near-homophone collisions
under the b/p·d/t·g/k merger — none of which reached `data/`.

### Euphony polish pass (post-sweep)

A follow-up pass audited the sweep's auto-resolved forms for recognisability. Two
findings shaped its (deliberately small) scope:

- **Appended-vowel suffixes are load-bearing, not noise.** Of the forms whose
  surface ends in a vowel the donor lacks (e.g. `pafu`→`pafua` "lung", `pika`→
  `co` "six"), **every single one** was checked by removing the suffix — and
  **all collided** (homophone or near-homophone) with an existing word. The
  suffix is the autofixer's disambiguation, so stripping it would reintroduce a
  collision. These were left as-is.
- **Cluster-simplifications are mostly legitimate** (`sempit`→`sepi`, `lembut`→
  `lebu`): Talo simply cannot carry the dropped cluster. Only a handful were both
  lossy *and* low-recognisability with a clearly better, gate-clear alternative.

So the polish was **surgical — six forms re-sourced**, each verified to keep the
full lexicon at exit 0: hospital `yoi`→`asipitali`, knowledge `paga`→`wida`,
clear `sasa`→`wasi`, itch `huyi`→`kayui`, chief `muha`→`muka`, tumour `songiu`→
`tumoli`. Form count unchanged (in-place); both gates and the parser stay green.

-----

## Running totals

| after | concepts | lexicon forms | toward ~1,500 |
|---|---|---|---|
| Phase 3 | 402 | 386 | ~26% |
| Phase 5a | 410 | 394 | ~27% |
| Phase 5b batch 1 | 580 | 564 | ~39% |
| Phase 5b batch 2 | 702 | 686 | ~47% |
| Phase 5b batch 3 | 850 | 834 | ~56% |
| Phase 5b batch 4 | 986 | 970 | ~65% |
| Phase 5b batch 5 | 1104 | 1088 | ~73% |
| Phase 5b batch 6 | 1271 | 1255 | ~84% |
| **Phase 5b batch 7** | **1484** | **1468** | **~98% (target met)** |

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

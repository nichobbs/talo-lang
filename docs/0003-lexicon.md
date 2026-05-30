# Talo — Phase 3: Lexicon (Part A — the concept list & methodology)

**Status:** In progress. Begins Phase 3 of `0000` §8 (the core lexicon — the
*unbounded* phase, scoped by frequency cutoff, not completeness). This ADR fixes
the **methodology, sources, derivation-pruning policy, tier system, semantic
domains and dataset schema**, and ships the **stable-core tranche** of the
concept list. The full ~1,500-concept sweep and the form-assignment stage follow
under this same phase.

**Parent:** `docs/0000-design-principles.md` §4 (lexicon strategy) and §1 (the
lexical-familiarity ceiling). Built on `0001` (phonotactics — the form gate) and
`0002` (morphology — what derivation can generate, which decides what needs a
root).

**Format:** ADR-style, as in `0000`–`0002`. Tie-break rules cited as “rule N”.

-----

## 0. Scope — what Part A does and does not do

`0000` §4 mandates a **two-stage, meanings-first** pipeline:

```
Stage 1 (this doc):  CONCEPTS  — a frequency-weighted list of MEANINGS
                                 → data/concepts.tsv
Stage 2 (next):      FORMS     — a Talo form chosen per concept, gated by the
                                 phonotactic linter (0001) + a collision checker
                                 → data/lexicon.tsv  (concept → form → rationale → source)
```

**Part A is Stage 1 only.** It assigns **no Talo forms** — those are Stage 2,
where each form passes the linter and the (still-to-be-built) collision checker
(`0000` §4, §2.1 of `0001`). Choosing meanings first is what lets us keep the
lexicon fair-as-possible and derivation-driven rather than form-first.

> **Why this separation matters.** The hardest, most contested step is *form*
> selection (internationalism vs coinage, collisions, the weak stop contrast).
> Fixing the **concept inventory** first — language-neutrally, from established
> cross-linguistic lists — means the contested step operates on an agreed,
> reviewable target set rather than being entangled with “which words exist.”

-----

## 1. Sources & methodology (resolves the “which concepts” question of §4)

The concept inventory is **anchored on established, citable cross-linguistic
lists**, not invented ad hoc:

| Source | Size | Role |
|---|---|---|
| **Swadesh list** | 207 | Maximally stable basic vocabulary; the diachronic core. |
| **Leipzig-Jakarta list** | 100 | The most **borrowing-resistant** basic meanings (empirically, from the Loanword Typology project). |
| **Intercontinental Dictionary Series (IDS) / Buck domains** | ~1,310 | The **spine**: a concept list *built for cross-linguistic comparison*, organised into ~22 semantic chapters. Almost exactly our target size. |
| **Function/grammatical concepts** | ~40 | Demonstratives, quantifiers, question words, connectives (*if, because, or*) — minus the closed-class items already fixed in `0002`. |
| **Modern world** | ~150–250 | Numbers, time/calendar, money/trade, tech, transport, institutions, media (Extended-modern scope — §4 decision below). |

**The intersection of Swadesh ∩ Leipzig-Jakarta defines tier 1** (§4): the
maximally stable core that (a) is least unfair across families and (b) seeds the
Phase-4 “hello world” slice (`0000` §8). The IDS spine fills tiers 2–3 by domain.

> **The lexical-familiarity ceiling still holds (`0000` §1).** Sourcing
> *concepts* neutrally does **not** make the eventual *forms* neutral — that is
> mathematically unreachable. This step minimises unfairness only at the level of
> *which meanings we cover*; Stage 2 minimises it at the level of *form* via
> internationalisms + transparent derivation.

-----

## 2. Derivation-pruning policy — **Balanced** (the key Talo-specific move)

Because `0002` gives Talo a rich generator (ten derivational affixes +
compounding + acategorial badge-swap), the ~1,500 budget is spent on **root
concepts**, not surface words. A concept that the generator reaches for free does
**not** get its own root (rule 5; `0000` §3.4). Policy = **Balanced**:

**Prune (mark `is_root = no`, record the derivation) when** the concept is
clearly and losslessly generated:
- agent / instrument / patient / place / quality nominalisations —
  *teacher* = teach +`-ki`, *cutter* = cut +`-tu`, *bakery* = bake +`-de`,
  *size* = big +`-pa`;
- causative / inchoative verbs — *enlarge* = big +`-ta`, *redden* = red +`-pi`;
- transparent compounds — *bathroom* = water + house;
- bare category-swaps — *badly* (modifier of *bad*), *a run* (noun of *run*).

**Keep a dedicated root (mark `is_root = yes`) when**, even if technically
derivable, ONE of:
1. the derived form would be **clumsy or unclear** (e.g. *small* as “un-big” loses
   a basic, ultra-frequent meaning) — so **both** members of a core antonym pair
   keep roots (*big*/*small*, *good*/*bad*, *hot*/*cold*);
2. the meaning has **drifted** from a literal composition (a *chairman* is not a
   “chair-person”);
3. the **largest L1s overwhelmingly lexicalise it** (rule 1 — transfer): a learner
   expecting a single basic word should find one.

Every keep/derive call is **recorded with its reason** in the `notes` column, so
the policy is auditable and reversible per concept.

> **Cost accepted, recorded explicitly:** “Balanced” is judgement-based, so two
> editors could disagree on a borderline concept. We accept that over the
> alternatives: *Maximal compositional* (smallest, but forces “un-good” for *bad*
> and hurts transfer) and *Minimal pruning* (largest, but wastes the §3.4
> leverage). The recorded reason per row makes disagreements explicit and
> cheap to settle in review. (Rules 1, 3, 5.)

-----

## 3. Tier system & frequency-cutoff scoping

`0000` §4: “Scope by **frequency cutoff, not completeness**.” Each concept gets a
tier:

| Tier | Definition | Use |
|---|---|---|
| **1** | Stable core — Swadesh ∩ Leipzig-Jakarta, core numbers/time/function. ~300. | The freeze-first set; seeds the **Phase-4 ~300-word hello-world slice**. |
| **2** | High-frequency general vocabulary (IDS spine, common domains). | The bulk of the ~1,500. |
| **3** | Extended / modern / specialised (tech, media, institutions, abstract). | The frequency-cutoff frontier; first to defer if budget tightens. |

The cutoff is a tier boundary, not a target count: we build tiers 1→2→3 until
~1,500 roots, then stop. Derivation covers everything past the cutoff.

-----

## 4. Semantic domains (the chapter structure)

Buck/IDS-derived domains, used as the `domain` column and the build order:

```
FUN function/grammatical    QTY quantity & number     TIM time
PHY physical world/nature   PROP properties (mod)      BOD body & functions
KIN kinship & people        ANI animals                AGR plants & agriculture
FOO food & drink            CLO clothing               DWE dwelling/house & artefacts
ACT basic actions           MOT motion                 SPA spatial relations & deixis
PER perception              EMO emotion & value         COG cognition
SPE speech & language       SOC social/political/work   LAW law                REL religion/belief
POS possession & trade      MOD modern world (tech/transport/media/institutions)
```

(`PROP` — common adjectival/modifier concepts — is split out from Buck’s
“Emotions and values” for usability, since `0002`’s modifier class is large and
high-frequency.)

-----

## 5. Numeral system — decimal, transparent, compositional

**Decision.** **Base 10.** Root numeral concepts: **0–9** plus the powers
**ten, hundred, thousand, million**. All other numbers are **compositional**
(compounding, `0002` §3.1) and so are *not* roots: e.g. *eleven* = ten-one,
*twenty* = two-ten, *345* = three-hundred four-ten five. Ordinals (*first*,
*second*) are **derived** (a modifier reading of the cardinal) — not roots.

**Rationale.** Base 10 is the overwhelming cross-linguistic default and matches
the personas’ near-universal experience (rules 1, 3). A transparent decimal
construction means the learner memorises ~14 numeral roots and *generates* every
number — the §3.4 multiplier applied to counting. (The exact construction syntax
is finalised in the full sweep.)

-----

## 6. Dataset schema & format

**File:** `data/concepts.tsv` — **tab-separated** (glosses/notes contain commas;
TSV stays clean and line-diffable, honouring `0000` §4 “diffable, reviewable”).
One concept per row. Columns:

| Column | Meaning |
|---|---|
| `id` | Stable ID, `DOMAIN-NNN` (e.g. `PHY-004`). Never reused. |
| `gloss` | Short English label for the concept. |
| `domain` | One of §4’s domain codes. |
| `tier` | `1` / `2` / `3` (§3). |
| `pos_hint` | Typical category — `n` / `v` / `mod` / `num` / `fun`. **Advisory only** (roots are acategorial, `0002` §2.1); guides Stage-2 examples. |
| `is_root` | `yes` = needs its own Talo form (Stage 2); `no` = generated by derivation. |
| `derivation` | If `is_root = no`, the formula (e.g. `teach + -ki(AGENT)`); else blank. |
| `source` | `SW` Swadesh · `LJ` Leipzig-Jakarta · `IDS` · `FUN` · `MOD` · combos. |
| `notes` | Keep/derive reason (§2), transfer note, internationalism candidate, collision flag. |

`pos_hint` does **not** constrain the word: any root may take any badge (`0002`).
It records the *most frequent* use, for the hello-world slice and dictionary
defaults.

-----

## 7. Delivered now vs next

- **Now (this commit):** §§0–6 above + `data/concepts.tsv` populated with the
  **tier-1 stable core (~300)** across all domains, including worked examples of
  the pruning policy (`is_root = no` rows) and the numeral/function sets. This is
  the **review checkpoint** for schema, pruning and tiering.
- **Next (same phase):** scale `concepts.tsv` to the full ~1,500 (tiers 2–3,
  domain by domain); then **Stage 2** — build the collision checker and assign
  forms in `data/lexicon.tsv`.

-----

## 7a. Stage 2 — form-assignment policy (forms live in `data/lexicon.tsv`)

Stage 2 mints a Talo **form** per root concept. Schema:
`id · gloss · form · source · rationale · notes`; `source` ∈ {`INTL`, `COIN`}.

**Policy (decided in dialogue):**
1. **Internationalism-first where it genuinely helps.** If a form is already
   globally diffused and would be more familiar, adopt it (adapted to Talo
   phonotactics) — *even if longer* than a coinage would be (rules 1, 4).
2. **Otherwise neutral coinage, Zipfian-sized:** the most frequent roots get the
   shortest legal shapes (CV → CVCV), rarer roots may run longer.
3. **Every form passes both gates** — the phonotactic linter (R1–R6) and the
   collision checker (no homophone / near-homophone / reserved-word / obscenity).
   Adaptation to phonotactics most often means **`r→l`** (no `r`, `0001` §2.4),
   **`v→w`** (no `v`, §2.3), and breaking illegal clusters/codas.

**Delivered now:** the **tier-1 stable core (140 roots)** in `data/lexicon.tsv`,
all 140 passing both gates (validated via
`talo-collision --lexicon data/lexicon.tsv`). A handful intentionally reuse the
forms used illustratively in `0002` (`bola`, `piko`, `kanu`, `kasa`, `kuto`,
`mina`, `kila`, `dona`, `seka`, `nu`).

> **Cost accepted, recorded explicitly — and flagged for review.** Where an
> internationalism was used, this first batch leans heavily on **Latin/Romance**
> roots (the most globally *diffused* family via scientific/loanword vocabulary),
> which favours Romance/English-Latinate L1s. This is consistent with `0000` §1
> (root-level neutrality is unreachable; prefer already-diffused forms) but the
> *degree* of the lean is a genuine, reviewable decision: the alternative is more
> arbitrary neutral coinage (fairer, but zero transfer for anyone). Question-word
> forms (`se-` series) are coined as a learnable paradigm rather than borrowed.

## 7b. Sourcing decision — blend / worldlang (supersedes the Latin baseline)

After comparing three sourcing bases on a 40-concept sample
(`data/lexicon-compare.tsv`: ① Latin baseline, ② total-speaker capped,
③ blend/worldlang), **③ blend was adopted** and `data/lexicon.tsv` was rebuilt
for all 140 tier-1 roots on that basis.

**Rubric.** Source content roots from the **CV-phonotactically-friendly large
donors** — Indonesian/Malay (Austronesian), Swahili (Bantu), Japanese (Japonic),
with Indo-Aryan/Semitic/Sinitic/Slavic where a toneless CV form stays
recognisable — and **cap any one family at ≤25%**. Romance is *allowed but
capped* (~3 roots) so it harmonises with the inevitably Greco-Latin modern layer
(tiers 2–3), rather than dominating. Mandarin/Hindi are used sparingly because
stripping tone/retroflex to fit Talo phonotactics destroys their recognisability
for their own speakers (see the considerations recorded with this decision).

**Why blend over the others.** The source base mainly serves the *secondary*
(transferer) persona; the primary novice gains little from any etymology, so the
choice is really fairness + phonaesthetic fit. Blend spreads transfer across the
largest number of people, fits our CV system, avoids the colonial-Eurocentric
optics of a Latin base (§7 of `0000`), and has live precedent (Globasa, Pandunia,
Lidepla). Pure-population sourcing (②) was rejected because it either re-imposes
Latin (total-speaker weighting inflates English+Romance) or yields tone-stripped
Mandarin/Hindi forms unrecognisable to their own speakers.

**Result.** Content roots now spread ~Austronesian 24% · Japonic ~16% · Bantu
~13% · Indo-Aryan ~5% · Semitic/Sinitic/Romance ~2% each · Slavic ~1%, vs the
baseline's ~71% Latin/Romance. All 140 pass both gates.

**False-friend screen applied** (per the audit, `data/false-friend-audit.tsv`):
the SEVERE/HIGH clashes were designed out — e.g. `ano`(year, =anus es/pt)→`taun`,
`loko`(place, =crazy)→`mahali`, and the capped picks avoid `nila/dia/go/pesa/
kane/bila/tela/male`. MEDIUM/LOW clashes are accepted as the unavoidable tax.

> **Function/numeral/deictic blend (done — supersedes the earlier "kept" set).**
> The function words, numerals and pure deictics have now been blended/neutralised:
> - **Numerals** — a coherent cross-family set, maximally distinct:
>   0 `nuli` · 1 `wan` · 2 `tu` · 3 `san` · 4 `yon` · 5 `lima` · 6 `sita` ·
>   7 `saba` · 8 `nane` · 9 `kiu` · 10 `dasa` · 100 `sata`
>   (English 1/2, Japanese 3/4/9, Austronesian 5, Swahili/Arabic 6/7/8,
>   Sanskrit 10/100; 6–9 land in tier-2 but the system is fixed now).
> - **Deictics** — a single coherent Austronesian paradigm for learnability:
>   this `ini` · that `itu` · here `sini` · there `situ` · up `ata` · down `bawa`.
> - **Connectives/quantifiers/etc.** de-Latinised where clean (e.g. but `tapi`,
>   because `sababu`, yes `hai`, very `sana`, only `dake`, all `ote`, none
>   `hakuna`, more `lebi`, today `leo`, before `mae`, after `ato`). The neutral
>   coined items kept where already fine (the `se-` question series, `o`, `fi`,
>   `no`, `ti`, `nu`, `numa`).
>
> **Still pending:** a false-friend *screen in the tooling* (seeded by
> `data/false-friend-audit.tsv`), to sit alongside the obscenity blocklist.


> **Tier-2/3 forms complete (bulk pass).** All 356 catalogued root concepts now
> have validated forms (386 lexicon entries incl. 30 correlatives). The 162
> non-hand-minted forms were generated by `scripts/mint-remaining.mjs`: a
> per-concept blend source form, deterministically legalised to Talo
> phonotactics (r->l, j->y, v->w, z->s, cluster/coda repair, no doubled vowels),
> then collision-resolved against the live lexicon via the real checker
> (append-only; every prior entry preserved). Gate: checker exit 0, 386/386
> clear, 0 field errors, 0 roots uncovered. Cluster-heavy modern borrowings get
> buffer vowels (computer `konapyuta`, internet `intaneta`) and are flagged for a
> later hand-polish pass; provenance is in each rationale (`src '...'`).

## 8. Interfaces to later phases & tools

- **Collision checker (Stage 2 gate, `0000` §4 / `0001` §2.1, §8).** Must be
  built before forms are minted: enforces no near-homophones (treating `b/p`,
  `d/t`, `g/k` as merge-risk per the weak stop contrast) and screens accidental
  cross-language obscenities. The phonotactic linter is necessary but not
  sufficient.
- **Phonotactic linter (`tools/phonotactic-linter/`).** The R1–R6 gate every
  Stage-2 form must pass.
- **Derivation (`0002` §3).** Defines what is prunable here; the `derivation`
  column is the spec the derivation explorer (Phase 5) will validate.
- **Hello-world slice (Phase 4).** Drawn from tier 1 (§3).
- **Governance (`0000` §6).** Must set who may extend the lexicon and the freeze
  boundary (tier-1 core is the natural freeze candidate).

-----

## Appendix A — schema quick reference

```
data/concepts.tsv  (TSV, one concept per row)
id   gloss   domain   tier   pos_hint   is_root   derivation   source   notes

tiers:     1 stable core (SW∩LJ) · 2 high-freq general · 3 extended/modern
is_root:   yes = mint a form (Stage 2) · no = generated by derivation (0002 §3)
NO Talo forms in this file — forms are Stage 2 (data/lexicon.tsv), linter+collision gated.
```

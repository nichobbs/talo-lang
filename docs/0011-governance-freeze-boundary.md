# Talo — ADR 0011: Governance model & freeze boundary

**Status: PROPOSED** (resolves open decision **O-6**, `0000` §6 / §9). This ADR
defines *what is frozen vs. open*, *who may extend Talo*, and *how changes are
ratified*. It is **constitutional**: it changes no phonology, grammar, or lexicon,
but it establishes the process every future change runs through — including its
own. Because no ratification process exists yet, the bootstrap is explicit (§0):
the **maintainer** ratifies this ADR directly, and that single act brings the
model into force and retroactively supplies the "governance process" that `0009`
and `0010` already cite.

**Parent:** `docs/0000-design-principles.md` §6 (governance), §8 (freeze
bottom-up), §9 (open decision O-6). **Inherits:** `0000`'s tie-break rule 5
(*derivation is additive*), here generalised from word-formation to the whole
language.

-----

## 0. Why now, and the bootstrap

The design is far enough along that the next risk is no longer *getting the
language wrong* — phonology (`0001`), grammar core (`0002`), and a gated 1,477-root
lexicon are all in place — but **fragmenting the community that uses it**. Two
proposals (`0009` pronouns, `0010` numeral markers) are already parked "awaiting
the governance process, O-6". That process is this document. Until it exists they
cannot move, so O-6 blocks real work and is correctly the next decision (`0000`
§8: freeze bottom-up, and `summary.md` next-steps #4).

**The bootstrap.** A governance model cannot be ratified *by* the process it
defines without circularity. We cut the loop the way every constitution does:
the only authority that exists before ratification — the **maintainer** — adopts
this ADR by fiat. From that moment the model in §4–§6 governs everything,
including amendments to this ADR itself. This is an interim, single-authority
stage that §4 names and gives an exit from.

-----

## 1. What governance must balance

Every conlang dies one of two deaths, and they pull in opposite directions:

| Failure | Cause | Historical case |
|---|---|---|
| **Fragmentation** | The core keeps changing; dialects diverge; no two textbooks agree; reformers schism. | Volapük (reform schism → collapse); Esperanto → **Ido** split (1907). |
| **Fossilisation** | The core is so locked that real gaps (a missing reflexive, a needed register) can never be filled; the language can't grow into use. | Many "perfect" specs with no corpus and no path to extend. |

Esperanto's durable answer was the **Fundamento** (1905): a small, deliberately
**inviolable** (*netuŝebleco*) core — 16 rules, a base grammar and word-list —
that no one may *change*, paired with an Academy empowered to **add** official
vocabulary and clarifications on top. Freeze the core to prevent schism; keep the
periphery open to prevent fossilisation. Talo adopts that shape, adapted to a
**spec-plus-dataset** project where the "Fundamento" is a set of ADRs and gated
TSVs rather than a printed book.

The governing principle is tie-break rule 5 promoted to language scope:

> **The additive invariant.** Talo grows only by *adding*. No ratified change may
> alter or remove the meaning, form, or rule a learner has already correctly
> learned. Anything already true of the language stays true. (`0000` rule 5.)

This is also the primary-persona promise: the first-ever L2 learner can never be
told "what you learned last year is now wrong."

-----

## 2. The freeze boundary — three tiers

Every part of Talo sits in exactly one tier. The tier sets how hard it is to
change.

### Tier F — Frozen core ("the Fundamento")

**Inviolable.** May be *clarified* (a wording fix that contradicts nothing) but
never *contradicted*. Changing anything here is, by definition, a different
language — that is what the freeze means.

- **Phonology & orthography** — `0001` in full: the 20-letter alphabet, the
  `(C)V(n)` syllable, coda-`n`, the single `n`+stop/affricate cluster, fixed
  initial stress, the allophonic-tolerance contract. The linter rules **R1–R6**
  are the executable form of this tier.
- **Grammar core** — `0002`: the three POS badges (`-ka`/`-to`/`-pe`),
  acategorial roots, the reserved-onset rule, the ten productive affixes +
  compounding, the six role postpositions, the TAM/number particle system (no
  tense; `li`/`wi`; `pu`; clusivity), subject-first with fluid verb placement,
  in-situ questions, the negator/copula/conjunction, **no obligatory articles**,
  and the 42-cell correlatives grid.
- **The constitution itself** — `0000` §0 optimisation target, the five tie-break
  rules, and the non-goals. The *why* is frozen so the *what* can't drift.
- **The gate contracts** — the **rules** the two gates enforce (phonotactic R1–R6;
  the collision categories: homophone, near-homophone under the weak-stop rule,
  reserved, obscenity, false-friend). Note: the gate **rules** are frozen; the
  gate **data** (blocklist, false-friend list) is Tier O — see §2/Tier O.

### Tier S — Stable, governed extension

**Additive-only, and only by ratified decision.** These are closed, parser-known
inventories: adding to them is a grammar change (the parser learns a new word),
so it needs an ADR and ratification — but a *correctly formed addition never
breaks anything already learned*, so it is permitted where a Tier-F change is not.

- The **closed-class function-word** inventory (`0002` §6 / Appendix B):
  pronouns, particles, role markers. New members enter here. **This is where
  `0009` `sendi`/`salin` and the `0010` `kai`/`bagi` markers live.**
- The **affix inventory** (`0002` §3.2) and the compounding/buffer rules' *surface*
  (`0002` §3.1) — not the additive-derivation *principle*, which is Tier F.
- Any new **reserved grammatical word** (must also land in the checker's
  `RESERVED_FORMS` and the parser's `FUNCTION_WORDS`).

The bar for Tier S: additive only (never reassign or remove an existing
function word), must pass both gates, and must be exercised by at least one
corpus sentence (`0008` gate).

### Tier O — Open

**Grows freely under the two gates; no ADR required.** This is the bulk of the
living language and the engine of adoption (`0000` §7: corpus and interlocutors).

- The **open-class lexicon** — every `-ka`/`-to`/`-pe` content root in
  `data/lexicon.tsv`, all derived forms (`derived-lexicon.tsv`) and compounds
  (`compounds.tsv`). New roots are minted by the blend rubric (`0003` §7b) and
  admitted on **two green gates** (linter + collision checker, exit 0).
- The **corpus** (`corpus/`), **learning materials**, dictionary build.
- The **gate seed data** — `collision-blocklist.txt`, `false-friends.tsv` — which
  are *meant* to grow (they are explicitly illustrative seeds, `summary.md`
  debts) and tightening them only ever *adds* rejections, never invalidates a
  word already admitted.

The additive invariant still binds Tier O in one direction: **an admitted form's
meaning is not silently reassigned.** A wrong/ugly form may be *deprecated*
(superseded by a better synonym, old form kept legal) but not *redefined*.

-----

## 3. The inviolability rule, stated operationally

A change is **permitted** iff a learner who correctly knew Talo before the change
is still correct after it. Concretely:

- ✅ **Add** a root, a derived form, a function word, a corpus text, a clarifying
  sentence to an ADR, a new false-friend/blocklist entry.
- ✅ **Deprecate** (mark a form non-preferred while keeping it legal and parsable).
- ✅ **Clarify** a Tier-F rule with wording that contradicts no existing reading.
- ❌ **Reassign** an existing form to a new meaning, **remove** a function word or
  affix, **change** any R1–R6 / badge / role-marker / correlative rule, or
  **narrow** the alphabet or syllable shape.

A change that is genuinely needed but *not* additive (a true error in Tier F) is
not made by editing the frozen rule. It is handled like an erratum: recorded in
`0000` (reversals live there, per its header), justified against the tie-break
rules, and — post-1.0 (§5) — gated behind the highest ratification bar. The
expectation is that this approaches never.

-----

## 4. Roles & authority

Talo is small, so governance starts minimal and has a defined path to widen —
fragmentation comes from *premature* committees as often as from autocrats.

### 4.1 Now — interim maintainer (single steward)

One **maintainer** is the sole ratifying authority for Tier-S and Tier-F
decisions and the final reviewer for Tier-O data PRs. This matches today's
reality (one steward, ADR-driven) and is the authority that bootstraps this very
document (§0). Rationale: at current scale a board would add process without
adding legitimacy. (Tie-break rule 3: predictability over ceremony.)

The maintainer's discretion is **not** unlimited: they are bound by the additive
invariant (§3) and by `0000`'s tie-break rules. The maintainer may add and
clarify; they may **not** unilaterally contradict Tier F once 1.0 is declared
(§5) — that is the point of the freeze, and it binds the steward first.

### 4.2 Later — the Academy (succession trigger)

When the community crosses a threshold — proposed as **either** a sustained body
of independent contributors (≥ ~5 regular non-maintainer contributors to
`data/` or `corpus/`) **or** the first external learning resource not authored by
the maintainer — governance widens to a small **Academy**: an odd-numbered panel
(3–5) that ratifies Tier-S/Tier-F changes by **supermajority** (≥ ⅔), with the
maintainer as convenor, not veto. The Academy inherits the same additive
invariant; widening the franchise does **not** widen what may be changed. This
mirrors the *Akademio de Esperanto* sitting atop an inviolable Fundamento.

The trigger is recorded here so succession is a known event, not a power
struggle.

-----

## 5. The freeze trigger — versioning

The freeze is not yet in force; declaring it is itself an act. Talo uses a
simple, additive-friendly version line:

- **Pre-1.0 (now).** Tier F is *frozen in intent* but still **correctable**: the
  steward may still fix a genuine Tier-F defect, because no public learner cohort
  has yet built on it. This is the last window for non-additive correction, and
  it should be used deliberately and sparingly.
- **1.0 — the freeze.** At a tagged `v1.0` release, Tier F becomes **inviolable**
  in the strong sense (§3). After 1.0 the only Tier-F motions are clarifications;
  the only growth is Tier-S additions (minor versions) and Tier-O data
  (continuous). The additive invariant means there is, by construction, **no
  Talo 2.0 that breaks 1.0** — a major bump would be a new language under a new
  name, never a reform of this one (the anti-Ido clause).
- **Version semantics.** `MAJOR` is reserved and, by the above, expected to stay
  at 1. `MINOR` increments on each ratified Tier-S addition. Tier-O lexicon/corpus
  growth is continuous and tracked by dataset counts, not version numbers.

### 5.1 What must be true before 1.0 (the freeze checklist)

The pre-freeze debts already logged (`summary.md` "Known cleanups / debts") are
**1.0 blockers**, because the freeze makes them permanent:

1. `false-friends.tsv` and `collision-blocklist.txt` upgraded from *illustrative
   seeds* to resources vetted against real profanity/false-friend data across the
   donor families — a frozen gate must screen against real data.
2. The euphony polish pass over auto-resolved forms (e.g. `tebana`, `sehinga`)
   completed or explicitly accepted, since post-1.0 a deployed form can only be
   deprecated, not corrected in place.
3. The **parser/validator** (`summary.md` next-step #3) in place as the executable
   spec of Tier-F grammar — a freeze needs a machine-checkable definition, not
   only prose.
4. `0009` and the `0010` markers ratified or explicitly declined, so the
   closed-class inventory entering the freeze is settled.

1.0 is declared by the maintainer (or, post-succession, the Academy) only when
this checklist is green.

-----

## 6. Ratification process, by tier

Folds into the existing PR/CI mechanics (`CLAUDE.md` Git/PR workflow); it does not
invent a parallel track.

| Change | Tier | Path | Gate to merge |
|---|---|---|---|
| New/edited content root, derived form, compound | O | PR touching `data/` | Both gates **exit 0** + maintainer review (data PRs are not docs-only, so they wait for a human — `CLAUDE.md`). |
| Corpus text, learning material | O | PR | `corpus-check` gate green + review. |
| New false-friend / blocklist entry | O | PR | Gates still exit 0 over the lexicon (an addition must not retroactively reject an admitted form without a recorded decision). |
| New closed-class word / affix / role marker | **S** | **Proposal ADR** (like `0009`/`0010`) → ratification | ADR recorded + both gates clear + ≥1 corpus sentence; ratified by maintainer (now) / Academy ⅔ (later). |
| Clarify a Tier-F rule (no contradiction) | **F** | ADR amendment / `0000` note | Ratified; must demonstrably contradict no existing reading. |
| Contradict Tier F (erratum) | **F** | `0000` reversal entry, full rationale vs. tie-break rules | **Pre-1.0 only**, maintainer; **post-1.0** practically closed (highest bar). |

The existing **docs-only auto-merge on green** rule (`CLAUDE.md`) is unchanged: a
*proposal* ADR is docs-only and may auto-merge **as a proposal of record**;
auto-merging the proposal is **not** ratification. Ratification is the explicit
status flip to **Accepted** plus the downstream `data/`+`tools/` change set —
which touches non-docs paths and therefore always waits for human review. This
keeps "writing down a proposal" cheap and "changing the language" deliberate.

-----

## 7. Cost (recorded)

- **Process overhead on Tier S.** Every closed-class addition now needs an ADR +
  ratification, not a data edit. Accepted deliberately: closed-class words are
  exactly the things a learner memorises as a fixed list, so churn there is the
  most expensive kind (tie-break rule 3). The cost is the point.
- **A single point of authority, for now.** The interim maintainer stage trades
  breadth of legitimacy for decisiveness. Mitigated by the §4.2 succession
  trigger and by the additive invariant binding the steward first (§4.1).
- **A 1.0 that is hard to take back.** Strong inviolability means a Tier-F mistake
  surviving to 1.0 is effectively permanent. Mitigated by the §5.1 freeze
  checklist (notably the parser as executable spec) and the pre-1.0 correction
  window.
- **No expressive ceiling raised.** Governance adds no words and no grammar; it is
  pure meta. That is correct — `0000` §7 names adoption, not design, as the real
  determinant, and governance is an adoption mechanism.

-----

## 8. If ratified — the change set

1. `0000` §6: replace the `TODO` with a one-line summary + pointer to this ADR.
   `0000` §9: mark **O-6 ✅ Resolved** in `docs/0011`.
2. `0009` and `0010` (the `kai`/`bagi` markers): the "awaiting the governance
   process" blocker is now satisfiable — each becomes a Tier-S motion the
   maintainer can ratify under §6. (This ADR does not pre-ratify them; it unblocks
   them.)
3. `summary.md`: update the "Open decisions" section — O-6 resolved; note the
   three-tier boundary and the 1.0 freeze checklist as the path to a release.
4. (Optional, operational) extract §2/§4/§6 into a top-level `GOVERNANCE.md` /
   `CONTRIBUTING.md` for contributors who won't read ADRs; the ADR stays the
   decision of record.

Until ratified, this document is the proposal of record; nothing downstream
changes.

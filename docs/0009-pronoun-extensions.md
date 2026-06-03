# Talo — Proposal 0009: Pronoun & coreference extensions

**Status: ACCEPTED** (ratified by the maintainer under the governance process —
`0000` §6 / O-6, the **Tier-S** path in `docs/0011-governance-freeze-boundary.md`
§6). Reflexive/emphatic `sendi` and reciprocal `salin` are now part of the
closed-class inventory (`0002` §6.8 / Appendix B), reserved in the collision
checker, and recognised by the parser. `salin`'s placement is fixed to the
**object slot** (§2.2). The change set landed is in §6. This ADR proposes
**additions** to the closed-class function-word inventory; it changes **no**
frozen decision. It is the written-up answer to "what would it take to give Talo
reflexives, reciprocals and possessive pronouns?".

**Parent:** `docs/0002-morphology-grammar.md` §6 (closed-class function words,
pronouns §6.1, role markers §4). **Constraints inherited:** the phonotactics
(`0001` R1–R6) and the weak-stop-contrast rule (`0001` §2.1); every form below was
run through the **real collision checker against the live lexicon** and is clear
(see §5).

-----

## 0. Why this is a proposal, not a build

Pronouns are **closed-class words the parser knows by listing** (`0002` §6) — they
take no badge, so the badge/affix derivation machinery (the `0007` expansion)
**cannot** generate them. Adding a reflexive or a reciprocal therefore means
**adding a new closed-class word**, which is a *constitutional* change to the
grammar (`0002` Appendix B is normative). Per `0000`, such changes are recorded
as a decision with rationale and cost — and, because the morphology layer is
"frozen second" (`0002` preamble), they go through governance rather than being
slipped into data. Hence: proposal.

-----

## 1. The gaps

| Need | Today | Adequate? |
|---|---|---|
| **Possession** ("my dog") | `mi we kanuka` (pronoun + genitive `we`, §4) | **Yes** — already additive, zero new machinery. |
| **Reflexive** ("she sees herself") | `te lumito te` | **No** — ambiguous with "she sees him/her (someone else)". |
| **Reciprocal** ("they help each other") | `te pu ... te pu` | **No** — no way to distinguish from "they help them". |
| **Emphatic** ("I did it myself") | — | **No** — not expressible. |

The possessive is **already solved** and this proposal deliberately does **not**
add dedicated possessive pronouns (`mi we` is transparent, additive, and avoids a
second paradigm to memorise — rules 3, 5). The real gaps are **coreference**:
reflexive and reciprocal. Emphatic falls out of the reflexive for free.

-----

## 2. Proposal — two free words

Add **two** closed-class words, both invariant (no inflection, no gender, no
number — consistent with the pronoun system §6.1):

| Word | Role | Gloss | Source (recognisability) |
|---|---|---|---|
| `sendi` | **reflexive / emphatic** | self, -self | Indonesian *sendiri* "self/own" |
| `salin` | **reciprocal** | each other, one another | Indonesian *saling* "mutually" |

### 2.1 Reflexive `sendi`
Used in an argument slot, `sendi` is **bound to the subject** (the nearest
subject, `0002` subject-first §3.5 makes this unambiguous):

```
te lumito sendi          she sees herself        (cf. te lumito te = sees him/her)
mi sayanto sendi         I love myself
te pu tukoto sendi pu    they hurt themselves    (plural via pu, §5.2)
```

As an **emphatic**, `sendi` follows the noun/pronoun it intensifies (the
determiner-like slot, `0005` §3):

```
mi sendi tendato itu     I did that myself
presidenka sendi datan   the president himself came
```

One word covers both the reflexive and the emphatic, exactly as English *-self*
does — maximal transfer, zero extra judgement (rules 1, 3).

### 2.2 Reciprocal `salin`
`salin` marks a symmetric relation among a plural subject; it sits in the
**object slot** (fixed at ratification, for parallelism with `sendi`):

```
te pu tungguto salin     they help each other
mi pu lumito salin       we see one another
```

Reciprocity over a non-subject can reuse the comitative `wa` ("with each other").

-----

## 3. Why words, not affixes or a paradigm

- **Free words, not bound affixes.** Reflexivity is a *clause-level* coreference,
  like negation `ne` and the role markers — not a property of the verb's shape.
  Keeping it a free word matches the postpositional, position-light syntax and
  needs no morphotactic change (`0002` §2). (Rule 4.)
- **No dedicated possessive paradigm.** A `mi-we → "mai"` style contraction was
  considered and **rejected**: it buys two syllables of brevity at the cost of a
  whole new closed paradigm (`mai/yui/tei …`) that the learner must keep distinct
  from `mi/yu/te` — economy over predictability, against rule 3. `pronoun + we`
  stays.
- **One reflexive for all persons.** `sendi` is person-neutral (like the single
  genderless `te`), so there is no `myself/yourself/…` table — the binding is
  positional, not lexical. (Rule 3.)

-----

## 4. Cost (recorded)

- **+2 closed-class words** to memorise (`sendi`, `salin`). Small, high-frequency,
  high-transfer; both are real words in a top-5 donor.
- **A binding rule** ("`sendi` refers to the subject") is a *reading* rule, not a
  shape rule — it is the kind of unambiguous, position-based rule the syntax
  already relies on (subject-first). No agreement, no movement.

-----

## 5. Gate status (verified)

All proposed forms were checked through the real collision checker against the
**live** `data/lexicon.tsv` — both clear, no homophone / near-homophone / reserved
/ obscenity / false-friend conflict:

```
node --experimental-strip-types tools/collision-checker/src/cli.ts \
  --against data/lexicon.tsv sendi salin
→ ✅ sendi — clear   ✅ salin — clear   (2/2 clear, exit 0)
```

-----

## 6. The change set (landed on ratification)

1. ✅ `0002` §6.8 (new) + Appendix B: `sendi` (reflexive/emphatic) and `salin`
   (reciprocal) added to the closed-class inventory (free-word count 18 → 20);
   `salin`'s placement fixed to the object slot (§2.2).
2. ✅ `tools/collision-checker` `RESERVED_FORMS` and `tools/parser`
   `FUNCTION_WORDS` (a new `coreference` group): both words added, so they parse
   as function words and are reserved against future minting.
3. **Superseded — no `data/` rows.** The proposal floated adding the pair as
   `FUN` entries in `concepts.tsv`/`lexicon.tsv`, but the established invariant is
   that **0002 Appendix-B grammatical morphemes** (pronouns, role markers, the
   negator, `i`, …) live in `RESERVED_FORMS` and are **not** lexicon dataset rows —
   the two sets are disjoint. `sendi`/`salin` join that closed grammar class, so
   they follow the same pattern. Putting a form in **both** `RESERVED_FORMS` and
   the lexicon would also self-trip the checker's RESERVED gate (`checkBatch`
   seeds occupied with the reserved set). Reserved-only is the gate-safe,
   consistent home; being reserved already protects them from future homophone
   minting.
4. ✅ Corpus coverage exercising each: `corpus/articles/0010-coreference.md`
   (reflexive, emphatic, reciprocal), parser- and lexicon-gated.

Both gates and all four tool test-suites pass (exit 0) with the above landed.

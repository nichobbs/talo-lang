# Talo

A constructed auxiliary language optimised for **adoption via positive transfer
and low barrier to entry**, with the **first-ever-second-language learner** as
the primary persona.

**▶ Try it live: <https://nichobbs.github.io/talo-lang/>** — [learn](https://nichobbs.github.io/talo-lang/book.html)
the language, [read](https://nichobbs.github.io/talo-lang/reader.html) real texts
with tap-for-vocabulary and reveal-the-translation, [practice](https://nichobbs.github.io/talo-lang/practice.html),
and [search the dictionary](https://nichobbs.github.io/talo-lang/lookup.html).

This repo is a **spec-plus-dataset** project:

- the design constitution and decision log live in `docs/`
- the lexicon will be a versioned dataset, not prose
- the grammar is a small reference spec
- the tooling (phonotactic linter, parser/validator, derivation explorer,
  dictionary generator) is code with tests

## Start here

Read [`docs/0000-design-principles.md`](docs/0000-design-principles.md) first.
It is the project’s constitution: optimisation target, tie-break rules, every
decision made so far with its rationale, costs knowingly accepted, and the open
decisions still to make. **Every later change references it. Reversals are
recorded there, not made silently.**

## Decisions locked so far (summary)

- Optimisation target: adoption-by-transfer, primary persona = first-time L2
  learner with no metalinguistic experience.
- Phonology: no tone; no-hard-fails inventory; intelligibility-under-variation;
  Latin/ASCII/no-diacritics; one-to-one orthography.
- Grammar: no gender, no case (default), no agreement, no irregular verbs;
  tense/aspect via optional particles.
- Syntax: **subject-first enforced, verb placement fluid** (neutralises SVO/SOV).
- Morphology: **POS-marking mandatory and explicit on all content words,
  including nouns**; derivation is additive and generative.
- Phonology (Phase 1 ✅): 5 vowels, 15 consonants, 20-letter ASCII alphabet,
  coda `n` only, fixed initial stress; enforced by the phonotactic linter.
- Grammar core (Phase 2 ✅): three badged classes (noun `-ka`, verb `-to`,
  modifier `-pe`); **acategorial roots** (badge assigns category); ten-affix
  derivation + compounding; six free postpositional role markers; optional aspect
  (`li`/`wi`) + plural (`pu`), **no tense**; explicit copula `yato`; in-situ
  questions with clause-final `ke`.
- Name: **Talo** (deliberately neutral coinage).

## Build sequencing

Freeze bottom-up (phonology → morphology → core lexicon); test top-down (start
*using* the language at a ~300-word “hello world” slice before scaling vocab).

|Phase|Output                                                                       |
|-----|-----------------------------------------------------------------------------|
|0    |Design principles & decision log ✅ (`docs/0000-design-principles.md`)        |
|1    |Phonology & orthography spec + phonotactic linter ✅ (`docs/0001-phonology.md`)|
|2    |Morphology & grammar core ✅ (`docs/0002-morphology-grammar.md`)              |
|3    |Frequency-weighted core lexicon (~1,000–1,500 roots) as a dataset 🚧 (`docs/0003-lexicon.md`, `data/concepts.tsv`)|
|4    |“Hello world” vertical slice — real use, ~300 words                          |
|5    |Tooling: linter, parser/validator, derivation explorer, SRS materials        |
|6    |Governance model & freeze boundary                                           |
|7    |Corpus & community seeding                                                   |

See §8 and §9 of the design doc for sequencing detail and the open-decisions
table.

## Suggested repo layout (proposed)

```
talo/
  docs/
    0000-design-principles.md   # the constitution (this is here now)
    0001-phonology.md           # Phase 1
    0002-morphology-grammar.md  # Phase 2
    ...                         # one ADR per significant decision
  data/
    concepts.tsv                # frequency-weighted concept list (meanings) — Stage 1 ✅ core
    lexicon.tsv                 # concept -> form -> rationale -> source — Stage 2 (next)
  tools/
    phonotactic-linter/
    parser/
    derivation-explorer/
    dict-gen/
  examples/                     # sentences, the hello-world slice
```

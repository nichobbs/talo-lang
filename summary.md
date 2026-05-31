# Talo — progress summary & next steps

_Living status doc. For conventions see `CLAUDE.md`; for the binding decisions see
`docs/0000`–`0003`._

## Snapshot

| | |
|---|---|
| Phases complete | 0 (principles), 1 (phonology + linter), 2 (morphology/grammar), 3 (lexicon), 4 (hello-world slice) |
| Phase in progress | — (next: Phase 5 lexicon scaling + the gaps `0004` §8 surfaced) |
| Concepts catalogued | 402 (`data/concepts.tsv`); 356 are roots |
| Lexicon forms minted | 386 (`data/lexicon.tsv`) — **every catalogued root covered, 0 gaps** |
| Both gates | green (linter R1–R6 + collision checker); 386/386 clear, exit 0 |
| CI | both tool test suites passing |
| Hello-world corpus | `docs/0004` — 2 annotated dialogues + ~30 feature sentences, all on the 386 words |

## What exists today

**Design (frozen, ADR-recorded):**
- `0000` — constitution: optimisation target (adoption-by-transfer; primary
  persona = first-ever L2 learner), tie-break rules, non-goals.
- `0001` — phonology/orthography: 5 vowels, 15 consonants, 20-letter ASCII
  alphabet, `(C)V(n)` syllable, fixed initial stress, allophonic tolerance.
- `0002` — morphology/grammar core: 3 POS badges (noun `-ka`, verb `-to`,
  modifier `-pe`); acategorial roots; additive derivation (10 affixes +
  compounding); 6 free postpositional role markers; optional aspect `li`/`wi` +
  time-words (no tense); optional plural `pu`; pronouns + clusivity; negator
  `ne`; copula `ya`; in-situ questions + `ke`; **no obligatory articles** (§6.6);
  **correlatives grid** (§6.7, 6 stems × 7 categories = 42 regular pro-forms).
- `0003` — lexicon: meanings-first methodology, Balanced derivation-pruning,
  tier system, 22 semantic domains, base-10 numerals, and the **blend/worldlang
  sourcing** decision (§7b).
- `0004` — hello-world slice: the first *test-top-down* phase (`0000` §8). Two
  annotated everyday dialogues + a feature-by-feature sentence sweep + worked
  derivation/compounding, all built only from the 386 forms and the `0002`
  grammar. Confirms the layers compose and that the existing core already holds a
  real conversation; records the gaps it exposed (no locative/existential
  predication; no phatic layer for greetings/please/thanks; determiner-order
  clarification; proper-noun policy) as inputs to Phase 5.

**Data:** `concepts.tsv` (meanings), `lexicon.tsv` (forms), plus the
`collision-blocklist.txt` (obscenity) and `false-friends.tsv` (false-friend)
screen seeds.

**Tooling:** phonotactic linter and collision checker (homophone /
near-homophone / reserved / obscenity / false-friend), both with test suites and
CLIs, wired into CI.

## How we got here (PRs #1–#13, all merged)

Phonology+linter → grammar core → concept list → collision checker → tier-1
forms → **sourcing pivot** (replaced an accidental ~71% Latin/Romance lean with a
capped multi-family "worldlang" blend after a 3-way comparison + false-friend
audit) → function/numeral/article review → correlatives grid → all tier-2/3
forms minted → buffer-vowel polish pass.

## Known cleanups / debts

- A handful of machine-derived forms are still rough (e.g. `tebana` fly,
  `sehinga` so) — legal and unique, but a future hand-polish could improve
  euphony. Provenance is in each `lexicon.tsv` `rationale` (`src '...'`).
- `false-friends.tsv` and `collision-blocklist.txt` are **illustrative seeds** —
  must be expanded with proper native-speaker/profanity resources before any
  freeze.
- A `morphological` linter mode (validating word-internal morpheme seams /
  compounding buffer rule, `0002` §3.1) is noted as a future tool, not built.

## Next steps (recommended order)

1. ✅ **Phase 4 — the "hello world" slice** _(done — `docs/0004`)._ Built the
   annotated everyday dialogues + example set from the existing 386 words + the
   grammar. Validated that the pieces compose, and found the real gaps are
   grammatical/phatic, not vocabulary (see `0004` §8). **Follow-ups it generated**
   (small, additive — do alongside Phase 5):
   - decide **locative/existential predication** ("I am here / there is X") — the
     copula currently covers noun/modifier predicates only;
   - mint a **phatic set** (hello/bye, please, thank you, sorry, okay) — absent;
   - confirm **demonstratives/numerals are postposed determiners**, distinct from
     `-pe` modifiers (`0002` §6.6 already assumes this);
   - add a **proper-noun policy** (badging, parsing, gate treatment).
2. **Expand the concept list** toward the ~1,500 target (currently 402), then
   mint forms for the additions through both gates (reuse `scripts/` patterns).
   _(currently 402 concepts catalogued.)_
3. **Parser/validator tool** — checks sentence well-formedness (subject-first,
   badge-final, role markers); doubles as a teaching aid and regression harness.
4. **Governance & freeze boundary** (open decision O-6 in `0000` §9) — decide
   what is frozen core vs open before community scale.
5. Later: derivation explorer, SRS material generation, corpus/community seeding.

## Open decisions still logged (`0000` §9)

- **O-6** governance model & freeze boundary — not yet made.
- (O-1…O-5 resolved; O-7 resolved pedagogically.)

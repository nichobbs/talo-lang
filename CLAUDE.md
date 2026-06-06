# CLAUDE.md — working notes for Claude in this repo

Talo is a constructed auxiliary language, built as a **spec-plus-dataset** project.
This file orients a Claude session quickly. For full status see `summary.md`.

## What this project is

- **Goal:** a constructed auxiliary language optimised for **adoption via positive
  transfer and low barrier to entry**, with the **first-ever-second-language
  learner** as the primary persona. See `docs/0000-design-principles.md` — it is
  the constitution; every decision references it and reversals are recorded there,
  not made silently.
- **Layout:**
  - `docs/` — ADR-style design records, numbered: `0000` principles, `0001`
    phonology, `0002` morphology/grammar, `0003` lexicon. One ADR per phase.
  - `data/` — the versioned datasets (source of truth, not prose):
    - `concepts.tsv` — meanings (concept list): `id gloss domain tier pos_hint is_root derivation source notes`
    - `lexicon.tsv` — forms: `id gloss form source rationale notes`
    - `collision-blocklist.txt` — obscenity screen seed
    - `false-friends.tsv` — false-friend screen: `form lang meaning severity`
    - `derived-overrides.tsv` — curated **real-word glosses + suppressions** over
      the generated derivation layer: `key(root-id|domain) deriv-label gloss`
      (empty/`(suppress)` = drop). The Talo forms stay rule-generated; only the
      English gloss is hand-curated, per definition (dog+dim → "puppy")
  - `tools/phonotactic-linter/` — validates a word is legal Talo (R1–R6).
  - `tools/collision-checker/` — the second lexicon gate (depends on the linter).
  - `scripts/` — one-off minting/polish scripts (`*.mjs`).

## The two gates every lexicon form must pass

1. **Phonotactic linter** (`tools/phonotactic-linter`) — rules R1–R6 of
   `docs/0001` §5.3. 20-letter alphabet `a e i o u p t k b d g c f s h m n l w y`;
   no `j q r v x z`; syllable `(C)V(n)`; only cluster is `n`+stop/affricate; coda
   is `n` only; no doubled vowels.
2. **Collision checker** (`tools/collision-checker`) — rejects HOMOPHONE,
   NEAR_HOMOPHONE (b/p·d/t·g/k collapsed, per `0001` §2.1), RESERVED (clashes a
   `0002` grammatical word), OBSCENITY, FALSE_FRIEND (SEVERE/HIGH by default).

Run a whole lexicon through both gates:
```
node --experimental-strip-types tools/collision-checker/src/cli.ts --lexicon data/lexicon.tsv
```
Check candidate forms against the live lexicon:
```
node --experimental-strip-types tools/collision-checker/src/cli.ts --against data/lexicon.tsv <form> ...
```
Run tool tests:
```
cd tools/phonotactic-linter && npm test
cd tools/collision-checker && npm test
```
Requires Node ≥ 22.6 (uses `--experimental-strip-types`, zero dependencies).

## CRITICAL working discipline (learned the hard way)

- **Gate on the real exit code, never on narrated/printed output.** Tool output
  in this environment can arrive buffered or out of order. Before committing any
  data change, run the collision checker over the full lexicon and confirm
  **exit 0** — e.g. `... --lexicon data/lexicon.tsv >/dev/null 2>&1; echo $?`.
  Do not trust a "386/386 clear" line you scrolled past.
- **Re-derive facts from the committed file**, not from a prior step's claim.
  After a merge, `git reset --hard origin/main` and re-count rows / coverage /
  duplicates before reporting "done". A merged PR has more than once contained
  less than expected (e.g. script merged but data not staged).
- **Verify staging before commit:** `git status --short` then re-read the diff.
  Datasets are easy to leave unstaged.
- When a script mints/edits forms, make it **append-only or order-preserving**,
  **fail-fast** (abort if any source/coverage is missing), and **self-validate**
  through the real checker before writing.

## Invariants you must not silently break

- Decisions are constitutional. To change one, update the relevant `docs/000x`
  ADR (decision + rationale + cost), don't just change data.
- Grammar (from `0002`): three POS badges — noun `-ka`, verb `-to`, modifier
  `-pe`; acategorial roots; bound suffixes have stop/affricate onsets; subject-
  first, fluid verb placement; postpositions; no tense (aspect `li`/`wi` +
  time-words); optional plural `pu`; no obligatory articles; correlatives grid
  (§6.7). Reserved grammatical words live in the checker's `RESERVED_FORMS`.
- Lexicon sourcing = **blend rubric** (`docs/0003` §7b): CV-friendly large donors
  (Indonesian/Malay, Swahili, Japanese; others where a toneless CV stays
  recognisable), **cap any one family ≤ ~25%**, Romance allowed but capped.
  Adapt to phonotactics: `r→l`, `j→y`, `v→w`, `z→s`, simplify clusters/codas.
- **Defining new words includes their derivations.** Minting a root also creates
  its generated derived forms (`scripts/derive-lexicon.mjs`), which gloss by a
  blind template ("little 'X'", "one who 'X's"). As part of each mint batch,
  curate the new roots' notable derived glosses in `data/derived-overrides.tsv` —
  supply the **real word** where one exists (rabbit+dim → "kit", heal+place →
  "hospital") and **suppress** derivations that don't lexicalise (diminutive of an
  abstract). The reading-coverage program (`docs/0013`) is *not* done until the
  new words are correctly defined, derivations included.

## Git / PR workflow

- Develop on a `claude/talo-<topic>` branch off `main`; push with
  `git push -u origin <branch>`; open a PR (ready, not draft).
- CI (`.github/workflows/ci.yml`) runs both tool test suites. A **docs-only** PR
  (only `docs/`, `*.md`, `LICENSE*`) auto-merges on green; anything touching
  `data/`, `tools/`, or `scripts/` waits for human review.
- End commit messages and PR bodies with the session URL footer (see existing
  history for the format).
- Commit messages: state what was verified (exit codes, counts), not just what
  was intended.

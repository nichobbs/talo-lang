# talo-srs-generator

A **spaced-repetition study deck** generator. Turns the dictionary into the kind
of deck a learner imports into Anki or a flashcard app.

Two choices make it a *teachable* deck, not a data dump:

1. **Scope = the teachable core.** Only acategorial **roots** (and, with
   `--compounds`, the curated idiomatic compounds) become cards. The ~11k
   generated derivations are predictable from a root + the badge/affix rules
   (docs/0002, 0007), so they'd be flashcard noise — you study the root and the
   rules, not every paradigm cell.
2. **Order = frequency tier first.** Cards come out tier 1 → 3 (core vocabulary
   before the long tail), then alphabetically, so an importer that preserves
   order teaches the highest-value words first.

Each card carries the Talo form, its IPA, the English gloss, the conventional
badge forms (noun/verb/modifier), domain, tier, and one attested corpus example
when available.

## Use

```
# build the dictionary data first if it is stale
node --experimental-strip-types dictionary/src/build.ts

node --experimental-strip-types tools/srs-generator/src/cli.ts            # full deck
node --experimental-strip-types tools/srs-generator/src/cli.ts --max-tier 1   # core only
node --experimental-strip-types tools/srs-generator/src/cli.ts --compounds    # + compounds
node --experimental-strip-types tools/srs-generator/src/cli.ts --check        # counts only, no write
```

Writes (into `dist/`, gitignored — regenerate on demand):

- **`talo-srs.tsv`** — Anki text import, with `#separator`/`#columns` directives.
  Columns: `Talo  IPA  English  Badges  Domain  Tier  Example  ExampleEN`. In
  Anki: *File → Import*, the directives map the fields automatically.
- **`talo-srs.json`** — the same deck as an array of card objects, for any
  flashcard app or a future in-site review page.

The deck is the dictionary's teachable core: ~1,500 roots across tiers 1–3, plus
35 compounds with `--compounds`.

## Test

```
npm test     # node --experimental-strip-types --test test/srs.test.ts
```

Zero dependencies; Node ≥ 22.6 (uses `--experimental-strip-types`).

# talo-reading-coverage

The **coverage harness** for the reading-coverage scaling program (docs/0013).
Measures how much of a reference concept set the lexicon already **expresses**,
and emits the uncovered concepts as the **prioritised mint queue**.

The reference is `data/reading-reference.tsv` — the **IDS spine** (Buck's ~1,310
cross-linguistic concepts, via Concepticon, CC-BY-4.0), named as the lexicon
spine in docs/0003 §1.

## How coverage is judged

An English→Talo index is built from the dictionary's gloss keywords. A reference
concept is **covered** if any of its English synonyms (the field is
comma/semicolon/slash-separated) matches a Talo entry's gloss, or its head word
does (`give birth` → `birth`), or it's a grammatical word Talo renders
structurally (`and`, `the`, `is`).

This is a deliberate **lower bound**: exact gloss-match misses synonyms
(`big`/`large`) and counts *derivable* concepts (`third` = number+`-pe`, `sell` =
buy+`-ku`) as uncovered. So the uncovered list is a **candidate** queue — it is
**triaged** (root / derived / compound, docs/0013 §3) before minting; only
non-derivable meanings become roots. The signal is the **trend line**, driven up
batch over batch toward the 98 % target (interim 95 %).

## Use

```
node --experimental-strip-types tools/reading-coverage/src/cli.ts            # coverage % + gaps by chapter
node --experimental-strip-types tools/reading-coverage/src/cli.ts --missing  # full uncovered queue
node --experimental-strip-types tools/reading-coverage/src/cli.ts --min 95   # optional gate: fail under 95%
```

Without `--min` it never fails on coverage *level* — it's a progress report, not
a blocker, until the target is reached.

## Test

```
npm test     # node --experimental-strip-types --test test/coverage.test.ts
```

Zero dependencies; Node ≥ 22.6 (uses `--experimental-strip-types`).

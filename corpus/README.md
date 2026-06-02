# Talo corpus

A growing body of short Talo texts — starting with simplified, BBC-style news
items — each paired with English and an interlinear gloss. Two jobs:

1. **Stress-test the language on real running text** and surface what's missing
   (vocabulary, grammar, register) into [`GAPS.md`](./GAPS.md).
2. Be a **validated reading corpus** for learners: every clause is checked
   through [`tools/parser`](../tools/parser), and every content word is a real
   lexicon entry or a declared proper noun — so nothing here is ungrammatical or
   invented.

This is the fourth tool gate after the phonotactic linter (legal *words*), the
collision checker (distinct *forms*) and the parser (legal *sentences*): the
corpus check keeps the running *text* honest.

## Layout

- `articles/NNNN-slug.md` — one item each: English, then a ```talo block whose
  lines are `clause › English`, with a `# gloss:` line under each clause.
- `proper-nouns.tsv` — names used in the corpus, adapted to Talo phonotactics
  (`0005 §4`). Roots are stored bare and lowercase (`yapan` → written `Yapanka`).
- `GAPS.md` — hand-maintained punch-list of concepts/structures that forced a
  paraphrase. Inputs to a future `docs/0007-corpus` ADR; **no minting here**.
- `build/check.ts` — the gate (below).

## Article format

```talo
bukamaka tuyoipe tatakuto Yapanka yana   › A strong earthquake struck Japan yesterday.
# gloss: earthquake-N strong-MOD strike-V Japan-N yesterday
```

The checker validates the part before `›` (or a 2+ space gap); `#` lines are
comments/glosses and are skipped — same convention as the book.

## Check

```sh
npm run check
```

Exit `0` only if every clause is structurally valid **and** every content root
is in `data/lexicon.tsv` or `proper-nouns.tsv`; `1` otherwise. Requires
Node ≥ 22.6 (uses `--experimental-strip-types`), zero dependencies — like the
rest of `tools/`. Wired into CI as the `corpus-check` job.

> The checker can only catch *unknown roots in the text*. Concepts we *couldn't
> express at all* (and paraphrased around) are tracked by hand in `GAPS.md`.

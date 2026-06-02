# Talo dictionary generator

Turns the source data — [`data/lexicon.tsv`](../data/lexicon.tsv) (forms) joined
with [`data/concepts.tsv`](../data/concepts.tsv) (domain, tier, part-of-speech,
derivation) — into a structured **bilingual dictionary** in three forms:

| output | for |
|---|---|
| `dist/dictionary.json` | the data the word-lookup **web tool** loads (committed) |
| `dist/talo-english.md` | Talo → English reference, alphabetical by form |
| `dist/english-talo.md` | English → Talo index, by gloss keyword |

It is **also the cross-file integrity gate** for `data/`: every form is re-checked
through the phonotactic linter, every surface form must be unique, and badge senses
must match the part-of-speech hint. The build exits non-zero if anything is off, so
it composes in CI as a data-consistency check.

## Use

```sh
cd dictionary

npm run build    # generate dist/*  (JSON + both Markdown indexes)
npm run check    # validate the data only, no output (used in CI)
npm test         # unit tests + integrity assertions
```

Zero runtime dependencies (Node ≥ 22.6); it reuses the repo's own linter and
parser. The book and GitHub Pages site that *consume* these outputs may use a
standard toolchain, but the data layer itself stays install-free.

## What an entry looks like

Each Talo root is **acategorial** — it becomes a noun, verb or modifier by adding a
badge ([`docs/0002`](../docs/0002-morphology-grammar.md) §1). The dictionary shows
the conventional badge form(s) for each root, taken from its part-of-speech hint:

```json
{
  "id": "BOD-028", "form": "makan", "gloss": "eat",
  "keywords": ["eat"], "domain": "BOD", "domainName": "body",
  "tier": 1, "pos": "v", "isRoot": true,
  "badges": { "verb": "makanto" }
}
```

Function words and the correlatives grid take no badge and are listed as-is.

Multi-sense glosses ("look at / watch") are split into separate English headwords
so both senses are findable.

## Derived words and compounds

The dictionary also folds in the **derived layer** the morphology generates
([`docs/0007`](../docs/0007-derivation-expansion.md)) so a lookup resolves *any*
surface word, not just bare roots:

| `kind` | source file | example |
|---|---|---|
| `root` | `data/lexicon.tsv` | `tenda` "do / make" |
| `derived` | `data/derived-lexicon.tsv` | `tendakika` "doer" (`tenda+ki+ka`, agent) |
| `compound` | `data/compounds.tsv` | `panikamaka` "bathroom" (`pani+kama+ka`) |

Each derived/compound entry carries a `morphemes` breakdown (and `base` for
derived words). They are **indexed under their root meaning**, so an English
search for *teach* surfaces the root and its agent/place/result derivations
together. Every form is re-checked through the linter and the global
uniqueness gate, so the build stays an independent integrity check over all three
data files.

## Regenerating

`dist/dictionary.json` is committed (it is the published data artifact the static
site loads). The two Markdown files are generated on demand and git-ignored. Run
`npm run build` after any change to `data/lexicon.tsv`, `data/concepts.tsv`,
`data/derived-lexicon.tsv` or `data/compounds.tsv` (regenerate the latter two
first with `scripts/derive-lexicon.mjs` / `scripts/derive-compounds.mjs`).

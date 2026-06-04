# talo-glosser

An **interlinear glosser**. Auto-produces the morpheme-by-morpheme gloss line that
`corpus/articles/*.md` writes by hand:

```
$ talo-gloss "bukamaka tuyoipe tatakuto Yapanka yana"
bukamaka tuyoipe tatakuto Yapanka yana
earthquake-N strong-MOD hit-V Japan-N yesterday
```

It is three things at once: a **teaching aid** (read any clause), a
**corpus-authoring aid** (draft the `# gloss:` line, then refine), and a
**coverage gate** (`--corpus`) — every token in the reading corpus must gloss, so
a typo or a word that isn't real Talo yet fails the build.

## How a token is glossed (in order)

1. a closed-class **grammatical** word (role marker, aspect, pronoun, copula, …)
   → its fixed Leipzig-style label (these are the only words not in the
   dictionary — they take no badge, docs/0002 App. B);
2. a **content** word → its root's English gloss + a category tag from the badge
   it wears (`-ka` N, `-to` V, `-pe` MOD), resolved by surface form against the
   dictionary, preferring the bare root (so `tatakuto` → `hit-V`);
3. a **proper noun** (capitalised) → its English name from `corpus/proper-nouns.tsv`;
4. anything else in the dictionary (correlatives, numerals, quantifiers,
   time-words) → its dictionary gloss, untagged;
5. otherwise → the token marked with a trailing `?` (unglossable).

## Use

```
# build the dictionary data first if it is stale
node --experimental-strip-types dictionary/src/build.ts

node --experimental-strip-types tools/glosser/src/cli.ts "hitoka ingi matito li"
echo "yu kunato baitika lo" | node --experimental-strip-types tools/glosser/src/cli.ts
node --experimental-strip-types tools/glosser/src/cli.ts --corpus   # coverage gate
```

`--corpus` exits 1 (and lists the offending clauses) if any corpus token fails to
gloss; otherwise it prints `✓ all N corpus clauses gloss cleanly`.

## Test

```
npm test     # node --experimental-strip-types --test test/glosser.test.ts
```

Zero dependencies; Node ≥ 22.6 (uses `--experimental-strip-types`).

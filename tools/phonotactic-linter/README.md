# Talo phonotactic linter

Validates whether a candidate word is **legal Talo**, and on failure names the
specific rule it broke. This is the gate every lexicon entry must pass
(`docs/0000-design-principles.md` §5/§4); the rules it enforces are specified in
[`docs/0001-phonology.md`](../../docs/0001-phonology.md) §5.

It checks **phonotactics only**. It does *not* check near-homophone collisions
(`b/p`, `d/t`, `g/k`) or cross-language obscenities — those are the separate
collision checker's job (§4). Passing this linter is necessary, not sufficient,
for admitting a word to the lexicon. Stress is non-contrastive and unmarked
(§6), so it is neither read nor checked.

## Requirements

Node ≥ 22.6 (uses built-in type-stripping and the built-in test runner). **No
dependencies, no build step, no `npm install`.**

## Use

```bash
# one or more words as arguments
node --experimental-strip-types src/cli.ts talo tar sanpa sanfa

# words on stdin, one per line (composes as a lexicon gate)
printf 'talo\nnpa\n' | node --experimental-strip-types src/cli.ts

# machine-readable
node --experimental-strip-types src/cli.ts talo tar --json
```

Or via the package scripts: `npm run lint -- talo tar` and `npm test`.

Exit code is `0` only if **every** word is legal, else `1` (so it drops into CI
/ scripts directly).

## As a library

```ts
import { lint, isLegal } from "./src/index.ts";

isLegal("talo");        // true
isLegal("tar");         // false ('r' is not a Talo letter)

const r = lint("sanfa");
// { legal: false, word: "sanfa",
//   violation: { rule: "R4_MEDIAL_CLUSTER", message: "...", index: 3 } }
```

## The rules (summary; full text in `docs/0001-phonology.md` §5.3)

| Rule | Enforces |
|------|----------|
| `R1_ALPHABET` | only the 20 letters `a b c d e f g h i k l m n o p s t u w y` (so `j q r v x z`, case, digits, spaces all fail) |
| `R2_NUCLEUS` | at least one vowel |
| `R3_ONSET_CLUSTER` | a word starts with at most one consonant |
| `R4_MEDIAL_CLUSTER` | the only medial cluster is coda `n` + a stop/affricate (`p t k b d g c`) |
| `R5_CODA` | a word ends in at most one consonant, and only `n` |
| `R6_DOUBLED_VOWEL` | no two identical vowels adjacent (no length); unlike-vowel hiatus (`ai`) is fine |

`lint()` reports the **first** rule violated, scanning left to right.

## Tests

```bash
npm test
```

26 tests, organised by rule, including the worked-examples fixture from
`docs/0001-phonology.md` §5.4.

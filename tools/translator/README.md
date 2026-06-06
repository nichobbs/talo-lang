# Talo → English translator

A **rule-based transfer translator** for Talo. Because Talo is designed to be
regular — every content word wears a POS badge, the function-word class is
closed, morphology is regular, and forms are collision-checked (no lexical
ambiguity) — Talo → English needs no statistics, just rules.

It is built on the existing tools:

1. **LEX** — resolve each token to its English word against the 14k-entry
   `dictionary/dist/dictionary.json` (roots, derivations, compounds), the same
   data the glosser uses. (Reuses `glosser`'s `buildContext`.)
2. **PARSE** — classify each token with the parser's morphology analyzer
   (content noun/verb/modifier, function word + role, correlative, numeral).
3. **TRANSFER** — reorder Talo → English and realise grammar:
   - postposed determiners/numerals/modifiers → prenominal (`gouka nu` → "2 dogs")
   - postpositions → prepositions (`baitika lo` → "in the house")
   - fluid / SOV verb → SVO
   - aspect → tense (`li` → past, `wi` → progressive)
   - `ne` → not · `pu`/quantifiers → plural · `kena` → passive · `ce` → that
   - correlatives → wh-words (`seko` → what) · numerals → digits (`nu diko` → 20)

The output is understandable, deliberately literal English — a **reading aid**
and the **grader behind the web translation exercises**, not literary prose.
The reverse direction (English → Talo) is intentionally *not* attempted: exercises
grade a learner's Talo by parsing it and translating it back, against a reference.

## Use

```
# one sentence
node --experimental-strip-types src/cli.ts "Mi motuto gouka nu."
#   → I have 2 dogs.

# stdin, one sentence per line
echo "Te makanto wi." | node --experimental-strip-types src/cli.ts

# benchmark against every corpus clause (mt vs. the reference English)
node --experimental-strip-types src/cli.ts --corpus
```

Library:

```ts
import { buildContext, translate } from "./src/index.ts";
const ctx = buildContext(dictionaryEntries, properNounRows);
translate("Gouka kanto nekoka.", ctx); // "Dog see cat."
```

## Limits (v1)

- English **articles** (a/the) are mostly omitted (Talo has none).
- **Tense** is inferred from aspect + time-words, not full discourse; irregular
  verbs use a small table, others get regular orthography ("stilted but clear").
- Bare Talo nouns are **number-neutral**, so singular/plural is a best guess.
- Embedded **relative clauses** are handled best-effort.

Requires Node ≥ 22.6 (`--experimental-strip-types`), zero dependencies. Reads
`dictionary/dist/dictionary.json` — build it first (`cd dictionary && npm run build`).

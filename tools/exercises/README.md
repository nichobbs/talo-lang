# Talo translation exercises

The graded **exercise bank**, the **grader**, and the higher-level **generator**
behind the web "Practice" tool.

- **Bank** — `data/exercises.tsv`, a hand-authored progression (level 1 SVO →
  aspect → negation/plural → postpositions → modifiers/numerals → questions).
  Every Talo sentence is gated through the parser (`--check`).
- **Grader** — reuses the translator, both directions:
  - *comprehension* (Talo→English): is the typed English the reference meaning?
    (articles/case/punctuation normalised; the translator's rendering also accepted)
  - *production* (English→Talo): is the typed Talo grammatical **and** does it
    back-translate to the reference meaning?
- **Generator** — deterministic grammar templates × leveled vocab, with the
  translator supplying the reference English, for levels above the authored bank.

The build deck (`data/exercises.json`, bank + generated) is what the web app
loads.

## Use

```
node --experimental-strip-types src/cli.ts --check     # validate the bank (CI gate)
node --experimental-strip-types src/cli.ts --build     # write data/exercises.json
node --experimental-strip-types src/cli.ts --gen 8     # preview generated level-8 items
```

```ts
import { gradeComprehension, gradeProduction } from "./src/index.ts";
gradeComprehension("the dog sees the cat", ex, ctx); // { correct: true, ... }
```

Zero dependencies (Node ≥ 22.6). Reads `dictionary/dist/dictionary.json` — build
it first (`cd dictionary && npm run build`).

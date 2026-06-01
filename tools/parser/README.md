# Talo parser / sentence validator

Checks a Talo clause for **morphosyntactic well-formedness** against the locked
grammar in [`docs/0002`](../../docs/0002-morphology-grammar.md) and the determiner
rule in [`docs/0005` §3](../../docs/0005-grammar-completeness.md). It is the third
tool gate after the phonotactic linter (legal *words*) and the collision checker
(distinct *forms*): this one validates legal *sentences*.

Two audiences:

- **a teaching aid** — it explains *why* a sentence is wrong in novice-facing terms
  ("Subject-first is enforced: a subject must come before the verb");
- **a regression harness** — the [`docs/0004`](../../docs/0004-hello-world.md)
  corpus is its must-accept fixture set, and mutations of it are must-reject.

Zero dependencies; Node ≥ 22.6 (uses `--experimental-strip-types`), same as the
other `tools/`.

## Use

```sh
# validate one or more clauses
node --experimental-strip-types src/cli.ts "Gouka kanto nekoka"

# show the morphological breakdown of each word
node --experimental-strip-types src/cli.ts --analyze "edukika edudeka lo manuto wi"

# validate a file (one clause per line; # comments allowed)
node --experimental-strip-types src/cli.ts --file sentences.txt

# also warn on content roots that are not in the lexicon
node --experimental-strip-types src/cli.ts --lexicon ../../data/lexicon.tsv "Gouka kanto nekoka"

# machine-readable
node --experimental-strip-types src/cli.ts --json "Gouka kanto nekoka"
```

Exit `0` if every clause is structurally valid (errors are fatal; warnings are
not), `1` otherwise — so it composes in CI like the linter and checker.

## What it checks

| code | severity | rule (0002/0005) |
|---|---|---|
| `S1_BARE_ROOT` | error | every content word carries a POS badge -ka/-to/-pe (§1) |
| `S2_NO_VERB` | warning | a full clause has a verb, found by -to (§3.5); verbless = fragment |
| `S3_SUBJECT_FIRST` | error | a subject precedes the verb (§3.5, enforced) |
| `S4_ROLE_MARKER_POSTPOSED` | error | na/lo/su/fe/wa/we follow their noun (§4) |
| `S5_ASPECT_POSTVERB` | error | li/wi sit immediately after a verb (§5.1) |
| `S6_KE_FINAL` | error | the yes/no particle ke is clause-final (§6.4) |
| `S7_MODIFIER_BEFORE_HEAD` | warning | a -pe modifier precedes its head noun (§6.3) |
| `LEX_UNKNOWN_ROOT` | warning | (with `--lexicon`) the root is an attested entry |

It is deliberately conservative: Talo verb placement is **fluid** by design
(§3.5), so most orderings are legal and the validator stays quiet on them — it
flags only what the grammar actually forbids.

## Scope

Morphosyntax only. It does **not** re-check phonotactics (that's the
[linter](../phonotactic-linter/)) or near-homophone collisions (that's the
[collision checker](../collision-checker/)). A clause can be structurally valid
and still contain a non-word; run all three gates for full validation.

## API

```ts
import { validate, analyze } from "talo-parser"; // ./src/index.ts

validate("Gouka kanto nekoka");          // → { ok, issues, tokens, ... }
analyze("edukika");                       // → { kind:"content", category:"noun", root:"edu", affixes:["ki"] }
```

## Test

```sh
npm test
```

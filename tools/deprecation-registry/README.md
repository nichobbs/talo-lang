# talo-deprecation-registry

Makes **form-retirement a recorded, gated act** — never a silent change — in line
with the project's "decisions are constitutional, recorded not silent" discipline
(docs/0000).

The registry is `data/deprecations.tsv`: every form deliberately retired and
replaced, with the id, gloss, reason, governing decision, and date. The tool
validates it against the live data so that:

1. **no retired `old_form` is still live** anywhere (lexicon / derived / compound)
   — a dead spelling stays dead, so it can never silently come back for a
   *different* meaning (the trap the registry exists to prevent);
2. **each `new_form` is live under its `id`** — the recorded replacement is real,
   not aspirational;
3. **each `id` still resolves** to a lexicon concept.

It seeds with the docs/0011 §5.1 euphony re-mints (`tebana→wola`,
`halapatawa→magugu`, `conapewole→fahamu`, `sukonosino→geni`, `busiadolo→wongo`)
and grows as forms are retired. (The early sourcing pivot and the mechanical
buffer-vowel passes predate any stable vocabulary and are documented in the ADRs,
not tracked per-form here.)

## Use

```
node --experimental-strip-types tools/deprecation-registry/src/cli.ts          # list
node --experimental-strip-types tools/deprecation-registry/src/cli.ts --check  # gate
```

`--check` exits 1 (listing the offenders) on any `resurrected` /
`replacement-missing` / `unknown-id` problem; otherwise prints
`✓ N retired form(s) stay dead; every replacement is live under its id`.

## Retiring a form

Add a row to `data/deprecations.tsv` (`old_form  new_form  id  gloss  reason
decision  date`; `new_form` may be `∅` for a retirement with no replacement),
mint the replacement in `data/lexicon.tsv`, and let `--check` confirm the old
spelling is gone everywhere.

## Test

```
npm test     # node --experimental-strip-types --test test/deprecation.test.ts
```

Zero dependencies; Node ≥ 22.6 (uses `--experimental-strip-types`).

# talo-coverage-stats

Dataset **coverage statistics** over `data/lexicon.tsv` + `data/concepts.tsv`,
on three axes:

1. **Donor-family balance** — the blend rubric caps any one source family at
   **≤25%** (docs/0003 §7b). Family lives in free-text rationale/notes, so it's
   attributed best-effort: the canonical family word in the notes
   (Bantu/Japonic/Austronesian/…) wins, else the donor language in the
   rationale, after stripping any `(was …)` **rejected-source** aside (those name
   a donor that was *replaced* — a trap that otherwise inflates Romance). Forms
   whose family can't be recovered (the Phase-5b `blend; src 'X'` rows) land in
   **UNATTRIBUTED** and are reported honestly.
2. **Tier × domain coverage** — how the concept list spreads across frequency
   tiers and the 23 semantic domains.
3. **Gate health** — concepts vs forms, coined/derived counts, and — crucially —
   whether any **root** concept is missing a form (a real hole) vs a *derivable*
   concept with no root (expected, per the derivation-pruning policy).

## The cap check is sound in one direction

A family's *true* share is at least its *attributed* share (the unattributed
forms can only add to it). So an attributed share **≥25% is a provable breach**,
and `--check` gates on exactly that (plus any root concept with no form). It
can't prove *compliance* while ~13% of forms are unattributed — and it doesn't
claim to.

## Use

```
node --experimental-strip-types tools/coverage-stats/src/cli.ts          # the report
node --experimental-strip-types tools/coverage-stats/src/cli.ts --check  # gate
```

```
Donor-family balance (share of the 1442 donor-sourced forms; cap ≤25%):
  Japonic         282   19.6%  ██████████
  Bantu           272   18.9%  █████████
  …
  UNATTRIBUTED    194   13.5%  — family not recorded in notes
Gate health:
  ROOT concepts missing a form: 0
  cap breaches (provable): none
```

## Test

```
npm test     # node --experimental-strip-types --test test/coverage.test.ts
```

Zero dependencies; Node ≥ 22.6 (uses `--experimental-strip-types`).

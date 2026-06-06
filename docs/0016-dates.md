# Talo — 0016: dates (weekdays, months, day-of-month, years)

**Status:** Accepted (maintainer decision, this session). Surfaced as a recurring
gap when translating dated news prose (docs/0013 §3). Settles the calendar with
**no new vocabulary** — it is pure convention over the existing time-unit roots
(`din` day, `mingu` week, `sukia` month, `taun` year) and the numerals.

**Parent:** `docs/0002` (numerals as postposed determiners, compounds §8,
ordinals = cardinal + `-pe`, 0010), the prior "Sunday is day one" decision.

-----

## 1. Decision

Numbered throughout — the cross-linguistically dominant pattern (Mandarin,
Japanese, Portuguese, Arabic, Hebrew all number weekdays and/or months), and the
strongest positive transfer for the first-second-language learner (`0000`).

| unit | form | rule | example |
|---|---|---|---|
| **weekday** (Sunday = 1) | **compound** | `[numeral] + din + ka` | `kidinka` = Monday (2-day) |
| **month** (January = 1) | **compound** | `[numeral] + lun + ka` | `pikaelunka` = June (6-month) |
| **day of month** | phrase | `dinka [numeral]` | `dinka le` = the 5th |
| **year** | phrase | `taunka [numeral]` | `taunka kisebukidikopikae` = 2026 |

Weekdays and months share **one rule** — `[numeral] + unit + ka`, with the
day-unit `din` and the month-unit **`lun`** (← *lunar*; `month` was re-sourced
from `sukia` to this short root precisely so the two systems align — see the
deprecation in `data/deprecations.tsv`).

**Full date is big-endian (year → month → day)** — Mandarin/Japanese/Korean + ISO
8601, unambiguous:

```
taunka 2026,  pikaelunka,  dinka le   (,  pikaedinka)
year 2026,    June,        day-5      (,  Friday)
```

## 2. Weekdays and months fuse; days-of-month and years stay phrasal

Weekdays and months are **closed sets of short, high-frequency names** (7 + 12),
so they lexicalise as single compound words, **number-first** — the correct
modifier-before-head order (§8), which also keeps every form phonotactically clean
because each numeral ends in a vowel:

```
tadinka  kidinka  …  habadinka          (Sun … Sat)
talunka  kilunka  …  dikokilunka        (Jan … Dec; 11=dikota-, 12=dikoki-)
```

(`din`/`lun`-*first* — e.g. *dinmoka* — would break R4: `n`+`m`/`l`/`f`/`h` is an
illegal cluster needing a buffer vowel. Number-first avoids it.) All 7 + 12 are
registered in `data/compounds.tsv`.

**Days-of-month and years stay number+unit phrases:**
- a **year cannot fuse** — its numeral is itself multi-word (2026 =
  `ki sebu, ki diko, pikae`) — so year is necessarily `taunka [numeral]`;
- **day-of-month** is `dinka` + the **cardinal** (`dinka le` = "the 5th"); keeping
  it phrasal-cardinal distinguishes it from the fused weekday, whose count is
  internal (`ledinka` = Thursday). So `dinka le` (a date) is never the weekday
  `ledinka`.

## 3. Tooling & cost

One re-mint (`sukia` → `lun`, recorded in the deprecation registry); otherwise no
new vocabulary and no new grammar — numerals, `din`/`lun`/`taun`, the compound
rule and postposed numerals all pre-exist, so the parser accepts every form. The
7 weekday + 12 month compounds are registered in `data/compounds.tsv` (validated
through the morpho linter's seam check + the collision gate) so they are
first-class dictionary entries. Day-of-month and year are phrase patterns,
documented here, not enumerated.

Open follow-on (not blocking): a clock-time convention (hour `yamu` : minute
`meni`) and a "date" cover-term if one proves wanted — neither needed for prose.

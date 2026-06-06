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
| **month** (January = 1) | phrase | `sukiaka [numeral]` | `sukiaka pikae` = June (month-6) |
| **day of month** | phrase | `dinka [numeral]` | `dinka le` = the 5th |
| **year** | phrase | `taunka [numeral]` | `taunka kisebukidikopikae` = 2026 |

**Full date is big-endian (year → month → day)** — Mandarin/Japanese/Korean + ISO
8601, unambiguous:

```
taunka 2026,  sukiaka pikae,  dinka le   (,  pikaedinka)
year 2026,    month-6,        day-5      (,  Friday)
```

## 2. Why weekdays fuse but months/days/years don't

The seven weekdays are a **closed set of short, high-frequency names**, so they
lexicalise as single compound words — and **number-first** (the correct
modifier-before-head order, §8) keeps every one phonotactically clean, because
each numeral ends in a vowel:

```
tadinka  kidinka  modinka  fudinka  ledinka  pikaedinka  habadinka
Sun      Mon      Tue      Wed      Thu      Fri         Sat
```

(`din`-*first* — e.g. *dinmoka* — would break R4: `n`+`m`/`l`/`f`/`h` is an
illegal cluster needing a buffer vowel, giving an uneven set. Number-first avoids
it entirely.) The seven are registered in `data/compounds.tsv`.

Months, days-of-month and years stay **compositional number+unit phrases**:
- months as a compound are legal but unwieldy (June → *pikaesukiaka*, 6
  syllables); the two-word `sukiaka pikae` is shorter and mirrors Mandarin 六月;
- **years cannot fuse** at all — the numeral is itself multi-word
  (2026 = `ki sebu, ki diko, pikae`) — so year is necessarily phrasal, and
  months/days follow suit for consistency.

**Cardinal vs ordinal split (disambiguation):** day-of-month is the **cardinal**
(`dinka le` = "the 5th"); the fused weekday carries the count internally
(`ledinka` = Thursday). So `dinka le` (a date) is never confused with `ledinka`
(a weekday) or `dinka le` (five days — context).

## 3. Tooling & cost

No new words, no new grammar: numerals, `din`/`sukia`/`taun`, the compound rule
and postposed numerals all pre-exist, so the parser accepts every form. The seven
weekday compounds are added to `compounds.tsv` (validated through the morpho
linter's seam check + the collision gate) so they are first-class dictionary
entries. Months/days/years are phrase patterns, documented here, not enumerated.

Open follow-on (not blocking): a clock-time convention (hour `yamu` : minute
`meni`) and a "date" cover-term if one proves wanted — neither needed for prose.

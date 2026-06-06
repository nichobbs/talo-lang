# Talo — 0017: degree and measure (too / amount-of-change / multiplier)

**Status:** Accepted (maintainer decision, this session). Three usage gaps surfaced
by translating a technical/opinion article (corpus-as-validator, docs/0013 §3):
*"too complex to monitor"*, *"reduced downtime by 70%"*, *"forecast to more than
double"*. One small lexical addition; the other two are compositional.

**Parent:** `docs/0002` (degree adverbs, comparatives), `docs/0010` (multiplicative
`kai`), `docs/0012` (comparative standard with `fe`).

-----

## 1. Excessive degree: `tai` "too / excessively"

English "too" is two different words: the **additive** ("me too" — Talo `ti`,
FUN-018) and the **excessive** ("too complex"). Talo had only the additive. The
excessive degree is filled by **`tai`** (← Mandarin 太 *tài* "too", a near-
universal degree word; short and adds to under-represented Sinitic), a
degree adverb **postposed after the modifier**, exactly parallel to `sana` "very"
and `dake` "only":

```
gantipe sana     gantipe tai
hard-MOD very    hard-MOD too
"very hard"      "too hard"
```

**"too X to Y"** (excessive degree → blocked outcome) is `X tai` plus the
existing purpose/result grammar — most clearly a result clause:

```
sistemka gantipe tai, sehinga maniaka ne bekito kanto te
system-N hard-MOD too,   so      worker-N NEG can watch-V it
"the system is too complex for engineers to monitor"
```

**Cost.** `tai` is a **FUN degree-adverb lexicon word** (like `sana`/`ti`/
`dake`), collision-protected as a lexicon form — it does **not** reopen the frozen
20-particle closed class (`0011`); it's ordinary extensible vocabulary. Added to
the parser's `FUNCTION_WORDS.other` so it parses bare, and glossed `too` from the
dictionary.

## 2. Amount of change: a bare postposed measure ("by N%")

"reduce/increase **by** N%" needs no marker — the extent of change is a **bare
postposed measure phrase**, as in Mandarin (减少 70%):

```
te reducto henti-yamuka  kidiko percent
it reduce-V downtime-N   seventy percent
"it reduced downtime by 70%"
```

The measure simply follows the verb's object, like any postposed quantity. No new
word, no new rule.

## 3. Multiplier comparatives ("more than double")

Composes from the multiplicative `kai` (N times, `0010`) and the comparative
standard `lebi … fe` (`0012`):

```
nu kai          "double" (two times)
lebi nu kai fe  "more than double" (more than two-times)
```

"forecast to more than double within three years" → `… lebi nu kai fe, naka mo
taunka` (… more than 2×, within three years). Documentation only.

## 4. Change set

`tai` added to `data/concepts.tsv` + `data/lexicon.tsv` (FUN-029) and the
parser's `FUNCTION_WORDS.other`; locked by a parser test. §2 and §3 are
conventions over existing words. No change to the frozen particle inventory.

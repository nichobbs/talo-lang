# Talo — 0018: counterfactual conditionals, ranges, and fused numerals

**Status:** Accepted (maintainer decision, this session). Three gaps surfaced by
verbatim-translating a medical-research article (corpus-as-validator, docs/0013
§3): a *counterfactual* ("if the drug **had** worked…", contrary to fact), a
*numeric range* ("**5 to 10** years"), and the discovery that the parser did not
recognise **fused** compound numerals (`dikole` = 15) as numbers. One lexical
addition; one convention over existing words; one parser fix.

**Parent:** `docs/0002` (conditionals with `fi`, §6; numerals, §5), `docs/0003`
(numeral set §5), `docs/0005` (conditional examples §1).

-----

## 1. Counterfactual / hypothetical `andai` "supposing, if (only)"

Talo `fi` (FUN-011) is the **real / open** conditional ("if it rains, I stay" —
the antecedent may well hold). It cannot carry the *contrary-to-fact* reading
that English marks with the past-perfect ("if it **had** worked"). Because Talo
is tenseless (no past-perfect to borrow), the counterfactual needs its own
marker.

**`andai`** (← Indonesian/Malay *andai* / *seandainya* "supposing, if only",
itself a dedicated hypothetical conditional) fills it, used exactly like `fi` —
clause-initial on the antecedent:

```
andai obatka kena kelato li, patai-yamuka somato wi
supposing drug-N  PASS work-V  ANT,  patient-N    improve-V  PFV
"had the drug worked, the patient would have improved"
```

The contrary-to-fact sense lives in `andai` itself; anteriority (`li`/`mae`/
`ato`, 0014) and aspect carry the time relation as usual. `fi` stays the
neutral/real conditional; the two are a minimal semantic pair (FUN-011 vs
FUN-030).

**Cost.** `andai` is an ordinary **FUN lexicon word** (like `fi`, `walau`,
`sababu`), collision-protected as a form — it does **not** reopen the frozen
20-particle closed class (`0011`). Added to the parser's `FUNCTION_WORDS.other`
and glossed from the dictionary.

## 2. Numeric ranges: `X su Y` "from X to Y"

"5 to 10 years" reuses the existing range/extent role marker **`su`** (the same
particle already used for the comparative *than*-floor and bounded extent) as a
postposed connector between the two bounds. The range is a **quantity, i.e. a
postposed determiner** (0005 §3), so — like every Talo determiner — it follows
its noun:

```
taunka le su diko
year-N five RANGE ten
"five to ten years"
```

No new word and no new rule — `su` already exists, and the determiner-follows-
noun order is unchanged; this only documents `su` connecting two numeral bounds.
(Numeral-first English order, `le su diko taunka`, is *not* legal: determiners
are postposed.)

## 3. Fused compound numerals parse as numbers (parser fix)

Single numerals (`so ta ki … diko samu sebu milion`) are listed in the parser's
`FUNCTION_WORDS.other`, but **fused** compound numerals — written as one token —
were not, so `dikole` (15), `dikoki` (12), `habadiko` (70), `kisebu` (2000) fell
through to `S1_BARE_ROOT`. They are not bare roots; they are numerals.

The morphology analyzer now recognises a token that segments **entirely into ≥2
numeral morphemes** as a numeral (`functionRole: "number"`), via a greedy
longest-first scan over `NUMERAL_MORPHS`. Single numerals are unaffected (already
caught by the function-word list); only the fused compounds are newly classified.
This lets percentages, years, and the §2 ranges parse cleanly.

```ts
// morphology.ts
const NUMERAL_MORPHS = ["milion","sebu","samu","diko","pikae","haba","cewa",
                        "huba","le","fu","mo","ki","ta","so"];
```

> **Note (open review).** `NUMERAL_MORPHS` mirrors the current 0003 §5 set. A
> pending review of the digits 6–9 (the blend forms `pikae/haba/cewa/huba`) may
> revise these morphemes; any re-mint updates this list and the weekday/month
> compounds in lock-step.

## 4. Change set

`andai` added to `data/concepts.tsv` + `data/lexicon.tsv` (FUN-030) and the
parser's `FUNCTION_WORDS.other`; `isCompoundNumeral()` added to
`tools/parser/src/morphology.ts`; both locked by parser tests. §2 is a convention
over the existing `su`. No change to the frozen particle inventory.

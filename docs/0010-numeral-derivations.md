# Talo — Proposal 0010: Numeral derivations (ordinal · multiplicative · fraction)

**Status: PROPOSED** (awaiting ratification under governance, `0000` §6 / **O-6**).
Proposes **additions** to the closed-class numeral system; changes no frozen
decision and mints no data until ratified. The written-up answer to "what would it
take to say *third*, *three times*, *a third*?".

**Parent:** `docs/0003-lexicon.md` §5 (base-10 numerals) and
`docs/0002-morphology-grammar.md` §6.6 / `docs/0005` §3 (numerals are a
**postposed determiner** class). **Constraints inherited:** `0001` R1–R6 + §2.1;
every form below was gated against the live lexicon (see §5).

-----

## 0. Why a proposal

Numerals are **closed-class determiners** (`0005` §3), badge-less like pronouns,
so the `0007` derivation machinery cannot generate ordinals/multiplicatives from
them. Each new series needs either a **new closed-class marker word** or a fixed
construction — a grammar change, hence governance, hence proposal.

-----

## 1. The gaps (and what already covers part of them)

| Need | Today | Status |
|---|---|---|
| **Cardinal** ("three books") | `liboka ki` (numeral postposed, `0005` §3) | ✅ done |
| **Ordinal** ("the third book") | — | ✗ missing |
| **Multiplicative** ("three times / threefold") | — | ✗ missing |
| **Fraction** ("a third", "two thirds") | `setenga` = ½ exists; no general form | ◐ partial |
| **Distributive** ("two each") | `kila` "each" (already a quantifier) | ✅ reuse `kila` |
| **Approximate** ("about three") | `mungi` "maybe" / numeral + a hedge | ◐ degrade gracefully |

So only **three** real gaps: ordinal, multiplicative, fraction.

-----

## 2. Proposal — three free marker words, each postposed to a numeral

All three keep numerals **invariant** and add a **following marker** (harmonising
with the postposed-determiner rule, `0005` §3, and the head-final/postpositional
choices `0002` §4). The numeral never changes shape — only a marker is added, so
the whole system stays regular and additive (rule 5).

| Marker | Series | Construction | Gloss | Source |
|---|---|---|---|---|
| `banu` | **ordinal** | `NUM + banu` | Nth | Japanese *-ban(me)* "order/№" |
| `kai` | **multiplicative** | `NUM + kai` | N times / N-fold | Japanese 回 *-kai* "times/occasions" |
| `bagi` | **fraction** | `NUM bagi NUM` | a/b (a parts of b) | Indonesian *bagi* "divide/share" |

### 2.1 Ordinal `banu`
```
liboka ki banu        the third book      (ki = 3, postposed; banu = ordinal)
homika ta banu        the first person    (ta = 1)
```
Reads as "book three-th". Because it is a determiner-class marker it stacks in the
fixed determiner order (Noun – ordinal – …, `0005` §3); demonstratives compose:
`liboka ki banu itu` "that third book".

### 2.2 Multiplicative `kai`
```
mi tumito ki kai      I ran three times
te bolato mo kai      it grew fourfold     (mo = 4)
ta kai                once   ·   ki kai = three times
```
Post-verbal adverbial use is natural (it follows the verb phrase like an aspect
particle, `0002` §5.1) and it can also modify within a noun phrase ("a threefold
increase") via the modifier badge on a hosting root.

### 2.3 Fraction `bagi`
`bagi` is the **divide** relation, so a fraction is literally "a divided-by b":
```
ta bagi ki            one third   (1 ÷ 3)
le bagi mo            two quarters / a half   (le = 2, mo = 4)
```
"Half" keeps its dedicated high-frequency word `setenga` (already a quantifier,
`0005` §3); `bagi` supplies every *other* fraction compositionally, so we add one
marker, not a table. A fraction can quantify a noun like any numeral phrase:
`watoka ta bagi ki` "a third of the water".

-----

## 3. Why markers, not new numeral words or affixes

- **Postposed free markers**, not bound affixes: numerals are determiners, not
  content roots, so they take no badge and host no affix (`0005` §3). A following
  marker is the only mechanism consistent with that. (Rule 4.)
- **No ordinal/​multiplicative *number* words** (a separate `first/second/third`
  series): that doubles the numeral vocabulary for a fully predictable relation —
  economy lost, against rule 3. The marker makes ordinals *derived from* cardinals
  (rule 5), so learning the cardinals unlocks all three series.
- **`bagi` over a "fraction" word per denominator:** one divide-marker generates
  the whole rational space; the only memorised fraction is the irregular,
  ultra-frequent `setenga` ("half"), kept for transfer. (Rules 1, 3.)
- **Distributive reuses `kila`** ("each") and **approximation degrades** onto
  existing hedges — no new machinery for the long tail (rule 2).

-----

## 4. Cost (recorded)

- **+3 closed-class markers** (`banu`, `kai`, `bagi`). Each is one short,
  high-frequency, donor-recognisable word; together they unlock three infinite
  series at constant cost.
- **`bagi` is overloaded** as both "divide" (arithmetic) and the fraction marker —
  accepted as graceful, transparent reuse (rule 2), exactly as `wa` covers
  instrument+comitative (`0002` §4).

-----

## 5. Gate status (verified)

All three forms were checked through the real collision checker against the
**live** `data/lexicon.tsv` — all clear (no homophone / near-homophone / reserved
/ obscenity / false-friend conflict). Note `kali` (Indonesian "times") was the
first multiplicative candidate but is a **near-homophone of `gali`** (PHY-065)
under the weak stop contrast `0001` §2.1, so `kai` was chosen instead:

```
node --experimental-strip-types tools/collision-checker/src/cli.ts \
  --against data/lexicon.tsv banu kai bagi
→ ✅ banu — clear   ✅ kai — clear   ✅ bagi — clear   (3/3 clear, exit 0)
```

-----

## 6. If ratified — the change set

1. `0003` §5 (or a short addendum): add the ordinal/multiplicative/fraction
   constructions; cross-reference the determiner order in `0005` §3.
2. `tools/collision-checker` `RESERVED_FORMS` + `tools/parser` `FUNCTION_WORDS`:
   add `banu`, `kai`, `bagi`.
3. `data/concepts.tsv` + `data/lexicon.tsv`: add the three as `QTY`/`FUN` entries.
4. Corpus coverage: a sentence each (the `0008` gate).

Until then this is the proposal of record; nothing downstream changes.

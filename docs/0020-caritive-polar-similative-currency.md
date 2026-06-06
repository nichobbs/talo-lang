# Talo — 0020: caritive, embedded polar questions, similative, and currency

**Status:** Accepted (maintainer decisions, this session). Surfaced by translating
an agent-generated news feature on AI-generated art (corpus-as-validator,
`docs/0013` §3). Three small grammar settlements + one notation convention + the
vocabulary they need. The guiding test for a new function word: **add one only
when the meaning is not compositionally available AND reusing an existing word
would be ambiguous or clumsy** — otherwise reuse.

**Parent:** `docs/0002` (function words, correlatives), `docs/0012` (complementiser
`ce`), `docs/0005` (questions, determiners).

-----

## 1. Caritive "without" — `tanpa` (new particle)

"without training", "without permission", "without AI" recur constantly in real
prose, and the only compositional alternative — `X ne motu` ("not having X") — is
a different clause structure and reads clumsily. So the caritive earns a word:
**`tanpa`** (← Malay/Indonesian *tanpa* "without"), a postposition parallel to the
role markers:

```
kihabo tanpa        isinibo tanpa        kikaiakalika tanpa
training without     permission without   AI without
"without training"  "without permission" "without AI"
```

Added to the parser's `FUNCTION_WORDS.other`. It does **not** reopen the frozen
particle inventory (`0011`); like `tai`/`andai` it is ordinary extensible
vocabulary, collision-protected as a lexicon form (FUN-031).

## 2. Embedded yes/no ("whether") — reuse `ce … ke`

No new word. The complementiser `ce` "that" (`0012`) + the clause-final question
particle `ke` (`0002` §6.4) compose to exactly an **embedded polar question**:

```
te ne tauto ce hitoka o kikaika tendato senika ke
they NEG know that human or machine make art Q
"they don't know whether a human or a machine made the art"
```

Unambiguous and compositional, so `ce … ke` is the construction for "whether".

## 3. Similative / equative "as, like" — reuse, no new word

English "as/like" is three distinct senses; Talo already has a precise device for
each, so a single new particle would be *less* precise:

| sense | example | Talo |
|---|---|---|
| **manner** (clause) | "as photography once was" | `sewa` (manner correlative, "the way that") |
| **similative** (NP) | "comparable to photography" | `sadisape` "similar" / `samape` "same" (modifier) |
| **equative / role** | "treat it as a guarantee" | paraphrase: name/call it Y, or `ce X ya Y` |

## 4. Currency notation

A monetary amount is **`[numeral] + [currency-noun]`**; the currency symbol may be
written for brevity. £50 = `lediko ponka` (spoken), "£50" (written). Currency names
are ordinary `POS` nouns. Minted set: `pon` £, `dolan` $, `eulo` €, `yen` ¥(JP),
`yuan` ¥(CN), `lupia` rupee, `falan` franc, `won` ₩, `peso`, `lila` lira,
`lubeli` ruble.

## 5. Change set

`tanpa` (FUN-031) + the art-market roots `yuala` sell, `ancama` threaten, `isini`
allow/permit, `ubola` quality, `asili` original/authentic (POS/ACT/PROP) + the 11
currency nouns, all in `data/concepts.tsv`/`lexicon.tsv` and gated by both screens;
`tanpa` in the parser; the compound `kikaiakalika` (AI = machine-mind) in
`data/compounds.tsv`; curated derivations (seller, threat, permission) in
`scripts/gen-derived-overrides.mjs`. §§2–3 are conventions over existing words; §4
is a notation convention. No change to the frozen particle inventory. The article
that surfaced these is added separately to `corpus/articles/`.

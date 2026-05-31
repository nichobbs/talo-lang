# Talo — Phase 5 (grammar pass): completing the usable core

**Status:** Decided. This ADR **resolves the four open gaps** the hello-world
slice surfaced (`0004` §8) plus the **conditionals** question, so that the frozen
core can express everyday discourse without ad-hoc workarounds. It is *additive*:
it **fills in** constructions that `0002` left unspecified (conditionals,
existential/locative predication, the determiner class, proper nouns) — it does
**not** reopen or reverse any locked decision in `0000`–`0003`. Where it touches
`0002`, it is a clarifying cross-reference, not a change of decision.

**Parent:** `docs/0000-design-principles.md` (the tie-break rules), `docs/0002`
(the morphology/grammar this completes), `docs/0003` (the sourcing rubric the new
forms obey), and `docs/0004` §8 (the gap list this closes).

**Tie-break rules referenced** (`0000` §0): 1. transfer beats internal elegance ·
2. graceful degradation over enforcement · 3. predictability beats economy ·
4. transparency beats brevity · 5. derivation is additive.

> **What is normative here.** §§1–4 add **structure** (rules); §5 adds **lexicon**
> (seven new forms). Both are constrained exactly as the earlier phases were:
> every new form passes the two gates (linter R1–R6 + collision checker), and
> every construction is justified against the §0 rules with its rejected
> alternative and accepted cost recorded.

-----

## 0. What this resolves

| # | Gap (from `0004` §8 / new) | Resolved in |
|---|---|---|
| 1 | Conditionals — only the word `fi` existed, no construction | §1 |
| 2 | No locative/existential predication ("I am here / there is X") | §2 |
| 3 | Determiner order vs. modifier-before-head (a real `0004` slip) | §3 |
| 4 | No proper-noun policy | §4 |
| 5 | No phatic layer (hello/bye/please/thanks/sorry/okay) | §5 |

-----

## 1. Conditionals — `fi` clause-initial, result clause bare

**Decision.** A conditional is **`fi` (FUN-011) + the condition clause, then the
result clause**. `fi` sits **clause-initially**, before the condition. The result
clause is a **plain clause with no obligatory marker** (zero-default); it may
optionally be headed by `toki` "then" (TIM-010) or `sehinga` "so/therefore"
(FUN-013) when the speaker wants the consequence flagged.

```
Fi yu datanto, mi yato senanpe.
if you come.V,  I  COP happy.MOD
'If you come, I am happy.'

Fi panika kunato, mi pinato.
if water.N exist.V, I drink.V
'If there is water, I drink.'                       (uses the existential, §2)

Fi yu belayato, toki yu tauto lebi.
if you learn.V, then you know.V more
'If you learn, then you know more.'                 (optional 'toki' heads result)
```

**Rationale (placement).** Clause-initial `fi` maximises positive transfer: the
biggest donor blocs put the conditional marker first — Indonesian/Malay
*kalau/jika …*, Mandarin *rúguǒ … (jiù)*, Hindi *agar …*, and the European
languages *if/si/se/wenn …*. The result-then construction (`fi … , toki …`)
mirrors *kalau … maka …* / *rúguǒ … jiù …* exactly. (Rule 1.) The cost is a small
break from Talo's otherwise head-final harmony — the one head-final donor
(Japanese) marks conditionals clause-**finally** (`… nara`) — but transfer for
the larger blocs wins (rule 1 over internal elegance), and the condition-first
linear order is still the cross-linguistic majority.

**No tense needed.** `fi yu datanto` covers "if you come / if you came" alike;
`0002` §5.1 has no tense, and open conditionals do not require it. Aspect
(`li`/`wi`) or a time-word is added only when it matters, as everywhere else.

**Counterfactuals — graceful degradation, no new machinery.** Talo does **not**
grammatically mark irrealis/unreality (consistent with no-tense and zero-default,
`0002` §5.1). A counterfactual ("if I had money, I would buy a book") uses the
**same** `fi` construction; the unreal reading comes from **context**, optionally
reinforced by `mungi` "maybe/perhaps" (FUN-021):

```
Fi mi motu uanka, mi belito honka.
if I have.V money.N, I buy.V book.N
'If I have / had money, I (will / would) buy a book.'   (reality from context)
```

*Rejected: adding an irrealis/conditional-mood particle now.* It would let
counterfactuals be marked explicitly, but it is new closed-class machinery for a
distinction several huge L1s (Mandarin, Indonesian) leave to context, so it
fronts a judgement the primary persona rarely needs (rules 2, 3). The door stays
open: because the marker would be a *free* word, governance can **add** it later
(`0000` §6) without breaking anything (rule 5).

-----

## 2. Existential & locative predication — the verb `kuna`

**Decision.** A dedicated verb root **`kuna`** "exist / be (located)" (POS-006,
badged `kunato` like any verb). It carries the two predications the copula `ya`
does **not** (`0002` §6.3 limits `ya` to noun- and modifier-predicates):

```
Existential — "there is X" (X is the subject; subject-first holds, 0002 §3.5):
  Panika kunato.            water.N exist.V             'There is water.'
  Bala kunato baitika lo.   someone exist.V house.N LOC 'There is someone in the house.'

Locative predication — "X is at/in Y" (kuna + locative marker 'lo', 0002 §4):
  Mi kunato inilo.          I exist.V here              'I am here.'
  Gouka kunato baitika lo.  dog.N exist.V house.N LOC   'The dog is in the house.'

Negated / questioned like any verb:
  Panika ne kunato.         water.N NEG exist.V         'There is no water.'
  Bala kunato baitika lo ke? someone exist.V house.N LOC Q  'Is anyone in the house?'
```

**Rationale.** A separate existential/locative verb is the cross-linguistic norm
and keeps each predication pattern distinct and learnable (rule 4): equation and
property stay on the copula `ya`, existence and location go on `kuna`. This
matches the donor languages — Swahili *kuna*, Indonesian *ada*, Japanese
*aru/iru*, Mandarin *yǒu* / *zài* — none of which use their plain copula for "there
is". Being an ordinary verb root, `kuna` takes aspect (`kunato wi`), negation
(`ne kunato`), questions (`ke`) and **derivation** for free (`kunaka` "existence /
presence"). It also resonates internally: the existing `hakuna` "none" (QTY-022,
Swahili) is transparently *ha-* + *kuna*, so the existential and its negation
already echo each other.

**Why `kuna` and not extend `ya`.** Extending the copula to take a locative
complement (`0004` §8.1 option a) would overload one verb with three jobs and
re-introduce predication-by-context that `0002` §6.3 deliberately avoided
(rule 4). *Reusing `motu` "have"* (option c) conflates possession with existence —
two distinct relations in most L1s. A dedicated verb is the transparent choice.

> **No animacy split.** Unlike Japanese *aru* (inanimate) / *iru* (animate),
> `kuna` is **one** verb for all existents — consistent with Talo's avoidance of
> grammatical sub-classes (`0002` §3.1; rule 3).

-----

## 3. Determiners are a postposed class (distinct from `-pe` modifiers)

**Decision.** Talo has a closed **determiner** class — **demonstratives** (`ini`
this, `itu` that), **numerals** (`ta`, `ki`, …) and **quantifiers** (`ingi`
many, `ote` all, `badi` some, `kidogo` few, `kila` each, …) — that **follows the
head noun**. Determiners are **not** `-pe` modifiers: descriptive modifiers
**precede** the head (`gande kotaka` "big city", `0002` §6.3), determiners
**follow** it. When stacked, the order is **Noun – demonstrative – quantity**, with
the plural particle `pu` outermost:

```
gouka itu        dog.N that          'that dog'
gouka ki         dog.N two           'two dogs'
gouka itu ki     dog.N that two      'those two dogs'
nenoka ingi      word.N many         'many words'
gouka ote pu     dog.N all PL        'all the dogs'
```

**Rationale.** `0002` already postposes the two determiners it mentions —
demonstratives (`kanuka itu`, §6.6) and the plural particle (`kanuka pu`, §5.2) —
and the numeral example (`kanuka ta`, §6.6) is postposed too. This decision simply
**names the class** and brings quantifiers and numerals under the same rule, giving
one exceptionless ordering principle (rule 3): *describe before, determine after.*
Keeping determiners off the `-pe` badge is correct — they don't inflect or take a
POS badge (they're closed-class, `0002` §6), so calling them "modifiers" would
mis-imply they could be `-pe`-marked.

> **Correction of `0004`.** The slice wrote `ingi nenoka` "many words" with the
> quantifier **pre**-posed — an inconsistency with its own `gouka ki` (numeral
> postposed). This was exactly the kind of latent ambiguity the *use-it-early*
> phase exists to catch (`0000` §8). Under this rule the correct form is
> **`nenoka ingi`**. (`0004` is descriptive; this ADR is the norm.)

This rule is cross-referenced from `0002` §6.6.

-----

## 4. Proper nouns are ordinary nouns — they take `-ka`

**Decision.** A proper noun (personal name, place name, branded label) is a
**noun** and takes the noun badge **`-ka`** when it fills a content-word slot, like
any other noun. The name itself is the root, **adapted to Talo phonotactics**
exactly as a loanword is (`0003` §7: `r→l`, `j→y`, simplify clusters/codas, etc.).

```
Milaka datanto.            Mila.N come.V            'Mila comes.'
Mi kanto Satoka.           I see.V Sato.N            'I see Sato.'
Mi we namaka yato Milaka.  I GEN name.N COP Mila.N   'My name is Mila.'
```

**Rationale.** This is the *only* policy consistent with the badge-final parser
(`0002` §1): the parser reads a word's category from its **final badge**, and
locates the verb by `-to`. A bare, badge-less name in an argument slot would be
uncategorisable — and the parser cannot keep a list of all possible names (an
open class). Badging makes every name parse with **zero exceptions** (rule 3). The
cost — names gain a syllable (`Mila` → `Milaka`) — is the same verbosity cost
`0002` §1 already accepted for *all* nouns; nothing new is conceded. The full name
remains intact at the front, so recognition is unharmed (rule 4).

**Gate treatment.** Proper nouns are **not** lexicon entries and so are **not**
run through the homophone/false-friend gates (those screen the shared
vocabulary). A speaker adapting a name should still steer clear of the
**obscenity** blocklist — the same courtesy any borrowing observes.

> **Supersedes `0004` shorthand.** Dialogue 1 used bare `Mila`/`Sato` as informal
> copula complements; under this rule the regular forms are `Milaka`/`Satoka`.

*Rejected: a dedicated proper-noun particle* (keep the name bare, mark it with a
preceding word). It preserves the name's exact shape but adds new closed-class
machinery and a second nominal pattern the learner must hold apart (rules 3, 4);
badging reuses a rule already known.

-----

## 5. The phatic layer — six everyday interjections (+ greeting)

**Decision.** Six new closed-class **interjections** (no badge, like `hi`
yes / `no` no — `0002` §6): they stand alone or frame a clause but never inflect.
All six pass both gates and are spread across donor families per the blend rubric
(`0003` §7b), with no single family added more than twice:

| id | gloss | form | source | family |
|---|---|---|---|---|
| FUN-022 | hello | `aloha` | Hawaiian *aloha* | Polynesian |
| FUN-023 | goodbye | `cao` | Italian *ciao* | Romance (capped) |
| FUN-024 | please | `doso` | Japanese *dōzo* | Japonic |
| FUN-025 | thank you | `makasi` | Indonesian *(terima) kasih* | Austronesian |
| FUN-026 | sorry | `pole` | Swahili *pole* | Bantu |
| FUN-027 | okay | `oke` | international *okay/oké* | international |

```
Aloha! Yu yato sela?          'Hello! Who are you?'
Doso, yu tolonato mi.         please, you help.V me     'Please help me.'
Makasi sana!                  thank-you very            'Thank you very much!'
Pole. Cao!                    'Sorry. Goodbye!'
```

**Rationale.** Greetings, please/thank-you/sorry and an assent word are among the
highest-frequency utterances in any language and were the most glaring absence the
slice hit (`0004` §8.2 — Dialogue 1 had to *calque* a greeting as `Haope dinka`).
They are interjections, not content words, so no badge applies (`0002` §6). The
forms are chosen for **wide recognisability** (`aloha`, `cao`, `oke` are near-global;
`doso`, `makasi`, `pole` are large-donor) rather than internal derivation — phatic
words resist composition and benefit most from raw transfer (rule 1). Six is a
deliberately small launch set; the inventory is extensible by governance (`0000`
§6).

-----

## 6. Data changes & gate verification

**Added to `data/concepts.tsv` and `data/lexicon.tsv` (7 forms):**
`kuna` (POS-006), `aloha` (FUN-022), `cao` (FUN-023), `doso` (FUN-024), `makasi`
(FUN-025), `pole` (FUN-026), `oke` (FUN-027). Lexicon now **393 forms**.

**Gate discipline (`CLAUDE.md`).** Each new form was checked `--against` the live
lexicon, then the **whole lexicon** was re-run through the collision checker and
confirmed **exit 0** before commit (homophone / near-homophone / reserved /
obscenity / false-friend all clear; linter R1–R6 clear). The near-homophone screen
rejected an earlier existential candidate `ada` (collides with `ata` "above" under
the weak stop contrast, `0001` §2.1), which is why `kuna` was chosen.

-----

## 7. Costs knowingly accepted

1. **Conditional `fi` breaks head-final harmony** (§1) — clause-initial, against
   Talo's postpositional tendency; bought for majority-donor transfer (rule 1).
2. **No grammatical counterfactual** (§1) — unreality is contextual; accepted as
   graceful degradation, reversible by governed addition (rules 2, 5).
3. **A third predication verb** (`kuna`, §2) — one more pattern than the copula
   alone; bought for transparent, non-overloaded predication (rule 4) and matching
   the donors.
4. **Names gain a badge** (§4) — `Mila` → `Milaka`; the same verbosity cost already
   paid for every noun, conceded for exceptionless parsing (rule 3).

-----

## 8. Interfaces to later phases

- **Parser / validator (`0000` §5; `0002` §9).** §§1–4 add must-accept fixtures
  (conditionals, `kuna` predications, `Noun-determiner` order, badged names) and
  must-reject mutations (e.g. determiner pre-posed, name un-badged in an argument
  slot). The `0004` appendix corpus should be updated to the §3 determiner order.
- **Lexicon scaling (`0000` §8 step 2).** With the grammar gaps closed, the next
  Phase-5 stream is breadth: grow `concepts.tsv` toward the ~1,500 target and mint
  through both gates. The phatic set may be widened (e.g. *welcome, excuse-me*) as a
  cheap governed batch.
- **Governance (`0000` §6, open decision O-6).** An **irrealis/conditional-mood
  particle** (§1) and **further role markers** (`0002` §4) remain explicitly
  deferred, additive options — inputs to the freeze-boundary decision.
- **`0002` cross-reference.** §3 (determiner class) is pointed to from `0002` §6.6;
  a future consolidation may fold the rule back into `0002` proper.

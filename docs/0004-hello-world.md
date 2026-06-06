# Talo — Phase 4: "Hello world" — the first usable slice

**Status:** Decided (descriptive, not normative). This ADR does **not** change any
locked decision in `0000`–`0003`. It is the first *test-top-down* phase
(`0000` §8): it takes the frozen phonology (`0001`), the frozen morphology/grammar
(`0002`) and the minted lexicon (`0003`, 386 forms in `data/lexicon.tsv`) and
*uses* them — an annotated everyday corpus — to confirm the pieces compose into
real speech, and to surface what is missing **before** vocabulary is scaled.

**Parent:** `docs/0000-design-principles.md` §8 ("start *using* Talo for real as
early as Phase 4 — a 'hello world' vertical slice … before scaling vocabulary").

**Authority of this document.** The dialogues and sentences below are
*instantiations*, not new rules. Where a sentence is grammatical I show why by
citing `0002`; where the grammar gave **no** clean way to say something, I record
it in §8 as an open question to resolve in a later ADR — I do **not** invent a
construction here. Every Talo content word used is either a form from
`data/lexicon.tsv` or a transparent derivation/compound of lexicon roots via the
`0002` §3 affixes; every grammatical morpheme is from the `0002` Appendix B
inventory.

-----

## 1. What "hello world" is testing

`0000` §8 splits the build into *freeze bottom-up* (phonology → morphology →
lexicon) and *test top-down* (use the language early, before it is big). Phases
1–3 did the freezing. This phase does the first real test, and it is deliberately
a **vertical slice**: a little of every layer, exercised together in connected
discourse, rather than more of any one layer.

Three questions it answers:

1. **Do the layers compose?** Can the badges, role markers, aspect/number
   particles, copula, negator, questions, derivation and the correlatives grid be
   combined into sentences that are unambiguous and parseable by the `0002` rules?
2. **Is 386 words enough to "hold a real everyday conversation"** (the §8
   target)? If yes, the §8 sequencing claim is validated; if the gaps are
   *vocabulary*, that tells Phase 5 which concepts to mint next; if the gaps are
   *grammatical/phatic*, that tells us what the frozen core still lacks.
3. **What does running text feel like** for the primary persona — does the
   transfer pay off, and is the accepted badge-verbosity (`0002` §1) tolerable?

-----

## 2. How to read the glosses

Each example is given in three lines: **Talo**, a **morpheme gloss**, and a
**free translation**. In the morpheme line, the three POS badges (`0002` §1) and
the bound affixes (`0002` §3.2) are written after a dot on the word they sit on;
free grammatical words are glossed in SMALL-CAPS abbreviations.

```
BADGES (bound, word-final):     .N = -ka (noun)   .V = -to (verb)   .MOD = -pe (modifier)
DERIV AFFIXES (bound):          AGT -ki · INSTR -tu · RESULT -bo · PLACE -de · QUAL -pa
                                DIM -ci · AUG -go · OPP -ku · CAUS -ta · INCH -pi
ROLE MARKERS (free, postposed): DAT na · LOC lo · GOAL su · SRC fe · INS wa · GEN we
ASPECT (free, post-verb):       PERF li · PROG wi          NUMBER: PL pu
CLUSIVITY:                      INCL sa · EXCL fo
FUNCTION:                       COP ya/yato · NEG ne · Q ke (yes/no) · and i · who/what/… in-situ
```

A reminder of the two structural rules every line obeys (`0002` §7, Appendix A):
**subject comes first** (enforced), the **verb is found by its `-to` badge**
(placement otherwise fluid), **modifiers precede their head**, adpositions are
**postpositions**, and **question words stay in place** (in-situ).

-----

## 3. Mini-lexicon used in this document

Every content word below, with its `data/lexicon.tsv` id, so the corpus is
self-contained and traceable. Badges/affixes are added per `0002`; they are not
part of the stored form (acategorial roots, `0002` §2.1).

| gloss | root | id | | gloss | root | id |
|---|---|---|---|---|---|---|
| good | hao | PROP-017 | | day | din | TIM-002 |
| name | nama | SPE-003 | | person/human | hito | KIN-001 |
| friend | tomo | KIN-014 | | city/town | kota | SOC-005 |
| water | pani | PHY-008 | | food | cakula | FOO-001 |
| want | mau | EMO-003 | | drink | pina | BOD-029 |
| eat | makan | BOD-028 | | come | datan | ACT-003 |
| go | iku | ACT-002 | | see | kan | PER-001 |
| give | dona | ACT-009 | | cut | kata | ACT-022 |
| knife | kisu | DWE-006 | | dog | gou | ANI-002 |
| cat | neko | ANI-005 | | big | gande | PROP-001 |
| small | piko | PROP-002 | | happy | senan | EMO-005 |
| know | tau | COG-001 | | learn | belaya | COG-004 |
| teach | ayali | COG-005 | | word | neno | SPE-002 |
| language | bahae | SPE-004 | | understand | paha | COG-003 |
| book | hon | MOD-002 | | read | baca | SPE-007 |
| doctor | iha | MOD-016 | | light (illum.) | hikali | PHY-026 |
| sun | taio | PHY-001 | | moon | bulan | PHY-002 |
| full | penu | PROP-019 | | help | tolona | ACT-037 |
| many/much | ingi | QTY-019 | | more | lebi | QTY-024 |

**Function/closed words used** (no badge): `mi` I, `yu` you, `te` he/she/it/they,
`i` and, `ma` but, `fi` if, `ti` also/too, `sana` very, `lagia` again, `hi` yes,
`no` no (answer), `badi` some, `inino` now, `leo` today, `keso` tomorrow; question
words `sela` who, `seko` what, `selo` where, `sewa` how, `sefu` why; correlatives
`itula` that-person, `bala` someone, `ola` everyone, `hako` nothing, `hano` never,
`ono` always; demonstratives `ini` this, `itu` that; numerals `ta` one, `nu` two,
`mo` three.

> **Proper names** (`Mila`, `Sato`, `Talo`) are phonotactically legal but are
> **not** lexicon entries and Talo has no proper-noun policy yet — see §8.4.

-----

## 4. Dialogue 1 — two strangers meet

```
Mila:  Haope dinka!
       good.MOD day.N
       'Good day!'

Sato:  Haope dinka! Yu yato sela?
       good.MOD day.N | you COP who
       'Good day! Who are you?'          (content question: 'who' in-situ, no ke)

Mila:  Mi yato Milaka. Yu we namaka yato seko?
       I COP Mila | you GEN name.N COP what
       'I am Mila. What is your name?'   (genitive: possessor + we, before head — 0002 §4)

Sato:  Mi yato Satoka. Mi yato senanpe.
       I COP Sato | I COP happy.MOD
       'I am Sato. I am happy (to meet you).'   (modifier predicate via copula — 0002 §6.3)

Mila:  Yu datanto selo fe?
       you come.V where SRC
       'Where do you come from?'         (postposition fe after the question-word NP)

Sato:  Mi datanto gandepe kotaka fe.
       I come.V big.MOD city.N SRC
       'I come from a big city.'         (attributive modifier 'gandepe' precedes its head)

Mila:  Mi ti!
       I also
       'Me too!'

Mila:  Yu mauto cakulaka ke?
       you want.V food.N Q
       'Do you want some food?'          (yes/no question: clause-final ke — 0002 §6.4)

Sato:  Hi, mi mauto. Mi ti mauto panika.
       yes, I want.V | I also want.V water.N
       'Yes, I do. I also want water.'
```

Everything here is licensed: subject-first throughout; the verb is always found
by `-to`; `seko`/`sela`/`selo` sit in their normal argument slots (in-situ, no
movement); the only yes/no question is the one that ends in `ke`; the copula
links once to a **noun** predicate (`Mi yato Satoka`) and once to a **modifier**
predicate (`Mi yato senanpe`), exactly the two jobs `0002` §6.3 gives it.

-----

## 5. Dialogue 2 — pointing someone out (derivation + aspect in use)

```
A:  Sela yato itula?
    who COP that-person
    'Who is that (person)?'

B:  Itula yato ayalikika. Te ayalito wi belayadeka lo.
    that-person COP teach.AGT.N | he teach.V PROG learn.PLACE.N LOC
    'That is a teacher. He is teaching at the school.'

A:  Yu yato belayakika ke?
    you COP learn.AGT.N Q
    'Are you a student?'

B:  Hi. Mi belayato bahaeka. Ma mi ne tauto nenoka ingi.
    yes | I learn.V language.N | but I NEG know.V word.N many
    'Yes. I am learning the language. But I don't know many words.'

A:  Sana haope! Yu belayato wi, i keso yu tauto lebi.
    very good | you learn.V PROG, and tomorrow you know.V more
    'Very good! You are learning, and tomorrow you'll know more.'
```

This dialogue leans on **additive derivation** (`0002` §3) and the payoff is
visible: from the single root `ayali` "teach" comes `ayalito` (teach, V) and
`ayalikika` (teacher = teach + AGT `-ki` + N); from `belaya` "learn" comes
`belayato` (learn, V), `belayakika` (learner/student = learn + AGT) and
`belayadeka` (school = learn + PLACE `-de` + N — the concept list deliberately
prunes "school" as derivable, `concepts.tsv` MOD-004). The learner who knows the
verb and the two affixes reads "teacher", "student" and "school" for free.
Aspect is carried by post-verbal `wi` (progressive); future time is just the
time-word `keso` "tomorrow" on a bare verb (no tense — `0002` §5.1); clausal
negation is `ne` before the verb (`0002` §6.2).

-----

## 6. Worked sentences by grammar feature

A systematic sweep so every frozen mechanism is exercised at least once.

**Subject-first, fluid verb order (both legal — `0002` §7):**
```
Gouka kanto nekoka.   dog.N see.V cat.N   — 'The dog sees the cat.'   (S V O)
Gouka nekoka kanto.   dog.N cat.N see.V   — 'The dog sees the cat.'   (S O V)
```

**Ditransitive — recipient marked, object bare (`0002` §4):**
```
Mi donato panika yu na.   I give.V water.N you DAT   — 'I give water to you.'
```

**Instrument and locative postpositions:**
```
Te katato cakulaka kisuka wa.   he cut.V food.N knife.N INS   — 'He cuts the food with a knife.'
Gouka makanto baitika lo.       dog.N eat.V house.N LOC        — 'The dog eats in the house.'
```

**Aspect (zero-default, post-verb — `0002` §5.1):**
```
Te makanto.      he eat.V          — 'He eats / ate.' (timeless)
Te makanto wi.   he eat.V PROG     — 'He is eating.'
Te makanto li.   he eat.V PERF     — 'He has eaten.'
```

**Number + clusivity (optional particles — `0002` §5.2–5.3):**
```
Gouka pu makanto.        dog.N PL eat.V              — 'The dogs eat.'
Mi pu sa ikuto baitika su.  I PL INCL go.V house.N GOAL — 'We (you and I) go home.'
```

**Negation, scope by position (`0002` §6.2):**
```
Mi ne tauto.        I NEG know.V        — 'I don't know.'
Ne mi tauto, te.    NEG I know.V, he    — 'Not I know (but) he (does).'
```

**Yes/no vs content questions (`0002` §6.4):**
```
Yu pahato ke?          you understand.V Q      — 'Do you understand?'   (yes/no: ke)
Yu mauto seko?       you want.V what          — 'What do you want?'    (in-situ, no ke)
Te ikuto selo?       he go.V where            — 'Where is he going?'
```

**Conditional and coordination (`fi`, `i`, `ma` — `0002` §6.5; FUN-011/010):**
```
Fi yu datanto, mi yato senanpe.   if you come.V, I COP happy.MOD
                                  — 'If you come, I am happy.'
Mi mauto panika i cakulaka.       I want.V water.N and food.N
                                  — 'I want water and food.'
```

**Possession — verb and genitive (`0002` §4, POS-001):**
```
Mi motuto gouka nu.     I have.V dog.N two   — 'I have two dogs.'   (numeral postposed — see §8.3)
Mi we tomoka.         I GEN friend.N        — 'my friend'
```

**Correlatives grid in use (`0002` §6.7):**
```
Bala datanto.        someone come.V         — 'Someone is coming.'
Mi kanto hako.       I see.V nothing         — 'I see nothing.'
Ola tauto ituko.     everyone know.V that-thing — 'Everyone knows that.'
Te hano makanto niku... → Te hano makanto cakulaka itu.
   he never eat.V food.N that — 'He never eats that food.'
```

-----

## 7. Derivation & compounding, demonstrated

Beyond the agent/place forms in §5, the slice exercises the rest of the `0002`
§3 machinery. All forms are plain CV(n) strings and legal by construction (R1–R6).

**Affix derivations (root → affix → badge):**
```
penukupe    full + OPP -ku + .MOD    — 'empty'      (concepts.tsv prunes 'empty' as derivable)
goucika     dog + DIM -ci + .N       — 'puppy'
gandepaka   big + QUAL -pa + .N      — 'size / bigness'
gandetato   big + CAUS -ta + .V      — 'to enlarge (make big)'
gandepito   big + INCH -pi + .V      — 'to grow (become big)'
```

**Compounding — modifier-root(s) + head-root + one badge (`0002` §3.1):**
```
taiohikalika   sun  + light + .N     — 'sunlight'    (vowel seam, no buffer)
honbaitika     book + house + .N     — 'library'     (book-house; legal n+b cluster, no buffer)
bulanahikalika moon + light + .N     — 'moonlight'   (bulan + hikali: illegal n+h seam →
                                                       deterministic buffer 'a' → bulan-a-hikali)
```

`honbaitika` and `bulanahikalika` together show the whole compounding story: an
`n`-final non-head root joins **directly** when the next onset is a stop
(`hon`+`baiti` → `…n.b…`, legal), and takes the **buffer vowel `a`** only when it
would otherwise form an illegal seam (`bulan`+`hikali` → `n`+`h`, repaired to
`bulan-a-hikali`). This is exactly the single wrinkle `0002` §3.1 flags for the
future morphological linter mode (`0002` §9).

-----

## 8. What the slice revealed — open questions for later phases

The headline result is positive: **two natural dialogues and ~30 sentences ran on
the existing 386 words with essentially no vocabulary gaps** — the gaps that did
appear are *grammatical and phatic*, not lexical. That directly validates the
`0000` §8 claim that a small core can already "hold a real everyday
conversation," and it means Phase 5's lexicon scaling is about reach, not basic
usability. The specific gaps, each a candidate for a future ADR:

### 8.1 No locative / existential predication
The copula `ya` links **noun** and **modifier** predicates only (`0002` §6.3).
There is no sanctioned way to say "I am here" or "there is water" — a bare
`*Mi inilo` has no verb, and `*Mi yato inilo` stretches the copula past its two
defined jobs. The slice worked around it with motion/position verbs
(`Gouka makanto baitika lo`). **To resolve:** decide between (a) extending the
copula to take a locative complement, (b) a dedicated existential/"be-at" verb,
or (c) reusing `motu` "have"/a posture verb. High frequency; should be settled
early in Phase 5.

### 8.2 No phatic layer (greetings, politeness, vocatives)
Talo has no words for *hello/goodbye, please, thank you, sorry, okay*, and no
vocative or address form. Dialogue 1 had to **calque** a greeting as
`Haope dinka` "good day". These are among the highest-frequency utterances in any
language and are currently absent. **To resolve:** mint a small phatic set (likely
a mix of coined and high-transfer borrowings) — a cheap, high-value Phase-5 batch.

### 8.3 Determiner order vs. the "modifier-before-head" rule
Attributive `-pe` modifiers **precede** the head (`gandepe kotaka` "big city",
`0002` §6.3), but the `0002` §6.6 examples place demonstratives and numerals
**after** the head (`kanuka itu` "that dog", `kanuka ta` "a/one dog"), which is
the order this document followed (`gouka nu` "two dogs", `cakulaka itu` "that
food"). That is a real tension with the locked premise "modifier precedes its
head." **To resolve:** confirm (in a short `0002` amendment) that
demonstratives/numerals are a distinct **postposed determiner** class, not
`-pe` modifiers — the examples already assume this, but it is not stated as a
rule.

### 8.4 No proper-noun policy
Names (`Mila`, `Sato`, `Talo`) were used **bare and uninflected**, like function
words. It is undecided whether a name takes `-ka` when it fills an argument slot,
how names interact with the badge-final parser, and how they pass (or are exempt
from) the collision / false-friend gates. **To resolve:** a small `0003`/`0002`
addendum on proper nouns and loaned labels.

### 8.5 Minor ergonomic notes (not blocking)
- **Answering content questions** with a fragment (e.g. just `Panika.` for "Water.")
  is intuitive but unspecified; worth a one-line ruling.
- **Badge verbosity is real** in connected text — every content word carries a
  CV badge — but the accepted trade (`0002` §1) holds up: donors are recognisable
  and parsing stayed unambiguous. No change recommended; cost confirmed, not
  regretted.
- A dedicated **comitative** ("together with a person") and **purpose** ("in order
  to") were not needed here — `wa` (instrument) and juxtaposition sufficed — which
  re-confirms the `0002` §4 decision to defer them to governed extension.

-----

## 9. Interfaces to later phases

- **Phase 5 lexicon scaling (`0000` §8, step 2).** The §8 gaps reprioritise the
  next mint: a **phatic set** and an **existential/locative** decision come before
  breadth. The dialogues confirm the *existing* 386 are enough for daily basics,
  so new concepts should target reach (abstract, civic, technical), not staples.
- **Parser / validator (`0000` §5; `0002` §9).** Every line in §§4–7 is a ready
  **regression fixture**: each is annotated with the rule it exercises, so the
  future parser can be tested against "must-accept" (these) and, by mutation
  (verb-first, badge-stripped, fronted question word), "must-reject" cases.
- **Derivation explorer (`0002` §9).** §7 is a worked test set for the buffer
  rule (`honbaitika` no-buffer vs `bulanahikalika` buffer) and for the affix→badge
  surface forms.
- **Governance (`0000` §6, open decision O-6).** §8.3–8.4 are small, additive
  clarifications that fit the "extensible-by-governance" model and do not reopen
  any frozen decision.

-----

## Appendix — every sentence, plain text (corpus seed)

For copy-paste into a parser test harness. One Talo sentence per line.

```
Haope dinka.
Yu yato sela.
Mi yato Milaka.
Yu we namaka yato seko.
Mi yato Satoka.
Mi yato senanpe.
Yu datanto selo fe.
Mi datanto gandepe kotaka fe.
Mi ti.
Yu mauto cakulaka ke.
Hi, mi mauto.
Mi ti mauto panika.
Sela yato itula.
Itula yato ayalikika.
Te ayalito wi belayadeka lo.
Yu yato belayakika ke.
Mi belayato bahaeka.
Ma mi ne tauto nenoka ingi.
Sana haope.
Yu belayato wi, i keso yu tauto lebi.
Gouka kanto nekoka.
Gouka nekoka kanto.
Mi donato panika yu na.
Te katato cakulaka kisuka wa.
Gouka makanto baitika lo.
Te makanto.
Te makanto wi.
Te makanto li.
Gouka pu makanto.
Mi pu sa ikuto baitika su.
Mi ne tauto.
Ne mi tauto, te.
Yu pahato ke.
Yu mauto seko.
Te ikuto selo.
Fi yu datanto, mi yato senanpe.
Mi mauto panika i cakulaka.
Mi motuto gouka nu.
Mi we tomoka.
Bala datanto.
Mi kanto hako.
Ola tauto ituko.
Te hano makanto cakulaka itu.
```

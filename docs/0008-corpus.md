# Talo — Phase 7 (corpus register): the constructions running text demands

**Status: Accepted.** Resolves the gaps the first translation slice surfaced
(`corpus/GAPS.md`) so Talo can carry connected, journalistic-register text. The
two close calls were **ratified by the maintainer**: §1 keeps the two existing-
machinery strategies and adds **no passive voice**; §2 keeps **direct quotation
by juxtaposition** and does **not** mint an indirect-speech complementiser at this
time. §3 adopts `mungi` for "about". Like `0005`, this ADR is *additive*: it fills
in constructions `0002`/`0005` left unspecified and reverses nothing in
`0000`–`0006`. **No new closed-class morpheme is minted by any decision here.**

**Why now.** Translating three short news items (`corpus/articles/`) showed the
*lexicon* is rarely the blocker — most "missing" words already exist under a
synonym or derive cleanly. The blockers are **register constructions** that
`0002`/`0005` never had to specify because the hello-world slice never needed
them: agentless predication, reported speech, hedged numbers, dates, and manner
adverbs. This ADR fills those in **additively**; it does **not** reopen any
locked decision in `0000`–`0006`.

**Parent:** `docs/0000` (tie-break rules + non-goals), `docs/0002` (the grammar
this extends), `docs/0005` (proper nouns §4, which §6 here completes), and
`corpus/GAPS.md` (the punch-list this answers).

**Tie-break rules referenced** (`0000` §0): 1. transfer beats internal elegance ·
2. graceful degradation over enforcement · 3. predictability beats economy ·
4. transparency beats brevity · 5. derivation is additive.

> **What would be normative if ratified.** §§1–6 add **structure/conventions**
> (no new closed-class morphemes are minted here — that is the point). §7 is a
> **work item**: a small, donor-balanced, twice-gated lexicon batch, done
> separately, not in this doc.

-----

## 0. What this resolves

| # | Gap (from `corpus/GAPS.md`) | Resolved in | New morpheme? |
|---|---|---|---|
| 1 | No agentless / passive predication | §1 | none |
| 2 | No reported-speech frame (quotative) | §2 | none |
| 3 | No approximation ("at least", "about") | §3 | none |
| 4 | No date / weekday / month naming | §4 | none |
| 5 | Manner-adverb status of `-pe` undocumented | §5 | none |
| 6 | No proper-noun transliteration scheme | §6 | none |
| 7 | Vocabulary holes (rescue, roles, kill) | §7 | a gated batch, separately |

-----

## 1. Agentless predication — two existing-machinery strategies, no passive voice

**The need.** News leans on agentless clauses: *"Many houses were destroyed", "five
were arrested"*. Talo is subject-first with a bare object (`0002` §3.5), so there
is no slot for "a patient with no agent".

**Proposed decision.** Cover this with **two constructions Talo already has**,
chosen by whether the meaning is a *state* or an *event* — and do **not** add a
passive voice.

**(a) Resultant state → copula + a `-pe` resultative.** "X is destroyed/broken/
closed" is a *state*, and `0002` already predicates states with the copula `ya`
plus a modifier. A `-pe` modifier built on an action root reads as "in the
state of having been V-ed":

```
baitika ingi yato pecape
house.N many   COP broken.MOD
'Many houses are destroyed (are in a broken state).'
```

This is pure transfer — English *stative* passives are adjectival ("the door is
closed") — and adds nothing (rule 1, rule 5).

**(b) Dynamic event, agent unknown → impersonal subject `bala` "someone".** When
the clause is an *event* and the speaker won't name the agent, fill the subject
with the correlative `bala` (some-person, `0002` §6.7), exactly as French *on* /
German *man* / Spanish *se*:

```
bala nasaito baitika ingi
someone destroy.V house.N  many
'Many houses were destroyed.' (lit. someone destroyed many houses)
```

`bala` is already in the grid the learner has memorised; reusing it beats
teaching a new voice category (rule 3).

**Rationale.** Rules 1 (transfer), 3 (predictability over economy) and 5
(additive): both halves reuse machinery the learner already owns, and the
state/event split mirrors how natural languages actually divide passive labour.

**Rejected — a dedicated passive particle** (e.g. a post-verb marker flagging the
subject as patient). It would let the patient be the grammatical subject of a
*dynamic* clause directly, which (a) and (b) only approximate. **Cost:** a brand-
new closed-class morpheme and a whole voice category to learn, for a gain the two
existing strategies already mostly deliver — a poor trade against rule 3. *Also
rejected: object-fronting/topicalisation*, because it breaks the subject-first
invariant (`0002` §3.5) — a locked decision, high cost.

> **Ratified.** The maintainer confirmed the two-strategy approach and declined a
> true passive voice. Should a future register prove dynamic agentless clauses
> frequent enough to need one, that is a `0002`-level reopening with its own ADR.

-----

## 2. Reported speech — direct quotation by juxtaposition (default)

**The need.** *"The government said help is coming."* The corpus rendered this as
two juxtaposed clauses; it works but the boundary is implicit.

**Proposed decision.** **Direct speech is the canonical form**: a speech-verb
clause, then the quoted clause as an independent clause. No complementiser, no
quote marks required in speech; punctuation (a colon, in writing) is optional and
non-grammatical.

```
seifuka semato li.  tolonaka datanto wi.
government.N say.V COMPLETIVE.   help.N come.V PROGRESSIVE.
'The government said: help is coming.'
```

**Rationale.** Direct-quote-by-juxtaposition is the cross-linguistically commonest
and lowest-barrier option (rule 1), and costs nothing (rule 5). Indirect speech in
Talo needs no tense backshift (the language has no tense, `0002` §5), so the gap
between "said: *help is coming*" and "said *that* help was coming" largely
collapses anyway.

**Indirect-speech complementiser — ratified NOT to add (for now).** A "that"-
clause (to embed the report as an object: *"knows that…", "reported that…"*) would
need one minted closed-class function word. The maintainer declined it at this
time: with no tense backshift, juxtaposition covers the attested needs, and the
complementiser can be revisited in its own ADR if embedding later proves frequent
(e.g. for "asked whether…" questions). **Accepted cost:** complex attributed
sentences are split into two clauses rather than embedded.

-----

## 3. Approximation — compositional, from existing quantifiers

**The need.** *"at least twenty", "about ten", "more than a hundred"* — core to
casualty/figure reporting. The corpus had to drop "at least twenty" to "many"
(`ingi`).

**Proposed decision.** Build approximation **compositionally** from words that
already exist (`o` or, `lebi` more, `sukuna` less), postposed to the numeral-
quantified noun:

| English | Talo idiom | Literal |
|---|---|---|
| at least N | `… N o lebi` | N or more |
| at most N | `… N o sukuna` | N or less |
| more than N | `… N lebi` | N, more |
| fewer than N | `… N sukuna` | N, fewer |

```
hitoka le o lebi matito li
person.N five or more die.V COMPLETIVE
'At least five people died.'
```

**Rationale.** Zero new vocabulary, fully regular, transparent (rules 3, 4, 5);
"N or more" is a recognised paraphrase across many languages (rule 1).

**"about / approximately N" — ratified: reuse `mungi` "maybe".** Place `mungi`
**immediately before the numeral** it hedges (it scopes the figure, so it leads
it — `… mungi N`, not `… N mungi`):

```
hitoka mungi le matito li
person.N maybe five die.V COMPLETIVE
'About five people died.'
```

Zero new vocabulary (rules 1, 5); "maybe five" ≈ "about five" is a recognised
paraphrase. A dedicated approximator was considered and declined (a new word for a
gain `mungi` already delivers).

-----

## 4. Dates — numeric, regular, no borrowed calendar

**The need.** Datelines: *"on Tuesday", "in March", "in 2026"*. Talo has only
`yana`/`leo`/`keso` (yesterday/today/tomorrow), `din` day, `sukia` month, `taun`
year.

**Proposed decision.** Name calendar units **numerically** with the existing
cardinals, as `unit + numeral` (the postposed-determiner order of `0005` §3) — no
borrowed month names:

| Unit | Pattern | Example |
|---|---|---|
| month | `sukia` + cardinal | `sukia mo` = month-3 = March |
| weekday | `din` + cardinal | `din ta` = day-1 = **Sunday** |
| year | `taun` + spelled number | `taun ki-sebu ki-diko-le` etc. |

**The week starts on Sunday** (ratified): `din ta` = Sunday, `din ki` = Monday, …,
`din pikae` = Friday, `din haba` = Saturday. The calendar **epoch** (which year is
counted from) stays **out of scope** — that is *culture*, a `0000` non-goal, and is
not baked into the grammar.

**Rationale.** Regularity over borrowed irregular sets (rule 3); zero new
vocabulary (rule 5); a learner who knows the numerals can already say every date
(rule 1). **Rejected — transliterated Gregorian month names** (`March`→`Maci`,
…): 12 new culture-specific forms with false-friend exposure, for recognisability
that the numeric form's transparency already beats (rules 3, 4).

-----

## 5. Manner adverbs — a `-pe` modifier in the predicate, not a new badge

**The need.** *"go quickly"*. The corpus used a trailing `-pe` word (`hayaipe`),
which the parser accepts, but `0002` describes `-pe` only adnominally.

**Proposed decision.** **`-pe` is the single modifier badge for both adnominal
and adverbial use**; a manner adverb is a `-pe` modifier sitting in the predicate
(after the verb / its objects). Context — what it modifies — distinguishes the
two; no adverb badge is added.

```
hitoka ikuto hayaipe
person.N go.V quick.MOD
'People go quickly.'
```

**Rationale.** Acategorial roots + one modifier badge is exactly the economy
`0002` chose; adding an adverb badge would split a category the learner currently
treats as one (rules 3, 5). This is a **clarifying cross-reference to `0002`
§6.3**, not a new rule. **Rejected — a distinct adverbial badge:** new morphology
for no transfer gain.

-----

## 6. Proper-noun transliteration — a procedure (completes `0005` §4)

`0005` §4 fixed *that* names are nouns taking `-ka`, adapted to phonotactics, but
not *how*. Proposed ordered procedure, so adaptations are reproducible:

1. **Start from pronunciation, not spelling**, where they differ.
2. **Map each sound to the nearest Talo phoneme**, applying the loanword
   substitutions of `0003` §7 (`r→l`, `j→y`, `v→w`, `z→s`, `sh→s`, `th→t`, …).
3. **Make the structure legal** `(C)V(n)`: break consonant clusters with an
   epenthetic vowel (default `i`, or echo the neighbouring vowel); reduce any coda
   that is not `n`, either by dropping it or by adding a vowel.
4. **Stress is initial** (`0001`), regardless of the source language.
5. **Append `-ka`** in a content slot (`Yapanka`); the bare root is the citation
   form recorded in `corpus/proper-nouns.tsv`.
6. **Screen against the obscenity blocklist only** — names are not lexicon
   entries and skip the homophone/false-friend gates (`0005` §4).

| Source | Root | In text | Notes |
|---|---|---|---|
| Japan / Nihon | `yapan` | `Yapanka` | coda `n` legal, no clusters |
| London | `london` | `Londonka` | both codas already legal `n` |
| Paris | `pali` | `Palika` | `r→l`, drop final `s` |
| France | `falan` | `Falanka` | `r→l`, cluster `fr`→`f`, `nce`→`n` |
| BBC | `bibisi` | `Bibisika` | letter-name spell-out, vowels inserted |

**Rationale.** A fixed procedure makes the corpus reproducible and teachable
(rules 3, 4) and reuses the loanword rules the learner already meets in the
lexicon (rule 1). Edge cases (un-adaptable segments, very long names) resolve by
the same steps; genuinely contested adaptations get logged in `proper-nouns.tsv`.

-----

## 7. Lexicon follow-ups (a separate gated batch — NOT minted here)

The translation found a few genuine vocabulary holes. These are minted **outside
this ADR**, in a normal donor-balanced batch that passes **both gates** (linter
R1–R6 + collision checker), exactly like `0006`:

- **`kill` — do not mint a root.** Derive it as the **causative of `mati` "die"**:
  `mati`+`-ta` → **`matita`** "kill" (`0002` §3.2 causative). Document this as the
  canonical form; it is additive (rule 5), not new vocabulary.
- **`rescue` / `save`** — likely a real new root; `tolona` "help" is too weak for
  disaster contexts.
- **Political-role titles** — `muku` "chief/headman" covers informal "leader"
  only. `president`/`minister`/`official` need forms; recognisable
  internationalisms are candidates (`presiden`→ a legal adaptation, `menteri`
  (Indonesian/Malay, already CV-friendly) for "minister"), subject to the gates.
- **`spokesperson`** — decide between a derivation on `sema` "say" and folding it
  into `seifu semato` "the government said".

Until that batch lands, the corpus paraphrases around these (and `corpus/GAPS.md`
tracks them); the `corpus-check` gate already forbids using any form that isn't a
real lexicon entry, so no placeholder can sneak in.

-----

## 8. Cost summary (what ratifying §§1–6 commits us to)

| Decision | Cost knowingly accepted |
|---|---|
| §1 agentless = resultative `-pe` + impersonal `bala` | dynamic agentless clauses are slightly periphrastic vs. a true passive |
| §2 reported speech = juxtaposition | embedded "that"-clauses must be split until/unless a complementiser is minted |
| §3 approximation = `o lebi` / `o sukuna`; "about" = `mungi` | a true comparative/approximator grade is paraphrastic, not morphological |
| §4 dates = numeric | no one-word month/day names; datelines are two-token phrases |
| §5 manner = predicate `-pe` | a `-pe` word's adnominal vs. adverbial reading is context-resolved, not marked |
| §6 transliteration procedure | some names have more than one defensible adaptation; the registry arbitrates |

No locked decision in `0000`–`0006` is reversed. Every Talo example in this ADR
validates through `tools/parser` (and is exercised by the `corpus-check` gate
where it appears in `corpus/`).

# Talo — Phase 0: Design Principles & Decision Log

**Status:** Living document. This is the project’s constitution. Every later
decision references it. Reversals must be recorded here, not made silently.

**Format:** ADR-style. Each decision states the choice, the rationale, the
alternative rejected, and (where relevant) the cost knowingly accepted.

-----

## 0. Purpose & optimisation target

Talo is a constructed auxiliary language. It is **not** optimised for
theoretical elegance, expressive ceiling, or cultural neutrality for its own
sake. It is optimised for **adoption via positive transfer and low barrier to
entry**.

Two related personas define “success”:

- **Primary persona — the first-ever second-language learner.** A monolingual
  adult learning Talo as the first additional language they have ever attempted.
  Crucially, this person has **no metalinguistic experience**: they have never
  consciously analysed grammar, never mapped one language’s categories onto
  another’s. Their native language is invisible to them — it is simply “how
  talking works.”
- **Secondary persona — the large-population transferer.** A speaker of one of
  the highest-L1-count languages, for whom Talo should feel familiar wherever
  possible so existing native structure transfers for free.

These personas overlap heavily. Where they diverge, the **primary persona wins.**

### Decision-making tie-break rules (the constitution proper)

1. **Transfer beats internal elegance.** When a feature that aids transfer for
   the large blocs conflicts with theoretical regularity or neutrality,
   transfer wins.
1. **When familiarity is impossible, choose graceful degradation over
   enforcement.** Some features (lexical tone, grammatical case) cannot be made
   familiar to a majority. Do not force them; design so that a learner’s
   imperfect or L1-flavoured output is still intelligible.
1. **For the primary persona, predictability beats economy.** Spend production
   effort (more to say) to buy zero-judgement, exception-free rules. A novice
   cannot yet handle “rule plus exceptions” or context-sensitive judgement
   calls; they can handle “always the same.”
1. **Transparency beats brevity.** Explicit signals beat zero-marking / marking-
   by-absence, even when the latter is shorter and unambiguous.
1. **Derivation is additive.** Changing a word’s category or meaning is done by
   *adding* a piece, never by *subtracting* one.

### Non-goals (explicitly out of scope)

- Cultural/lexical neutrality as a primary aim (acknowledged as mathematically
  unreachable — see §4).
- Maximal expressive or literary ceiling.
- Solving adoption by language design alone (see §7 — adoption is mostly a
  network/content problem).

-----

## 1. The lexical-familiarity ceiling (a foundational acknowledgement)

No lexicon makes a majority of humanity feel at home. The largest single L1
(Mandarin) is ~12–14% of the world. Familiarity at the *root* level is
zero-sum across language families.

**Consequence for design:** optimise the **grammar** for learnability (this
helps everyone roughly equally) and accept that the **lexicon** will favour
whoever’s L1 is closest. Minimise that unfairness via (a) internationalisms —
roots already diffused across many languages — and (b) transparent, productive
derivation so the *system* is learnable even when individual roots are not
*recognisable*. This is the best available approach, not a true solution.

-----

## 2. Phonology & orthography (DECIDED — high cost to change)

- **No lexical tone.** Tone is familiar to ~1.5B people and impossible-to-hard
  for the rest. Rejected outright. (Tie-break rule 2.)
- **No-hard-fails phoneme inventory.** Target the set of sounds that are either
  already present in, or trivially approximable by, the largest number of
  speakers. Explicitly avoid known high-failure contrasts (e.g. /r/–/l/, dental
  fricatives, front rounded vowels). The goal is **intelligibility under
  variation, not phoneme-level familiarity** — the latter is unreachable.
- **Generous allophonic tolerance.** Accented production must always remain
  intelligible. Specify tolerance ranges, not point targets. (Tie-break rule 2.)
- **CV-heavy phonotactics.** Simple syllable structure, minimal/no consonant
  clusters.
- **No phonemic stress or length.** Stress is fixed/predictable, never
  contrastive.
- **One-to-one grapheme↔phoneme orthography.** Fully transparent. A novice is
  never punished for “spelled differently from how it sounds.”
- **Latin script, ASCII-typeable, no diacritics.** Chosen for keyboard / font /
  OCR / learning-material ubiquity, **not** because it is neutral. Diacritics
  are an adoption tax (cf. Esperanto’s circumflexes).

> **DONE (Phase 1):** the exact phoneme inventory, phonotactic grammar, grapheme
> set, fixed-stress rule, and allophonic tolerance contract are specified in
> `docs/0001-phonology.md`. The phonotactic linter
> (`tools/phonotactic-linter/`) implements that spec and is the validator for
> every lexicon entry (Phase 3).

-----

## 3. Morphology & grammar core (DECIDED in principle)

### 3.1 No gender, no case (default), no agreement, no irregular verbs

Grammatical gender, mandatory case inflection, and agreement are all major L2
stumbling blocks and are absent from several of the largest L1s
(Mandarin, English-ish, Indonesian, Bengali). Including them would alienate more
people than they help, and would introduce the “same word changes shape for
reasons” shock that hits first-time learners hardest. **Rejected.**

Verbs are strictly regular. No irregular/suppletive forms. (Tie-break rules 1, 3.)

### 3.2 Tense / aspect / number etc. via OPTIONAL particles

Carried by optional particles, not mandatory inflection. Many large languages
(Mandarin, Indonesian) do not mandate tense marking. Default is the unmarked
(zero) form.

> **Pedagogy note (not a grammar change):** for the primary persona, optionality
> can read as “I don’t know when I’m required to use this.” Learning materials
> must teach the **default-zero case first**, then introduce particles as
> additions. (Phase 5.)

### 3.3 Part-of-speech marking — MANDATORY and EXPLICIT on ALL content words

Every content word carries an explicit POS marker, **including nouns.**

- **Why mark at all:** an unambiguous POS suffix lets the parser locate the verb
  by morphology rather than position. This is what makes fluid verb placement
  (§3.5) safe, and removes the main source of cross-linguistic word-order
  interference.
- **Why mandatory (not omittable-when-unambiguous):** an omittable scheme
  requires the speaker to model the listener’s parse and judge “is this
  ambiguous enough to need the marker?” — exactly the metalinguistic judgement
  the primary persona cannot yet make. Mandatory marking requires *zero
  judgement*: always mark, done. The verbosity cost is accepted in exchange for
  predictability. (Tie-break rule 3.)
- **Why nouns are marked too, despite being recoverable by elimination:** leaving
  nouns as the unmarked default would be shorter, but it forces the learner to
  identify a category *by the absence of a signal* — more abstract and harder for
  a novice than an explicit badge. Explicit noun marking also (a) provides
  redundancy / error-tolerance under fluid verb placement (a dropped or
  mis-applied verb marker still has a backstop), and (b) keeps derivation purely
  **additive** — “make it a noun” = *add* the noun marker, never *strip* another
  suffix. (Tie-break rules 3, 4, 5.)

> **Cost accepted, recorded explicitly:** noun-ness is technically recoverable by
> elimination, so the noun marker is redundant. We mark it anyway, deliberately,
> for transparency, error-tolerance, and additive derivation.

> **Flagged for pedagogy:** mandatory POS-marking is the single most *foreign*
> concept the primary persona will meet, because isolating-L1 speakers (Mandarin,
> Vietnamese — large first-L2 populations) do not natively treat words as having
> a fixed lexical category. It is still kept (the parsing/transfer payoff is
> large) but must be sequenced very gently in learning materials. (Phase 5.)

### 3.4 Transparent, generative, additive derivation

Learning N roots must yield far more than N words via regular compounding and
affixation. This is the **highest-leverage feature** for perceived vocabulary
size and for sustaining novice motivation (early effort visibly pays off). All
derivation is additive (rule 5).

> **DONE (Phase 2):** the derivation/affix system — acategorial roots (one root →
> three badged words), the morphotactic template, the ten-affix productive core,
> and the compounding rule — is specified in `docs/0002-morphology-grammar.md` §§2–3.

### 3.5 Syntax — the one invariant: SUBJECT-FIRST; verb placement fluid

- **Subject-first is enforced.** S-before-O is a near-universal across the
  world’s languages, so enforcing it encodes something almost everyone already
  does and is not “picking a side.” With S guaranteed first and two arguments,
  position disambiguates subject vs object **without case marking** — which is
  why §3.1 can drop case for the common transitive clause. (This is the key move
  that serves the caseless majority.)
- **Verb placement is fluid (truly free after S), not restricted to canonical
  slots.** This neutralises the single largest word-order disagreement
  (SVO vs SOV) by letting SVO-natives say S-V-O and SOV-natives say S-O-V, both
  legal, both intelligible (verb is always findable via its POS marker, §3.3).
  - *Rationale for “truly free” over “two canonical slots only”:* the order
    *cannot* be enforced in practice and a single speaker may well shift it
    depending on the background of the person they are talking to. Enforcing
    canonical slots would be unenforceable and would add a rule the novice must
    police. Free placement adds no illegal-construction anxiety.
  - *Cost accepted:* fluidity spends word order as a redundancy signal; the
    listener leans on the S-first rule + POS marking with no positional backup.
    Minor for two-argument clauses; matters mainly for ditransitives/embedded
    clauses, which need role markers anyway (§3.6).

> **Pedagogy note (not a grammar change):** although verb placement is free, the
> primary persona benefits from *one* fixed model to imitate first. Learning
> materials should teach a single canonical order (the learner’s L1-matching one)
> and **reveal the fluidity later**. This also resolves the deferred
> “per-speaker consistency” question pedagogically: default to one, unlock the
> other. (Phase 5.)

### 3.6 Argument roles beyond the simple transitive

Bare S-first position handles subject/object in the common two-argument
transitive. Ditransitives, obliques, and embedded clauses require **explicit
role markers (adpositions/particles)** — position alone cannot carry them once
the verb floats. This is true of fixed-order designs too, so it is not a new
cost.

> **DONE (Phase 2):** the role-marker inventory — a minimal core of six free
> **postpositions** (dative, locative, goal, source, instrument, genitive) — is
> specified in `docs/0002-morphology-grammar.md` §4.

-----

## 4. Lexicon strategy (DECIDED in principle; built in Phase 3)

- Source from a **frequency-weighted concept list** (meanings, not words first):
  Swadesh-plus, augmented with high-frequency relational/function concepts and
  modern necessities (numbers, time, tech). Target ~1,000–1,500 root concepts;
  derivation (§3.4) covers the long tail.
- For each concept, prefer an **already-globally-diffused internationalism**
  where one exists (e.g. taxi, coffee/kafe, telephone), adapted to Talo
  phonotactics. This feels familiar to far more people than any single source
  language’s native roots, because the form has already diffused.
- Where no internationalism exists, **coin** from Talo roots.
- Every candidate passes the **phonotactic linter** (§2) and a **collision
  checker** (no near-homophones; no accidental obscenities across major
  languages — a real and frequently-skipped step).
- The lexicon is a **versioned dataset**, not prose: `concept → chosen form → rationale → source`. Diffable, reviewable.

Scope discipline: the lexicon is effectively unbounded. Scope it by **frequency
cutoff, not completeness.**

-----

## 5. Tooling (Phase 5 — the modern advantage Zamenhof lacked)

- Phonotactic linter (from §2) — validates every lexicon entry.
- Lexicon database (§4) — the source of truth; dictionary and learning materials
  are *generated* from it.
- Sentence parser/validator — checks well-formedness; doubles as a teaching aid
  and as the regression-test harness for grammar changes.
- Derivation explorer.
- Spaced-repetition materials generated from the lexicon dataset.
- (Stretch) an MT bridge to seed content — see §7.

Learning materials are built with the **primary persona as the explicit default
user**, honouring the pedagogy notes in §3.2, §3.3, §3.5.

-----

## 6. Governance (decide before community scales)

Every conlang lives or dies on community, and fragmentation kills. Decide up
front **what is frozen vs open**: which core is immutable (cf. Esperanto’s
*Fundamento*, whose deliberate freeze prevented fragmentation while allowing
peripheral growth), who may extend the lexicon, and how changes are ratified.

> **PROPOSED (`docs/0011`):** the governance model and freeze boundary are drafted
> in `docs/0011-governance-freeze-boundary.md` — a three-tier freeze (F frozen
> core / S governed-extension / O open lexicon+corpus), the **additive invariant**
> (Talo only ever *adds*; nothing already learned becomes wrong), an interim
> maintainer with a defined Academy-succession trigger, and a 1.0 freeze with a
> pre-freeze checklist. Resolves on maintainer ratification.

-----

## 7. The real adoption determinant (kept in view, not solvable by design)

Every universal language has failed on **adoption, not design**. Esperanto is a
fine design. Without an institutional/economic/platform carrier, linguistic
merit is nearly irrelevant — the de facto universal language (English) was chosen
by power and network effects, not fairness or learnability.

The leverage we *do* have: a critical mass of **content and interlocutors**.
A language is worth learning only if there is something to read/watch and someone
to talk to. Seed the ecosystem (translatable/generated content, a platform where
speakers concentrate, a visible network) early. Design-for-learnability buys
nothing if the learner hits a “now what?” wall.

**Budget accordingly:** a beautiful spec with no corpus and no governance is the
default failure mode for the ~900 conlangs that didn’t make it.

-----

## 8. Build sequencing

**Freeze bottom-up, test top-down.**

- Freeze order (protects against expensive rework): phonology → morphology →
  core lexicon.
- Test order (protects against building something consistent but unusable): start
  *using* Talo for real as early as Phase 4 (a “hello world” vertical slice —
  enough phonology + grammar + ~300 words to hold a real everyday conversation),
  before scaling vocabulary.

Phases 1–2 are small and finite: do them properly and freeze them. Phase 3 is
unbounded: scope by frequency cutoff. Phases 6–7 are the actual hard problem and
the least under our control.

-----

## 9. Open decisions (logged, not yet made)

|#  |Decision                                           |Notes                                                                           |
|---|---------------------------------------------------|--------------------------------------------------------------------------------|
|O-1|Exact phoneme inventory & phonotactic grammar      |✅ **Resolved** in `docs/0001-phonology.md`. Drives the linter.                  |
|O-2|The specific POS suffix forms (noun/verb/adj/adv/…)|✅ **Resolved** in `docs/0002-morphology-grammar.md` §1: three classes — noun `-ka`, verb `-to`, modifier `-pe`.|
|O-3|Derivation/affix system                            |✅ **Resolved** in `docs/0002-morphology-grammar.md` §§2–3: acategorial roots, ten-affix core, compounding.|
|O-4|Role-marker inventory (ditransitives, obliques)    |✅ **Resolved** in `docs/0002-morphology-grammar.md` §4: six free postpositions.|
|O-5|Tense/aspect/number particle set & defaults        |✅ **Resolved** in `docs/0002-morphology-grammar.md` §5: no tense; aspect `li`/`wi` + time-words; plural `pu`; clusivity `sa`/`fo`.|
|O-6|Governance model & freeze boundary                 |📝 **Proposed** in `docs/0011-governance-freeze-boundary.md` (three-tier freeze + additive invariant + 1.0 trigger); §6. Resolves on maintainer ratification.|
|O-7|Per-speaker verb-order consistency norm            |Resolved *pedagogically* (§3.5): teach one, unlock fluidity. Not a grammar rule.|

-----

## Appendix A — Decisions settled in design dialogue (chronological)

1. Optimisation target = adoption-by-transfer (interpretation “B”), later refined
   to centre the **first-ever-second-language** primary persona.
1. No tone; no-hard-fails phonology; intelligibility-under-variation over
   phoneme familiarity.
1. Latin, ASCII, no diacritics, one-to-one orthography.
1. No gender, no case (default), no agreement, no irregular verbs.
1. Tense/aspect via optional particles.
1. **Subject-first enforced; verb placement truly fluid** (neutralises SVO/SOV).
1. **POS-marking mandatory and explicit on all content words, including nouns**
   (predictability & transparency & additive derivation over economy).
1. Additive, generative derivation as the core vocabulary multiplier.
1. Lexicon = frequency-weighted concepts + internationalisms + coinage, as a
   versioned dataset gated by a phonotactic linter and collision checker.
1. Name: **Talo** — a deliberately neutral coinage (no source-language
   favouritism), fully phonotactic in its own system. Chosen over recognisable
   options (e.g. *Lina*) to honour the fairness principle at the one point in
   the lexicon where neutrality is cheap.
1. **Phase 1 (phonology/orthography) frozen** in `docs/0001-phonology.md`:
   5 vowels, 15 consonants, 20-letter ASCII alphabet, coda `n` only, single
   cluster `n`+stop/affricate, fixed initial stress, allophonic-tolerance
   contract; the phonotactic linter implements R1–R6.
1. **Phase 2 (morphology/grammar core) frozen** in
   `docs/0002-morphology-grammar.md`, resolving O-2…O-5:
   - Three content classes with mandatory badges: noun `-ka`, verb `-to`,
     modifier `-pe` (stop onsets, place-distinct, so never a voicing-only clash).
   - **Acategorial roots:** category is the badge; one root yields N/V/modifier
     by badge-swap (additive, rule 5). Word template `ROOT (+DERIV)* +BADGE`.
   - **Reserved-onset rule:** bound suffixes are CV with stop/affricate onsets so
     they attach legally even after `n`-final roots; free particles unrestricted.
   - **Derivation:** ten-affix productive core (agent/instrument/patient/place/
     quality/diminutive/augmentative/opposite/causative/inchoative) + compounding
     (modifier-root(s) + head-root + one badge, buffer `a` at illegal seams).
   - **Role markers:** six free postpositions (`na lo su fe wa we`); plain
     transitive object stays bare (subject-first carries S/O).
   - **TAM/number (optional, zero default):** no tense; post-verb aspect
     `li`(completive)/`wi`(progressive) + time-words; post-noun plural `pu`;
     optional clusivity `sa`(incl)/`fo`(excl).
   - **Function words (no badge):** pronouns `mi/yu/te` (genderless 3rd, no
     formality); negator `ne` before its target; explicit copula `ya→yato`;
     yes/no `ke` clause-final with content questions **in-situ**; conjunction `i`.

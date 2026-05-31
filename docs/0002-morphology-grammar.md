# Talo — Phase 2: Morphology & Grammar Core

**Status:** Decided. Resolves open decisions **O-2** (POS suffix forms), **O-3**
(derivation/affix system), **O-4** (role-marker inventory) and **O-5**
(tense/aspect/number particle set) from §9 of `0000`. High cost to change — this
freezes the morphology, the layer `0000` §8 says to freeze second (after
phonology, before lexicon). Reversals are recorded here and in `0000`, not made
silently.

**Parent:** `docs/0000-design-principles.md` §3 (the morphology/grammar locks)
and `docs/0001-phonology.md` (the phonotactics every morpheme must satisfy).
This ADR *fills in* the four `TODO`/placeholder items §3 left open.

**Format:** ADR-style, as in `0000`/`0001`. Each choice states the decision, the
rationale, the alternative rejected, and the cost knowingly accepted, and cites
the §0 tie-break rules:

> 1. Transfer beats internal elegance. 2. When familiarity is impossible, choose
> graceful degradation over enforcement. 3. For the primary persona,
> predictability beats economy. 4. Transparency beats brevity. 5. Derivation is
> additive.

> **System vs. instantiation — read this first.** Two things live in this
> document and they have different authority:
> - **The system** — the architecture fixed in the design dialogue (number and
>   nature of the classes, additivity, ordering, the postpositional/in-situ
>   choices, the optional-with-zero-default model). This is **locked** and not
>   reopened below.
> - **The concrete forms** — the *specific syllables* assigned to each badge,
>   affix, particle and function word. These are the cheapest thing in the
>   project to revise (nothing downstream is minted yet — the lexicon is Phase
>   3), so they are presented as the **proposed instantiation**: ratifiable in
>   review, constrained only by the rules below. Where a form is illustrative
>   *lexicon* (a root, a time-word, a question word) it is marked as such; only
>   the **closed-class grammatical morphemes** and the **structure** are
>   normative here.

-----

## 0. What this resolves, and the constraints it inherits

`0000` §3 already **decided** (and this ADR does not reopen):

- exactly **three** content part-of-speech classes — noun, verb, modifier
  (modifier merges the adjective+adverb roles);
- POS marking is **mandatory and explicit on every content word, including
  nouns** (§3.3);
- TAM / number ride on **optional particles, default zero** (§3.2);
- derivation is **transparent, generative, additive** (§3.4, rule 5);
- **subject-first is enforced; verb placement is fluid** (§3.5);
- obliques/ditransitives/embedded clauses take **explicit role markers** (§3.6);
- no gender, no mandatory case, no agreement, no irregular forms (§3.1).

`0001` fixes the phonotactics every morpheme must pass (R1–R6, the 20-letter
alphabet, coda = `n` only, the single legal cluster `n`+stop/affricate). Every
form coined below is legal Talo and passes the linter.

Four architectural choices were settled in the Phase-2 design dialogue and are
treated as locked premises here:

| Locked premise | Source |
|---|---|
| Three classes: **noun, verb, modifier** | dialogue R1 |
| Bound suffixes are **CV with a reserved stop/affricate onset**; free particles are unrestricted | dialogue R1 |
| **Modifier precedes its head** | dialogue R1 |
| **Postpositions** (head-final adposition harmony) | dialogue R1 |
| Roots are **acategorial** (category assigned by the badge) | dialogue R2 |
| Time via **aspect particles + time-words** (no tense) | dialogue R2 |
| Number via an **optional plural particle** (default number-neutral) | dialogue R2 |
| Role markers: a **minimal core (~6) of free postpositions** | dialogue R2 |
| Negation: a **negator word before the element it negates** | dialogue R3 |
| Predication: an **explicit copula verb** | dialogue R3 |
| Pronouns: **minimal & neutral**; clusivity via an **optional particle** | dialogue R3/R3b |
| Questions: **clause-final yes/no particle + in-situ question words** | dialogue R3 |

-----

## 1. The three part-of-speech badges (resolves O-2)

**Decision.** Every content word ends in exactly one POS badge:

| Class | Badge | Onset | Example (root `tumi` "run") |
|---|---|---|---|
| **Noun** | `-ka` | k | `tumika` "a run / running" |
| **Verb** | `-to` | t | `tumito` "run (V)" |
| **Modifier** | `-pe` | p | `tumipe` "running / fast (adj/adv)" |

**Rationale.**
- **Stop onsets `k t p`.** §1's morphotactics (§2 below) require every *bound*
  suffix to begin with a stop or the affricate, so it can attach legally even to
  the rare `n`-final root. `k`, `t`, `p` are three **voiceless stops that differ
  by place, not voicing**, so they never trip the weak-contrast rule
  (`0001` §2.1: no two grammatical markers may differ by voicing alone).
- **Distinct vowels `a o e`** add a second redundancy dimension: a badge that is
  mis-heard on its consonant is still separated on its vowel. Under fluid verb
  placement (§3.5) the badge is the *only* cue to category, so maximal
  separation is bought deliberately (rule 4).
- The badge is **always word-final / outermost** (§2), so the parser locates the
  verb — and every word's category — by reading the last syllable, which is what
  makes fluid verb order safe (`0000` §3.3, §3.5).

**Alternatives rejected.**
- *Zero noun badge (mark only V and modifier).* Shorter, but identifies a noun by
  **absence of a signal** — rejected by `0000` §3.3 (rules 3, 4) and it would
  break pure additivity (you'd "become a noun" by *stripping* a suffix).
- *Voiced onsets for some badges (`-ga`/`-do`/`-be`).* Would put a core,
  ultra-high-frequency contrast onto the weakest distinction in the phonology
  (`0001` §2.1). Avoided.
- *Same vowel across badges (`-ka -ta -pa`).* Throws away the vowel redundancy
  dimension for no gain.

> **Cost accepted, recorded explicitly:** three obligatory suffixes make Talo
> visibly *longer* than an isolating language with bare roots. This is the
> verbosity cost `0000` §3.3 already accepted in exchange for zero-judgement
> parsing and additive derivation. (Rule 3.)

-----

## 2. Acategorial roots & morphotactics

### 2.1 Roots carry no category; the badge assigns it
A root is a bare meaning with **no inherent part of speech**. Category is whatever
badge you attach. One root therefore yields (at least) three words for free —
the first and largest layer of additive derivation (`0000` §3.4):

```
tumi  (run, bare meaning, never spoken alone)
  → tumito   run            (V)
  → tumika   a run / running (N)
  → tumipe   running / fast  (modifier)
```

This makes the constitutional slogan literally true: **changing category = adding
a different badge** (rule 5), never converting or stripping anything.

> **Cost accepted, recorded explicitly:** some root+badge pairings are
> semantically thin ("what exactly is the *noun* of *run*?"). Talo resolves this
> by **convention, recorded in the lexicon** (Phase 3): each root lists its
> attested badge-meanings; novel pairings are interpretable but may be
> non-idiomatic. Acategoriality buys maximal regularity at the price of needing
> the lexicon to pin the conventional gloss of each pairing. (Rule 3 — we accept
> a lexical lookup to keep the morphology exceptionless.)

### 2.2 Word template (the morphotactic order)
A content word is built strictly left-to-right, badge always last:

```
content-word = ROOT (+ DERIV-AFFIX)* + BADGE
```

Derivational affixes (§3.2) sit **between** the root and the badge, applying
inside-out (the affix nearest the root applies first). Because the badge is
always the final morpheme, category is always readable at the word's end
regardless of how much derivation precedes it.

### 2.3 The reserved-onset rule (why bound suffixes start with a stop/affricate)
**Decision.** Every *bound* morpheme (badge or derivational affix) is **CV** and
**begins with a stop or the affricate** (`p t k b d g c`). Free morphemes
(particles, role markers, pronouns) have **no onset restriction** — they are
separate words and create no morpheme-internal juncture.

**Rationale.** `0001` permits exactly one consonant cluster: `n` + stop/affricate
(R4), and `n` is the only legal coda (R5). A root may end in `n`. If a bound
suffix could begin with any consonant, `tan` + `-ma` would yield `*tanma`, an
illegal `n`+nasal cluster. Restricting bound-suffix onsets to stops/affricates
guarantees **every** badge and affix attaches legally to **every** root,
including `n`-final ones, with zero exceptions and zero juncture repair:

```
tan + -ka → tanka   (tan.ka — legal n+k)      ✓
tan + -to → tanto   (tan.to — legal n+t)      ✓
tumi + -pe → tumipe (vowel-final root, trivially legal) ✓
```

This is the morphological reason the badges (§1) and affixes (§3.2) all use
`p t k b d g c` onsets. (Rule 3: an exceptionless attachment rule beats a
shorter inventory that needs juncture patching.)

-----

## 3. Derivation (resolves O-3) — the highest-leverage feature

Two mechanisms multiply the lexicon (`0000` §3.4): **compounding** (combine
roots) and **derivational affixes** (modify one root). Both are strictly additive
(rule 5) and feed the badge system above.

### 3.1 Compounding — modifier-root(s) + head-root, one badge
**Decision.** A compound joins two or more roots into a single word; the
**non-head (modifying) roots come first, the head root last**, and **one badge**
on the whole compound categorises the result. This is the word-internal echo of
the syntactic *modifier-before-head* rule.

```
wato (water) + kasa (house) + -ka  → watokasaka   "bathroom" (a water-house, N)
piko (small) + libo (book)  + -ka  → pikoliboka   "booklet"  (a small-book, N)
```

**Juncture.** A compound is legal iff its concatenation passes the linter. The
only join that can fail is an `n`-final non-head root before a non-stop onset
(e.g. `tan`+`homi` → `*tanhomi`, illegal `n`+`h`). In that single case a **buffer
vowel `a`** is inserted at the seam (`tan‑a‑homi` → `tanahomi`), restoring
legality deterministically. Vowel-final roots — the overwhelming majority —
never trigger it.

> **Cost accepted, recorded explicitly:** the buffer rule is a (rare,
> fully-determined) wrinkle, and computing "does this seam need a buffer?" is
> exactly the kind of micro-judgement rule 3 dislikes. We keep it small by
> pushing it onto **tooling**: the derivation explorer / linter computes the
> surface form, so the learner reads the correct compound rather than deriving
> it. (`0000` §5.)

### 3.2 Derivational affix inventory (proposed core)
**Decision.** A productive, generative core of derivational suffixes. Each is a
bound CV with a stop/affricate onset (§2.3), applies to an acategorial root, and
is then categorised by a badge. The set is **extensible by governance** (`0000`
§6) — this is the launch core, not a closed list.

| Affix | Meaning | Example (→ then badged) |
|---|---|---|
| `-ki` | **agent** — one who does X | `edu`(teach)`+ki+ka` → `edukika` "teacher" |
| `-tu` | **instrument** — thing used to do X | `seka`(cut)`+tu+ka` → `sekatuka` "a cutter/blade" |
| `-bo` | **patient / result** — thing X-ed, product of X | `edu+bo+ka` → `eduboka` "lesson / what is taught" |
| `-de` | **place** — place of/for X | `edu+de+ka` → `edudeka` "school" |
| `-pa` | **abstract / quality** — the quality or state of X | `bola`(big)`+pa+ka` → `bolapaka` "size/bigness" |
| `-ci` | **diminutive** — small/endearing X | `kanu`(dog)`+ci+ka` → `kanucika` "puppy" |
| `-go` | **augmentative** — big/intense X | `kanu+go+ka` → `kanugoka` "big hound" |
| `-ku` | **opposite** — the reverse/antonym of X | `bone`(good)`+ku+pe` → `bonekupe` "bad" |
| `-ta` | **causative** — make/cause to X | `bola+ta+to` → `bolatato` "to enlarge (make big)" |
| `-pi` | **inchoative** — become X | `bola+pi+to` → `bolapito` "to grow (become big)" |

**Rationale.** These ten cover the highest-frequency derivational relations
across the world's languages (agent/instrument/result/place nominalisation;
quality abstraction; size; antonymy; causative/inchoative valency). Two are
especially high-leverage for the personas:
- **`-ku` (opposite)** makes antonyms *additive* — you reach `bad` by *adding* to
  `good`, never by learning an unrelated root (rule 5; doubles modifier
  vocabulary). It is **lexical** negation (a different word), distinct from the
  **clausal** negator `ne` (§6.2).
- **`-ta`/`-pi` (causative/inchoative)** turn every property and many
  intransitives into transitive/change-of-state verbs without new roots.

**Form hygiene.** No two affixes (or affix vs badge) differ by voicing alone, per
`0001` §2.1: the `t`-series is `-to -tu -ta`, the lone `d` is `-de` (no `*te`);
the `k`-series is `-ka -ki -ku`, the lone `g` is `-go` (no `*ko`); the `p`-series
is `-pe -pa -pi`, the lone `b` is `-bo` (no `*po`); `c` has no voiced counterpart.
Within each onset the vowels are distinct.

**Alternative rejected.** *Conversion by bare badge-swap only* (no affixes). Badge-
swap alone gives category change but not the *meaning* relations above (agent,
place, causative…); without affixes the lexicon could not multiply as §3.4
demands. *Prefixes instead of suffixes* were rejected to keep Talo uniformly
suffixing (preserves the root-initial stress anchor, `0001` §6, and a single
attachment edge).

> **Cost accepted:** ten affixes plus three badges is a real up-front load. It is
> sequenced gently for the primary persona (the badge layer first, affixes later
> — Phase 5), and every affix is exceptionless, so the cost is *memorisation, not
> judgement*. (Rule 3.)

-----

## 4. Role markers (resolves O-4) — six free postpositions

**Decision.** A minimal core of **six free postpositional words**. Each follows
its noun phrase. The plain transitive object stays **bare** (subject-first §3.5
carries the S/O contrast). These are **words, not suffixes** — keeping clear of
the case inflection `0000` §3.1 rejected.

| Marker | Role | Gloss |
|---|---|---|
| `na` | dative / recipient | to (someone) |
| `lo` | locative | at / in |
| `su` | goal / direction | toward |
| `fe` | source | from |
| `wa` | instrument | with / using |
| `we` | genitive / possession | of |

```
Ditransitive:  homika donato watoka kanuka na   "the person gives the dog water"
               (person give water  dog-DAT;  water = bare object, dog = recipient)
Locative:      kanuka tumito kasaka lo          "the dog runs in the house"
Instrument:    homika sekato liboka kutoka wa   "the person cuts the book with a knife"
Genitive:      homika we kanuka                 "the person's dog"  (possessor + we, before head)
```

**Rationale.** Six covers the overwhelming majority of clauses at the smallest
up-front cost for the primary persona. Because role markers are *free words*, the
inventory is **extensible later** (governance, §6) with no structural change —
so the richer distinctions are *deferred, not foreclosed*. Overloaded roles
degrade gracefully and stay intelligible: comitative ("with a person") reuses
instrument `wa`; benefactive ("for") reuses dative `na`.

**Alternatives rejected.**
- *Richer set (~10–12, adding comitative/benefactive/purpose/manner…).* More
  precision out of the box, but front-loads distinctions several large L1s merge
  into one word — net cost for the primary persona. Left to governed extension.
- *Bound case suffixes.* Compact and regular, but reintroduces word-shape-
  changing case — exactly what `0000` §3.1 rejected — even if kept optional.

> **Cost accepted, recorded explicitly:** overloading `wa`/`na` for
> comitative/benefactive means those readings are contextually inferred, not
> marked. Accepted as graceful degradation (rule 2); a dedicated marker can be
> *added* later without breaking anything (rule 5).

-----

## 5. Tense, aspect & number (resolves O-5)

Per `0000` §3.2 these ride on **optional particles with a zero default**: the
bare form is unmarked, and you add a particle only when the information matters.
All are **free words**.

### 5.1 No tense; aspect via two optional particles + time-words
**Decision.** Talo has **no grammatical tense**. *When* is carried by optional
**time-words** (lexicon — *yesterday/now/later*, Phase 3), and a small set of
optional **aspect particles** placed **immediately after the verb**:

| Particle | Aspect | Gloss |
|---|---|---|
| `li` | completive / perfective | done, has happened |
| `wi` | progressive / continuous | ongoing, -ing |

```
kanuka tumito        the dog runs / ran   (unmarked — timeless default)
kanuka tumito li     the dog has run      (completive)
kanuka tumito wi     the dog is running   (progressive)
kanuka tumito soti   the dog ran yesterday   (soti = illustrative time-word)
```

**Rationale.** Matches the large isolating blocs (Mandarin, Indonesian) and the
zero-default principle: the bare verb is timeless, and the most concrete thing a
novice can do is *say when with a when-word*. Post-verbal placement harmonises
with the postpositional/head-final choices (§4). (Rules 1, 3.)

**Alternatives rejected.** *Tense particles (past/present/future)* — familiar to
English/Romance but absent from several huge L1s, and imposes a 3-way time choice
the zero-default avoids. *Both tense and aspect* — more to sequence and combine.

### 5.2 Number — optional plural particle, default number-neutral
**Decision.** A bare noun is **unspecified for number**. An optional particle
`pu` follows the noun to mark plurality when it matters; exact counts use numeral
words (lexicon).

```
kanuka       a dog / dogs (number-neutral)
kanuka pu    dogs (explicitly plural)
```

**Rationale.** Matches Mandarin/Indonesian/Japanese, honours no-agreement
(§3.1) and zero-default (§3.2). (Rules 1, 3.) *Reduplication* and
*numerals-only* were rejected (the former fights the suffixing morphology and
burdens the parser; the latter can't express "the dogs" without a count).

### 5.3 Clusivity — optional particle on a neutral "we"
"We" is `mi pu` (I + plural, §6.1) and is **clusivity-neutral by default**. When
inclusive vs exclusive matters, add an optional particle:

| Particle | Meaning |
|---|---|
| `sa` | inclusive — "we" *including you* |
| `fo` | exclusive — "we" *not including you* |

```
mi pu        we (unspecified)
mi pu sa     we (you and I)        inclusive
mi pu fo     we (they and I)       exclusive
```

This mirrors the optional-plural design exactly (neutral default + optional
marker). The fully compositional alternative — `mi i yu` "I and you" / `mi i te`
"I and they" (§6.5) — remains available and is maximally transparent; the
particle is the shorter option for a frequent distinction. **Emphasis is not a
mechanism** — Talo encodes no prosody (`0000` §2; `0001` §6), so stress can never
carry a grammatical contrast.

-----

## 6. Closed-class function words

Per `0000` §3.3, mandatory POS-marking applies to **content** words. Function
words are a **closed class the parser knows by listing**, so they take **no
badge** — marking them would be redundant and would misleadingly imply they
inflect. This is a principled scope limit on §3.3, not an exception to it.

### 6.1 Pronouns — minimal & neutral
**Decision.** Three persons, no gender, no formality; number via the plural
particle `pu` (§5.2):

| | singular | plural |
|---|---|---|
| 1st | `mi` "I" | `mi pu` "we" (+ `sa`/`fo` for clusivity, §5.3) |
| 2nd | `yu` "you" | `yu pu` "you (pl.)" |
| 3rd | `te` "he/she/it/they" | `te pu` "they" |

**Rationale.** Smallest set, zero social judgement. One **genderless** 3rd person
is consistent with no-gender (`0000` §3.1). One `yu` regardless of politeness
avoids the notorious "when do I use the formal one?" L2 judgement call — against
the primary persona (rules 2, 3). Clusivity is handled by the optional particle
(§5.3) rather than a permanent paradigm cell.

### 6.2 Negation — `ne` before the negated element
**Decision.** A single negator word `ne`, placed **immediately before whatever it
negates** (verb, noun, modifier or whole clause). Zero judgement: *to say not-X,
put `ne` before X.*

```
kanuka ne tumito     the dog does not run        (negates the verb)
ne kanuka tumito     not the dog runs (something else does)   (negates the noun)
```

**Rationale.** One word, flexible scope, transparent, matches most languages
(rules 3, 4). Distinct from the **lexical** opposite-affix `-ku` (§3.2): `ne`
negates *in the clause*; `-ku` builds an *antonym word*. *Fixed pre-verb-only*
negation (clausal scope only) and a *bound negative affix* (no clausal scope,
awkward stacking) were rejected.

### 6.3 Copula — an explicit "to be" verb
**Decision.** A dedicated copula **root `ya`**, used as a normal verb (`yato`),
links a subject to a **noun predicate** (equation) or a **modifier predicate**
(property):

```
kanuka yato wolika     the dog is an animal   (woli = illustrative root "animal")
kanuka yato bolape     the dog is big
```

**Rationale.** An explicit signal beats marking-by-absence (rule 4), and removes
the ambiguity a zero-copula would create between the predicative "the dog is big"
and the attributive noun phrase "big dog" (`bolape kanuka`). Being a regular
verb, the copula takes aspect particles like any other (`kanuka yato wi` "the dog
is being…"). *Zero copula* (juxtaposition) and *property-as-verb + separate
identity word* were rejected — the former is predication-by-absence (against rule
4), the latter splits predication into two patterns the learner must keep apart.

> **Cost accepted:** one extra word in every equational/predicative clause.
> Bought for transparency and zero ambiguity (rule 4).

### 6.4 Questions — clause-final particle + in-situ question words
**Decision.**
- **Yes/no questions** add the particle `ke` at the **end of the clause**; word
  order is otherwise unchanged.
- **Content questions** use question words (lexicon, badged like any content
  word) left **in their normal position (in-situ)** — no fronting, no movement.

```
kanuka tumito ke         does the dog run?
kanuka yato bolape ke    is the dog big?
homika lumito takuka     the person sees what?    (taku = illustrative "what", in object slot)
```

**Rationale.** No word-order change ever — matching the large head-final/isolating
blocs and imposing the lowest judgement on the novice (rules 1, 3). *Fronting*
(English-style) adds a movement rule that fights the fluid, position-light syntax;
*intonation-only* depends on prosody Talo does not encode and fails in writing.

### 6.5 Coordination — `i` "and"
A free conjunction `i` joins like constituents (`mi i yu` "you and I";
`kanuka i homika` "the dog and the person"). It underpins the compositional route
to clusivity (§5.3).

### 6.6 Definiteness — no obligatory articles
**Decision.** Talo has **no obligatory articles**. A bare noun is unmarked for
definiteness, exactly as number is unmarked (§5.2). Specificity is available when
wanted, but only through words Talo **already has** — so it costs **no new
grammatical machinery and no new judgement** (the resolution of "optional
precision vs. extra choice"):
- "the / that one" → demonstratives `ini` (this) / `itu` (that): `kanuka itu`.
- "a / a certain" → numeral `ta` (one) or `badi` (some): `kanuka ta`; bare
  `kanuka` already covers "a dog".

**Rationale.** Articles are absent from most of the largest L1s (Mandarin,
Hindi, Russian, Japanese, Indonesian, Bengali) and are a notorious L2 stumbling
block. Omitting obligatory articles fits zero-default (§3.2) and
no-mandatory-grammar (§3.1) and removes a judgement the primary persona cannot
yet make. (Tie-break rules 1, 3; rule 2 — an over-/under-specified noun still parses.)

> **Determiner placement (see `docs/0005` §3).** The demonstratives, numerals and
> quantifiers here form a closed **determiner** class that **follows** the head
> noun (`kanuka itu`, `kanuka ta`), distinct from the descriptive `-pe` modifiers
> that **precede** it (§6.3). The rule is *describe before, determine after*;
> stacked order is Noun – demonstrative – quantity, with `pu` outermost. Fixed and
> exemplified in `0005` §3.

### 6.7 Correlatives — a regular stem × category grid
**Decision.** The pro-forms (question / demonstrative / indefinite / negative /
universal words) are a **fully regular table**: a **stem** prefix combines with a
**category** suffix. Learn 6 stems + 7 categories (13 pieces) → **42 words**, all
predictable — the additive-derivation principle (rule 5) applied to the closed
deictic system, maximally transparent for the novice (rule 4).

**Stems:** `se-` question · `ini-` this/near · `itu-` that/far · `ba-` some ·
`ha-` no/none · `o-` every/all.
**Categories:** `-la` person · `-ko` thing · `-lo` place · `-no` time ·
`-fu` reason · `-wa` way/manner · `-mu` amount.

| | Q `se-` | this `ini-` | that `itu-` | some `ba-` | no `ha-` | every `o-` |
|---|---|---|---|---|---|---|
| **person** -la | sela who | inila | itula | bala someone | hala no one | ola everyone |
| **thing** -ko | seko what | iniko this(thing) | ituko that(thing) | bako something | hako nothing | oko everything |
| **place** -lo | selo where | inilo here | itulo there | balo somewhere | halo nowhere | olo everywhere |
| **time** -no | seno when | inino now | ituno then | bano sometime | hano never | ono always |
| **reason** -fu | sefu why | inifu | itufu | bafu | hafu | ofu |
| **way** -wa | sewa how | iniwa thus | ituwa | bawa somehow | hawa noway | owa anyhow |
| **amount** -mu | semu how-much | inimu this-much | itumu that-much | bamu some | hamu none | omu all |

The pre-existing `se-` question series (§6.4) was designed to fit this grid, so
no question word changes. The grid **supersedes** the earlier independent forms
for *here/there/now/never/always* (now `inilo/itulo/inino/hano/ono`), and
`down/below` was re-minted `sita` (Japanese *shita*) to free `bawa` for
*some-way*. Bare demonstratives "this/that" (§6.6) are `ini`/`itu` — the stems
themselves; the `-ko` thing-forms `iniko/ituko` are the explicit "this thing".

> **Cost accepted:** five high-frequency words become two syllables longer than a
> bespoke short form would be (e.g. `inino` "now" vs the old `nu`). Bought for a
> zero-exception, self-generating deictic system — the learner never memorises
> these as separate vocabulary. (Rule 3: predictability over economy.)


-----

## 7. Putting it together — worked clauses

```
Plain transitive, both orders legal (verb found by -to, S guaranteed first):
  kanuka lumito homika      the dog sees the person      (S V O)
  kanuka homika lumito      the dog sees the person      (S O V)  — equally legal

Negated, progressive:
  kanuka ne tumito wi       the dog is not running

Ditransitive (recipient marked, object bare, subject first):
  homika donato watoka kanuka na    the person gives the dog water

Derived vocabulary in a clause:
  edukika edudeka lo manuto wi      the teacher is eating at the school
  (edu+ki+ka teacher · edu+de+ka+lo school-LOC · manu eat +to · wi progressive)

Equation + yes/no question:
  te yato edukika ke        is he/she a teacher?

Plural + clusivity:
  mi pu sa tumito           we (you and I) run
```

*(Roots `kanu, homi, wato, libo, edu, manu, seka, kuto, bola, bone, piko, woli`
and the time/question words above are illustrative placeholders pending the
Phase-3 lexicon; only the affixes, markers, particles, function words and
structure are normative.)*

-----

## 8. Costs knowingly accepted (consolidated)

1. **Verbosity from obligatory badges** (§1) — three suffixes everywhere; bought
   for zero-judgement parsing and additive derivation (rule 3).
2. **Acategorial roots need lexical glosses** for each badge pairing (§2.1) —
   maximal regularity at the price of a lexicon lookup.
3. **Compounding buffer-vowel wrinkle** (§3.1) — rare, deterministic, pushed onto
   tooling.
4. **Up-front affix load** (§3.2) — ten affixes; memorisation, not judgement.
5. **Overloaded role markers** (§4) — comitative/benefactive inferred from
   instrument/dative; extensible later (rule 5).
6. **Copula adds a word** to every predication (§6.3) — bought for transparency
   (rule 4).

-----

## 9. Interfaces to later phases

- **Linter (`tools/phonotactic-linter/`).** Every badge, affix, particle, marker
  and function word above passes R1–R6. The compounding buffer rule (§3.1) is a
  candidate for a future **morphological** linter mode (validating word-internal
  morpheme seams), distinct from the current phonotactic mode.
- **Collision checker (Phase 3, `0000` §4).** Must keep the closed-class
  grammatical morphemes here clear of near-homophony with each other and with
  minted roots — especially under the weak stop contrast (`0001` §2.1): the very
  short function words (`na lo su fe wa we li wi pu sa fo ne ke i mi yu te ya`)
  are high-value and must not collide with high-frequency roots.
- **Lexicon (Phase 3).** Supplies roots, time-words, question words, numerals,
  and the **conventional badge-gloss** of each root (§2.1). Derivation (§3) is
  what lets the ~1,000–1,500 root target (`0000` §4) cover the long tail.
- **Parser/validator & derivation explorer (Phase 5, `0000` §5).** The
  morphotactic template (§2.2), affix set (§3.2) and compounding rule (§3.1) are
  the spec these tools implement; the parser also enforces subject-first and
  badge-final parsing.
- **Governance (`0000` §6).** The derivational affix set (§3.2) and the
  role-marker inventory (§4) are explicitly **extensible**; the freeze boundary
  must record which of these is frozen-core vs open-for-extension.

-----

## Appendix A — Quick reference

```
BADGES (bound, suffix, always last):   noun -ka   verb -to   modifier -pe
WORD TEMPLATE:                          ROOT (+DERIV)* +BADGE
ACATEGORIAL:                            one root + each badge = N / V / modifier

DERIVATIONAL AFFIXES (bound, root→affix→badge):
  -ki agent   -tu instrument  -bo patient/result  -de place   -pa quality
  -ci dim.    -go augm.       -ku opposite        -ta causative  -pi inchoative
COMPOUND:    modifier-root(s) + head-root + ONE badge   (buffer 'a' at illegal n-seam)

ROLE MARKERS (free, postposed):  na to · lo at/in · su toward · fe from · wa with · we of
  plain transitive object: BARE (subject-first carries S/O)

TAM & NUMBER (free, optional, zero default):
  aspect (post-verb):  li completive   wi progressive      tense: NONE (use time-words)
  number (post-noun):  pu plural        clusivity: sa incl  fo excl

FUNCTION WORDS (free, NO badge):
  pronouns:  mi I · yu you · te he/she/it/they   (plural via 'pu')
  negation:  ne  (immediately before what it negates)
  copula:    ya → yato "to be"   (X yato Y = X is Y)
  questions: ke  (clause-final, yes/no) · content words IN-SITU
  and:       i

SYNTAX:  subject FIRST (enforced) · verb placement FLUID (found by -to)
         modifier BEFORE head · postpositions · questions in-situ
```

## Appendix B — Complete grammatical-morpheme inventory

**Bound (stop/affricate onset, CV):** `-ka -to -pe` (badges); `-ki -tu -bo -de
-pa -ci -go -ku -ta -pi` (derivational affixes). 13 total.

**Free (unrestricted onset):** `na lo su fe wa we` (role markers); `li wi` (aspect);
`pu` (plural); `sa fo` (clusivity); `mi yu te` (pronouns); `ne` (negator); `ya`
(copula root); `ke` (question); `i` (and). 18 total.

No two of the above differ by voicing alone (`0001` §2.1); all pass R1–R6.

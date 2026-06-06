# Talo — 0014: grammar register II (voice, partitive, proper nouns, anteriority)

**Status:** Accepted (maintainer decision, this session). Four register/grammar
calls surfaced by verbatim translation of real news prose (the corpus-as-validator
loop, docs/0013 §3). Each is recorded here with its rationale and cost.

**Parent:** `docs/0002` (grammar core), `docs/0008` (corpus register: the
no-passive decision this revisits), `docs/0005` §4 (proper-noun policy this
amends), `docs/0011` (freeze boundary — §4 below reopens the closed class within
the pre-1.0 correction window).

-----

## 1. Voice: a passive particle `kena`

`docs/0008` chose **no passive** (agentless predication via resultative `-pe` +
impersonal `bala`). Translating hard-news prose showed this is too costly: the
register is saturated with agent-demoting passives ("were ordered", "is given",
"had been told"), and re-casting every one to an active with a supplied or
impersonal agent is verbose and often distorts focus.

**Decision.** Add a clause-level **passive particle `kena`**, placed before the
verb; the patient is the subject; the agent, if expressed, takes the instrument
marker `wa`:

```
pangai     kena donato      (wa NASA-ka)
order-N    PASS give-V      (by NASA)
"the order is given (by NASA)"
```

**Transfer.** `kena` is the actual Malay/Indonesian passive/adversative marker
("kena pukul" = got hit) — maximal recognisability for the largest donor family,
and it dodges the b/p·d/t·g/k near-homophone collapse (the obvious Indonesian
`di-` was rejected: `skeleton(di) = ti`, clashing with `ti` "also").

**Cost (recorded).** This **reopens the closed class** (docs/0011 §5.1 #4): the
free-word inventory goes 20 → 21. Permissible now because 1.0 is not yet
declared; it must be ratified into the freeze inventory. `bala`/`-pe` remain valid
for genuinely agentless statements — `kena` is the *demoted-agent* passive.

## 2. Partitive: reuse `fe` "from/source"

"five of the seven" had no clean construction. **Decision:** the partitive is
**`N₁ fe N₂`** — the source role marker `fe` read as "out of":

```
le   fe   haba(-pu)
five from seven(-PL)
"five of the seven"
```

No new word; `fe` already means source/origin ("5 out of 7" is a source reading).

## 3. Proper nouns: a hybrid policy (amends `docs/0005` §4)

`0005` §4 adapted **all** proper nouns to phonotactics; that mangles
internationally-recognised acronyms (ISS → *Iseseka*) for no gain.

**Decision (hybrid).**
- **Ordinary names** are adapted to Talo phonotactics for speakability and take a
  badge: *Yapan(ka)*, *Lusia*, *Dalagon(ka)*.
- **Acronyms and global brand names** are kept **verbatim** in their source form
  (NASA, ISS, SpaceX), with a badge only when grammar requires it (*NASA-ka*).
  They are not pronounceable-as-words anyway, so adaptation only destroys
  recognisability. (Tooling: a glosser/proper-noun follow-up should treat an
  all-caps token as a kept-verbatim proper noun.)

## 4. Anteriority: stay tenseless, order with time-words

English past-perfect ("the leaks **had** started", "**had been** sheltering") has
no dedicated Talo form, and **none is added**. Talo is tenseless by design
(`0002`): aspect (`li` completive / `wi` progressive) plus **time-words** carry
all temporal relation. Relative anteriority/posteriority uses the existing
`mae` "before(hand)" / `ato` "after":

```
udala-kelua  mulai ongesa li   mae,  din-ki lo
air-leak     begin increase COMPL earlier, day-2 at
"the leak had begun increasing, on Monday"
```

A dedicated anterior particle was considered and **rejected**: the nuance is
almost always recoverable from `mae`/`ato` + context, and it would add closed-class
complexity against the tenseless principle.

## 5. Lexical note: astronaut vs alien

`antalahito` "space-person" is accepted for **astronaut** (a human space-traveler).
To keep it unambiguous, **alien** takes a distinct compound — "other-world being",
`duniahoka`-+being — rather than overloading `antalahito`.

## 6. Change set

1. `kena` added to the parser's `FUNCTION_WORDS` (`voice`) and the collision
   checker's `RESERVED_FORMS` (kept in lock-step by the sync test); the glosser
   glosses it `PASS`.
2. Partitive `fe`, the hybrid proper-noun policy, and the anteriority convention
   are documentation (no further code): `fe`, `mae`, `ato` already exist.
3. `0005` §4 gains a pointer here; `0011` §5.1 #4's frozen inventory is now
   "20 + `kena`" pending 1.0 ratification.

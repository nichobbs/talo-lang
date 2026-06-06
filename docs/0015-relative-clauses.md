# Talo — 0015: relative clauses

**Status:** Accepted (maintainer decision, this session). Surfaced as the biggest
grammar gap when translating real prose (docs/0013 §3): clauses like "astronauts
*who* arrived", "the segment *where* the leaks started", "the tunnel *known as*
PrK".

**Parent:** `docs/0002` (grammar core: correlatives §6.7, `-pe` modifiers §1,
subject-first §3.5), `docs/0014` (the register pass this continues).

-----

## 1. Decision

Relative clauses are **head-initial** and reuse the existing **correlative grid**
as relativisers — no new closed-class word. A correlative of the `se-` series
follows the head noun and introduces the relative clause, filling (gapping) the
relativised role:

| relativised role | relativiser | example |
|---|---|---|
| person | `sela` (who) | `adamika sela datanto li` — "the man **who** arrived" |
| thing | `seko` (which) | `bukuka seko mi tauto li` — "the book **which** I read" |
| place | `selo` (where) | `baitika selo te kunato` — "the house **where** they live" |
| time | `seno` (when) | `dinka seno itu acanato li` — "the day **when** it happened" |
| reason | `sefu` (why) | "the reason **why** …" |
| manner | `sewa` (how) | "the way **how** …" |

Possessive ("whose") = `sela we` (person + genitive). Obliques that the grid
covers (place `selo`, time `seno`) need **no resumptive**; the relativiser carries
the role.

**Reduced (participial) relatives.** A one-verb relative collapses to a `-pe`
modifier **before** the head (Talo's native modifier-first order, §1) — no
relativiser:

```
sapaipe adamika          — "the arrived man" (= the man who arrived)
"PrK"-yobupe toneleka    — "the tunnel called PrK" (handles "known as")
```

## 2. Word order

Inside the relative, the **relativiser fronts** (a controlled exception to
subject-first, exactly as English wh-relatives front: "the book **which** I
read"); the remainder follows normal order with a gap at the relativised role.
The **matrix** clause is unaffected — its head noun still precedes the matrix
verb, so subject-first holds at the top level:

```
antalahitoka pu   sela sapaito li,   ludiato li
[astronaut-N PL  [REL arrive-V COMPL]] return-V COMPL
"the astronauts, who arrived, returned"
```

Restrictive and non-restrictive relatives share this syntax; writing sets off a
non-restrictive one with a comma/pause.

## 3. Why correlatives (not an invariant relativiser)

- **Zero new closed-class words** — important post-`0011` freeze; this is pure
  syntax over words that already exist.
- **Maximally expressive** — who / which / where / when / why / how all fall out
  of the grid, including the oblique relatives that an invariant marker (`ce`,
  Indonesian *yang*) would need a resumptive for.
- **Positive transfer** — aligns with the wh-relativisers of English, Romance and
  many L1s, for the first-second-language persona (`0000`).

## 4. Tooling & a compounding caveat

`tools/parser` validates all of the above **as-is** — no construction-specific
rule was needed (the relativiser is a recognised correlative; the matrix head
satisfies subject-first). Locked by tests in `parser.test.ts`.

**Caveat surfaced in testing:** a compound noun must carry its **badge**. The
"astronaut" compound is `antala`+`hito` → it must surface as **`antalahitoka`**
(noun badge `-ka`); written bare as *antalahito* it ends in `-to` and the parser
reads it as a *verb* (`antalahi-to`). General rule (already `0002` §1): roots and
compounds never surface bare — always badge them.

## 5. Cost

A controlled relativiser-fronting exception *inside* relatives (universal, and
transfer-aligned). No new word; the closed-class inventory and the freeze
boundary are untouched.

# Talo — Phase 12: register grammar (comparison · relatives · modality · complementiser)

**Status: Accepted.** Closes the four grammatical edges the corpus surfaced
(`corpus/GAPS.md` "Register strains") plus one parser limit, so Talo can carry
comparison, relative clauses, layered modality and embedded/reported speech —
the constructions that recur in analytical and journalistic prose. **Ratified by
the maintainer**, decision by decision (the options were worked through with
worked examples). It is *additive*: four of the five reuse machinery that already
exists; only **one closed-class word** (`ce`) and **one content root** (`beki`)
are added, and no locked decision in `0000`–`0011` is reversed.

**Parent:** `docs/0002` (the grammar this extends — §3.5 word order, §4 role
markers, §6.3 modifiers), `docs/0005 §3` (determiners), and `corpus/GAPS.md` (the
strains this answers). **Tie-break rules** (`0000` §0): 1 transfer · 2 graceful
degradation · 3 predictability over economy · 4 transparency · 5 derivation
additive.

> Every Talo example here validates through `tools/parser` (suite extended); the
> two new forms pass both gates (`beki` collision-clear; `ce` reserved).

-----

## 0. What this resolves

| # | Gap (from `GAPS.md`) | Resolved in | New morpheme? |
|---|---|---|---|
| 1 | Comparative with a standard ("more X **than** Y") | §1 | none (reuse `fe`) |
| 2 | Relative clauses ("the country **that** helps") | §2 | none (reuse `-pe` + resumptive) |
| 3 | Modality (must/should/can), no must-vs-should | §3 | +1 root `beki` "should" |
| 4 | Quotative / embedded "that" | §4 | +1 closed-class word `ce` |
| 5 | Parser limit: role marker + post-nominal `-pe` | §5 | none (parser fix) |

-----

## 1. Comparison — the standard takes `fe` "from" (ablative of comparison)

**Decision.** A comparison is `… lebi` ("more") or `… sukuna` ("less") with the
**standard of comparison marked by the source role marker `fe`** ("from") — the
ablative-of-comparison pattern of Latin, Russian, Hindi and many others.

```
somaka yato muhimupe lebi uanka fe
study.N COP important.MOD more  money.N from
'Study is more important than money.'

mi gandepe lebi yu fe          'I am bigger than you.'
```

**Superlative** falls out for free as "more than all": `… lebi ote fe`
("more than everyone/everything").

**Rationale.** Reuses an existing role marker (rules 3, 5), is a well-attested
transfer pattern (rule 1), and parses today. It overloads `fe` (source + standard)
exactly as `wa` already covers instrument+comitative (`0002` §4) and `na`
benefactive+dative — a sanctioned Talo pattern. **Rejected — a dedicated "than"
particle:** +1 closed-class word for a relation `fe` already carries (rules 3, 5).
**Rejected — the two-clause paraphrase** ("X more, Y less"): the clunk the op-ed
flagged.

-----

## 2. Relative clauses — `-pe` participle (subject) + resumptive juxtaposition (object)

**Decision.** Talo has no dedicated relativiser. Two existing mechanisms cover the
ground:

- **Subject relatives → a post-nominal `-pe` participle.** A `-pe` modifier built
  on a *verb* root, placed after the noun, reads as "the one that V-s":
  ```
  negalaka tolonape        'the helping country / the country that helps'
  hitoka somape tauto lebi 'people who study know more'
  ```
- **Object / oblique relatives → a postposed bare clause with a resumptive
  pronoun** (`te`):
  ```
  adamika, mi kanto te. te datanto li.
  'the man (whom) I saw came.'   (lit. the man, I saw him; he came)
  ```

This also settles modifier placement: **a `-pe` modifier may be attributive
*before* the head (`0002` §6.3) or *after* it** (post-nominal participle/
attributive). Both are legal; see §5.

**Rationale.** Reuses `-pe` (rule 5) and a resumptive strategy common in the
world's languages (rule 1); zero new morphemes (rule 3). **Rejected — a
correlative `sela` relativiser** (`hitoka sela tolonato`): clean and uniform, but
risks question/relative ambiguity and adds a subordination pattern; held in
reserve. **Rejected — a dedicated relativiser particle:** +1 closed-class word.

-----

## 3. Modality — serial modal + main verb; `beki` "should" minted

**Decision.** A modal (`lasima` "must", `beki` "should", `bisa` "can") is a verb
that **precedes the main verb in the same clause** — a serial modal-+-verb chain.
The main verb keeps its own arguments:

```
totoka bekito bacato honka     'children should read books'
seifuka lasimato tolonato kimiakika  'the government must help refugees'
mi bisato somato               'I can study'
```

A new root **`beki` "should / ought"** (COG-077, Japanese *beki*) gives the
**weak-vs-strong** obligation distinction against `lasima` "must".

**Rationale.** The serial chain is the only form that lets the embedded action
keep its **object** ("read **books**"); the nominalised-complement alternative
(`lasimato … we …ka`, "must the-reading of-books") forces an awkward genitive on
every transitive modal — and transitive modals pervade the register. The parser
**already accepts** the chain (multiple verbs after a subject-first nominal), so
this ratifies an existing capability rather than adding machinery (rules 1, 3).
`beki` is the only new morpheme, and it is a content root, not closed-class.
**Rejected — modal + nominalised complement as canonical** (the `0009`-era
work-around): periphrastic and genitive-heavy for transitive complements; still
permitted for the rarer case where the action itself is the focus.

-----

## 4. Quotative / complementiser — `ce` "that"

**Decision.** Mint one closed-class word **`ce`** that introduces an **embedded or
reported clause** as a complement:

```
mi tauto ce te datanto li            'I know that he came.'
lapoluka semato ce hasika yato salamape  'the report says that the bridge is safe.'
```

`ce` is a reserved closed-class word (checker `RESERVED_FORMS`, parser
`FUNCTION_WORDS.complementizer`); it has **no `data/` row**, exactly like the
`0010` numeral markers. Direct quotation by juxtaposition (`X semato li. …`,
`0008` §2) remains available and idiomatic for direct speech; `ce` is for
*embedding* (objects of "know/say/report", and "asked **whether**…").

**Rationale.** The op-ed and the news corpus show embedded reports recur
constantly — the cost-benefit `0008` §2 deferred has now tipped. `ce` is one
short word; a quotative drawn from "say" is among the commonest complementiser
sources cross-linguistically (Japanese `to`, Hindi `ki`, West-African `sɛ`/`kɛ`),
so it transfers (rule 1). **This supersedes the `0008` §2 deferral.** No tense
backshift exists in Talo (`0002` §5), so the embedded clause is just a plain
clause after `ce` — the parser needs no special subordination logic.

-----

## 5. Parser fix — a role marker attaches to the whole noun phrase

**Decision (tooling clarification, not a grammar change).** A postposed role
marker (`na/lo/su/fe/wa/we`) follows the **entire noun phrase**, including any
post-nominal `-pe` modifier — `negalaka toipe fe` "from a far country" — **and any
other post-nominal phrase tail**: the plural `pu` / clusivity (`totoka pu fe` "than
the children") and the postposed determiners (numbers, `ini`/`itu`, quantifiers).
The NP is `noun (+ -pe modifiers)(+ pu/clusivity)(+ determiners)`, and the marker
follows the whole thing. The parser's `S4` rule walks back over that tail to the
nominal head, and `S7` no longer flags a post-nominal modifier as dangling (it is
the §2 attributive/participle). Tests added; the corpus's earlier work-arounds are
retired. (`pu` stays a **free** word, not a bound suffix — it also attaches to
pronouns (`te pu`) and the word shape keeps the badge strictly final, §1.)

-----

## 6. Cost summary

| Decision | Cost knowingly accepted |
|---|---|
| §1 comparison = `fe` | `fe` is overloaded (source + standard) — resolved by context, as `wa`/`na` already are |
| §2 relatives = `-pe` + resumptive | non-agentive object relatives are periphrastic (resumptive `te`), not a single clause |
| §3 modality = serial chain + `beki` | a clause may now contain a modal+main verb sequence the learner parses as one predicate |
| §4 complementiser `ce` | +1 closed-class word; embedding now has two registers (juxtaposition vs `ce`) |
| §5 parser fix | none — removes a spurious rejection |

Net: **+1 root (`beki`), +1 closed-class word (`ce`)**, two parser-rule
clarifications, and three constructions blessed that already parsed. Nothing in
`0000`–`0011` is reversed; §4 supersedes the `0008` §2 *deferral* (not a decision).

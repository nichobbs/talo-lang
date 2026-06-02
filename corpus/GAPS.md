# Corpus punch-list — gaps surfaced by translation

Concepts and structures that translating the first three articles forced us to
**paraphrase or recast** because Talo cannot yet say them directly. This file is
hand-maintained (the checker can only catch *unknown roots in text*, not *things
we couldn't write*). Nothing here is a decision — these are inputs for a future
`docs/0008-corpus` ADR and small, gated lexicon/grammar follow-ups. **No words
have been minted and no grammar has been changed in this slice.**

## Vocabulary gaps (would need minting, donor-balanced, both gates)

| Concept | Domain | Worked around by | Notes |
|---|---|---|---|
| `kill` | ACT | used `mati` "die" instead | Should derive as causative `mati`+`-ta` → `matita` ("cause to die"); confirm and document rather than mint. |
| `rescue` / `save` | ACT | avoided (used `tolona` "help") | Common in disaster news; likely a real new root. |
| `president` / `minister` / `leader` / `official` | SOC/PER | used `seifu` "government", `muku` "chief" | A small political-roles batch. `muku` "chief/headman" covers informal "leader" only. |
| `spokesperson` | SOC/PER | folded into `seifu semato` "the government said" | Derivable? `sema` "say" + agent `-ki` → `semakika` "sayer" is awkward; needs a decision. |
| `be born` / `birth` | BOD | dropped a planned panda/zoo item | No root; recast as "now there is a baby…" works but is clumsy. |
| `zoo` | DWE | dropped | Could compound (`dobu` animal + `kebun` garden) but no settled compound. |
| `appear` / `first` | ACT/QTY | not needed yet | Noted for future items. |

Most other "missing" news words turned out to already exist under a synonym or
to derive cleanly: `destroy`→`nasai`, `region/area`→`padesa`, `report`→`lapolu`,
`announce`→`anunio`, `hit/strike`→`tataku`, `say`→`sema`, `team`→`kelopo`
"group", `scientist`→`kagaku`+`-ki`+`-ka` `kagakukika`, `teacher`→`ayali`+`-ki`+
`-ka` `ayalikika`, `school`→`ayali`+`-de`+`-ka` `ayalideka`.

## Grammar / register gaps (would need an ADR — constitutional)

1. **No passive / agentless predication.** "Houses were destroyed" cannot be
   said without naming an agent; we recast to intransitive "houses broke"
   (`baitika pecato`) or to active "the earthquake destroyed houses". News leans
   heavily on agentless passives ("five were arrested"). *Biggest single gap.*
2. **No quotative / reported-speech frame.** "The government said *that* help is
   coming" is rendered as two juxtaposed clauses (`seifuka semato li. tolonaka
   datanto wi.`). Works, but a complementiser or quote particle would remove the
   ambiguity that pervades attributed news writing.
3. **Approximation / "at least", "about", "more than".** No hedging numerals;
   "at least twenty" had to drop to "many" (`ingi`). Casualty/figure language is
   core to news.
4. **Dates and day/month names.** No weekday or month names; only `yana`
   yesterday / `leo` today / `taun` year / `sukia` month / `din` day exist.
   Datelines ("on Tuesday", "in March") need a convention.
5. **Manner adverbs.** "go quickly" used a trailing `-pe` modifier
   (`hayaipe`); this validates, but whether a manner adverb is just a modifier or
   wants its own slot is undocumented (`0002` treats `-pe` as adnominal).

## Proper-noun / transliteration gaps

- `0005 §4` fixes *that* names are nouns taking `-ka` and are adapted to
  phonotactics, but **not a consistent transliteration scheme** (which donor
  spelling to follow, how to place stress, handling of un-adaptable segments).
  `Japan` → `Yapan` was a judgement call. A short transliteration appendix would
  make the corpus reproducible. Declared names live in `proper-nouns.tsv`.

## Batch-3 workarounds (longer pieces — storm, school)

The two longer articles surfaced **no grammar gaps** — conditionals (`fi…toki`),
wh-/yes-no questions, the connectives `i`/`ma`/`sababu`, and the negative
imperative all composed at discourse length. A few small **vocabulary** gaps were
paraphrased around and are candidates for a future batch:

- **`danger` / `dangerous`** — avoided; rendered as "the wind/sea is strong" and
  "people fear the storm" (`taku`).
- **`stay` / `remain`** (as distinct from "be at") — used the locative `kuna`
  ("be in the house"); a dedicated "stay" verb would read better for warnings.
- **`calm`** (of weather/sea) — rendered as "good" (`hao`); a real "calm/still"
  modifier is the natural word.
- **`study`** — folded onto `belaya` "learn" / `baca` "read".

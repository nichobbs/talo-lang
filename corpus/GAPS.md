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
imperative all composed at discourse length. The small **vocabulary** gaps they
exposed are now **minted** (donor-balanced, both gates exit 0):

- **`danger`** → `bahaya` (Indonesian, Austronesian); *dangerous* = `bahayape`.
- **`stay` / `remain`** (distinct from locative `kuna`) → `tomalu` (Japanese
  *tomaru*, Japonic).
- **`study`** (distinct from `belaya` "learn" / `baca` "read") → `soma` (Swahili,
  Bantu).
- **`calm`** — *not* a gap: it already exists as **`sisuka`** (the batch-3 note was
  mistaken; the storm article's "good sea" could be re-worded with `sisuka`).

## Register strains (opinion / analysis — article 0009)

The op-ed piece is fully valid Talo, but four natural opinion constructions had
to be **paraphrased**. These are the grammar's current edges for argued prose —
candidates for future ADRs, not bugs:

1. **Comparative with a standard** ("more X *than* Y") — biggest strain. There is
   no "than"/standard marker, so it was split into two contrasting degree clauses
   (`somaka … muhimupe lebi` / `uanka … muhimupe sukuna` = "study matters more,
   money less"). A `mae`-style standard marker or a `lebi … fe …` ("more … from …")
   construction would be the natural fix.
2. **Relative clauses** ("the people *who* study") — no relative construction.
   Agentive ones dodge it via the agent noun (`somakika` "studier" = "those who
   study"); a *non-agentive* relative ("the country that helps") still needs two
   clauses. NEW.
3. **Modality** ("must / should / can") — `lasima` "must" and `bisa` "can" are
   plain verbs with no auxiliary or verb-chaining construction. Used verb +
   nominalised complement (`lasimato somaka` "must the-studying"); works but is
   periphrastic, and there is **no must-vs-should distinction**. NEW.
4. **Embedded complement "that"** ("I think *that* …") — rendered by juxtaposition
   (`mi omouto li. …`), as `0008` §2 already foresaw; opinion register leans on it
   constantly, strengthening the case for a future quotative/complementiser.

Notably, everything *else* held: abstract subjects, evaluation, `because`/`but`,
conditionals, the ordinal, and the new `soma`/`bahaya`/`tomalu` all composed
cleanly.

## Large-article gaps (Delhi fire — article 0012)

The biggest piece so far (27 clauses) stayed fully valid, but a substantial news
report leaned on several missing items, all paraphrased:

**Vocabulary** (candidates for a disaster/news batch):
- **`foreign` / `foreigner`** — no word; "some of the dead came from another
  country" had to drop to `negalaka fe` "from the country" (and see the grammar
  note below for why `negalaka toipe fe` "from a far country" won't parse).
- **`trapped`** — rendered as `ne kimiato` "could not escape".
- **`firefighter`** — paraphrased as "people came and fought the fire".
- **`capital` (city)** — used the city name `Delika` instead.
- **`investigate`** — "officials do not yet know" + "the government will study it".
- **`spread`** (of fire) — used `sodatuto` "grew" + `naikito` "rose".
- **`survive`**, **`other`/`another`**, **`several`**, **`still/yet`** — worked
  around with `ikilu` "alive", `bala` "some", `inino ne` "now not".

**Grammar finding (worth a parser/ADR check):** a **role-marked NP cannot carry a
post-nominal `-pe` modifier** — `negalaka toipe fe` ("from a far country") is
rejected (`S4_ROLE_MARKER_POSTPOSED`), because the role marker `fe` no longer
"directly follows" the noun once a modifier intervenes. Either modifiers must
precede the noun inside a role-marked NP, or the rule needs to span `noun (+ -pe)*`.
Currently undocumented; the article sidesteps it.

Everything else carried a real disaster report: `matita` "kill" (causative),
compound numerals (`ki diko ta` = 21), `okoa` rescue, approximation (`fu diko
lebi` = 40+), reported speech, genitive, and the `mi we totoka` "my child"
possessive all composed cleanly.

## Conflict/diplomacy article (Israel–Lebanon ceasefire — article 0013)

A whole new domain. Three roots were **minted** for it (donor-balanced, both gates
exit 0): `katasa` forbid/ban (Bantu), `hamala` attack (Indo-Aryan), `buki` weapon
(Japonic). Much of the domain already existed: `setuyu` agree, `salama` safe,
`guntai` army, `tentala` soldier, `sima` border, `amani` peace, `pelan` war,
`adui` enemy, `laga` fight, `henti` stop.

Still paraphrased (candidates for a follow-up batch):
- **`ceasefire` / `truce`** — rendered as "agree to stop the war again"
  (`setuyu` + `henti pelan`). A dedicated word (or a fixed `amani`-compound) would
  be cleaner; this is the central term of the genre.
- **`fighter` / `militant`** — used the agent derivation `lagakika` ("fighter",
  fight + `-ki`); fine for "fighters", but "militant group / militia" still needs a
  compound or root.
- **`rocket` / `missile`** — folded onto `buki` "weapon".
- **`retaliation` / `revenge`**, **`displaced` / `refugee`**, **`negotiate`/`talks`**,
  **`terrorist`**, **`sovereignty`** — all paraphrased or dropped; a real
  geopolitics report leans on these constantly.

The **verbatim-translation** test (a full BBC article) confirmed the same: one
lede sentence already needs ~8 missing terms, and a full piece would need 40–60.
Verbatim translation is therefore both a copyright non-starter (we write original
summaries) and not yet lexically possible — exactly the gap this batch begins to
close.

## Conflict batch 2 (minted — article 0014 "When a ceasefire breaks")

The recurring geopolitics gaps from 0013 are now **minted** (donor-balanced, both
gates exit 0) and exercised in a second conflict piece:

- **`ceasefire` / `truce`** → `huduna` (Arabic *hudna*, Semitic).
- **`militia`** → `milisi` (Indonesian *milisi*, Austronesian).
- **`rocket` / `missile`** → `misile` (Latin/international, Romance).
- **`revenge` / `retaliation`** → `kisasi` (Swahili *kisasi*, Bantu).
- **`negotiate`** — *not* minted: already exists as `kosoa`.

Still open (next batch if needed): `terrorist`, `sovereignty`, `evacuate`,
`refugee` (currently the derivation `kimiakika` "one who flees").

## Conflict batch 3 (the rest of the geopolitics gaps — closed)

The four items left open after batch 2 are now resolved — two minted, two derived
(per the `0003` derivation-pruning rule: don't mint what derives predictably):

- **`terrorism` / `terror`** → minted `ilihabu` (Arabic *irhab*, Semitic).
  - **`terrorist`** → compound `ilihabuhitoka` ("terrorism-person", COMP-034).
- **`independent` / `sovereign` / `free` (liberty-sense)** → minted `meledeka`
  (Indonesian *merdeka*, Austronesian); distinct from `mulo` "free of cost".
  - **`sovereignty` / `independence`** → derived `meledekapaka` (independent + -pa).
- **`evacuate`** → derived `keluatato` (`kelua` leave + `-ta` causative = "make leave").
- **`refugee` / `displaced person`** → derived `kimiakika` (`kimia` flee + `-ki` agent).

Both gates exit 0. The geopolitics domain is now essentially covered.

## Grammar-register gaps — CLOSED by docs/0012

The grammatical edges logged above (the 0009 "Register strains" and the 0012-fix
note) are now **ratified and implemented** (`docs/0012`, parser + checker updated,
tests added):

- **Comparative with a standard** → `… lebi/sukuna … STANDARD fe` ("more X than Y",
  `fe` = ablative of comparison); superlative = `… lebi ote fe`. No new morpheme.
- **Relative clauses** → post-nominal `-pe` participle for subject relatives
  (`negalaka tolonape` "the country that helps"); resumptive juxtaposition for
  object relatives. No new morpheme.
- **Modality** → serial modal + main verb (`bekito bacato honka` "should read
  books"); minted **`beki` "should"** for the weak-vs-strong (`lasima`) split.
- **Quotative / embedded "that"** → minted closed-class **`ce`**
  (`mi tauto ce te datanto li` "I know that he came"); supersedes the 0008 §2
  deferral. Direct-quote juxtaposition still available.
- **Parser limit** (role marker after a post-nominal `-pe`) → fixed (S4/S7);
  `negalaka toipe fe` now validates.

Exercised end-to-end in article 0015 (the 0012 regression piece). Remaining open
items are now **vocabulary only** (foreign, trapped, firefighter, capital,
investigate, spread, survive; other/another, several, still) — no open grammar.

## Vocabulary completion + a tech article (0016)

The high-frequency function words and most disaster nouns are now **minted/handled**:

- **`other` / `another`** → `hoka` (Japonic), a postposed determiner (`hitoka hoka`).
- **`still` / `yet`** → `masi` (Indonesian *masih*), a time-adverb (`… ne datan masi`
  "not yet"). `several` was **folded** into `badi` "some" / `kidogo` "a few" (no mint).
- **`foreign`** → `asin`; **`investigate`** → `silabe`; **`spread`** → `enea`;
  **`survive`** → `okoka` (all minted, donor-balanced).
- **`capital`** → compound `mukukotaka` ("chief-city", COMP-035).
- **`firefighter`** → now a clean `-pe` relative (`hitoka motoka lagape` "people who
  fight the fire") thanks to 0012 — no root needed.
- **`trapped`** → still paraphrased ("could not escape"); the only disaster gap left.

**Technology** (article 0016): the domain is already well-stocked — `dewa` phone,
`konpu` computer, `intaneto` internet, `kikai` machine, `loboto` robot, `gulamu`
program, `dato` data, `leti` network, `apuli` app, `pantala` screen, `kaisa`
company, `inteliyena` intelligence/AI. Paraphrased: **`smart`** = `inteliyenape`
("intelligent"), **`protect`** = `salamata` (safe+causative), **`fake`** =
`salape` ("wrong"), **`useful`** = `pakaipe` (use+`-pe`). No new tech roots needed
for this piece; a dedicated "AI"/"smart"/"online" set could come later.

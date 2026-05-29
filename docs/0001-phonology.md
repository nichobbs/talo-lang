# Talo — Phase 1: Phonology & Orthography

**Status:** Decided. Resolves open decision **O-1** (§9 of `0000`). High cost to
change — this is the most downstream-expensive decision in the project (it gates
every lexicon entry via the linter, §5/§4 of `0000`). Reversals are recorded
here and in `0000`, not made silently.

**Parent:** `docs/0000-design-principles.md` §2 (the phonology/orthography
locks). This ADR *fills in* the four `TODO`s left there — exact inventory,
phonotactic grammar, grapheme set, fixed-stress rule — and adds the allophonic
tolerance contract §2 promised.

**Format:** ADR-style, as in `0000`. Each choice states the decision, the
rationale, the alternative rejected, and the cost knowingly accepted.

-----

## 0. What this resolves, and the constraints it inherits

`0000` §2 already **decided** (and this ADR does not reopen):

- no lexical tone;
- a **no-hard-fails** inventory chasing **intelligibility-under-variation, not
  phoneme-level familiarity**;
- explicit avoidance of known high-failure contrasts — **/r/–/l/, dental
  fricatives, front rounded vowels**;
- **CV-heavy** phonotactics, minimal/no clusters;
- **no phonemic stress or length**;
- **one-to-one** grapheme↔phoneme orthography;
- **Latin, ASCII-typeable, no diacritics**.

Everything below is the concrete instantiation, chosen against the §0 tie-break
rules. The recurring move is tie-break rule **2** (when familiarity is
impossible, choose graceful degradation over enforcement): we pick segments and
shapes whose *sloppy* realisation still lands intelligibly, and we state the
tolerance as a contract (§3) rather than pretend speakers will hit point
targets.

-----

## 1. Vowel inventory — five: `a e i o u`

**Decision.** Exactly five vowel qualities, `/a e i o u/`. No length, no
diphthong phonemes, no nasal vowels.

**Rationale.** The five-vowel triangle is the single most common vowel system on
Earth (~⅓ of languages) and is present in, or trivially approximable by, every
one of the largest L1 blocs — Spanish, Japanese, Swahili, Hindi, Indonesian, and
the core of Mandarin. Five maximally-spaced qualities are the most robust choice
under variation: even a badly-centralised production stays inside its own
perceptual cell because the cells are far apart (§3). It contains **no
front-rounded vowel** (banned, §2) and **no mid-low height contrast** (`e` vs
`ɛ`, `o` vs `ɔ`) — a contrast many L1s neutralise and which would be a latent
hard-fail.

**Alternatives rejected.**
- **3 vowels (`a i u`).** Maximally robust, but shrinks the syllable inventory
  so hard that roots get longer and homophony/collision pressure rises. Open
  syllables (§5) already buy most of the robustness; we don't need to pay the
  distinctiveness cost on top.
- **7 vowels (adds `ɛ ɔ`).** Reintroduces exactly the height contrasts §2 tells
  us to avoid.

-----

## 2. Consonant inventory — fifteen

| Manner | Voiceless / fortis | Voiced / lenis | Grapheme(s) | Phoneme(s) |
|--------|--------------------|----------------|-------------|------------|
| Stop | `p` `t` `k` | `b` `d` `g` | p t k b d g | /p t k/, /b d g/ |
| Affricate | `c` | — | c | /tʃ/ |
| Fricative | `f` `s` `h` | — | f s h | /f s h/ |
| Nasal | — | `m` `n` | m n | /m n/ |
| Liquid | — | `l` | l | one liquid (target [l]) |
| Glide | — | `w` `y` | w y | /w/, /j/ |

Fifteen consonants. Each design choice and its accepted cost:

### 2.1 Stops carry a two-way contrast, defined by cue-tolerance not by voicing
The contrast `p t k` vs `b d g` is **not** defined as "voiced vs voiceless." It
is an abstract fortis/lenis opposition realised by **either** cue (see §3): a
voicing-language speaker (Romance/Germanic) and an aspiration-language speaker
(Mandarin, Korean) can both produce a contrast that maps onto the same two Talo
series without retraining their articulation.

> **Cost accepted, recorded explicitly:** the plain voiceless-unaspirated [p]
> sits in the overlap zone and can be heard as either series, so this is the
> *weakest* contrast in the inventory. We do **not** pay for that here — we pay
> in the lexicon: the §4 collision checker **must** treat `b/p`, `d/t`, `g/k` as
> near-homophones and forbid root pairs that distinguish meaning by this
> contrast alone. That keeps a misproduction sub-lexical (an accent, not a
> different word) — the §2 goal. (Tie-break rule 2.)

### 2.2 One affricate, `c` = /tʃ/
Present across a very wide range of L1s (English, Spanish `ch`, Hindi, Mandarin
[tɕ], Swahili) and rarely a hard fail; high value for internationalisms
(*chai*, *choko-*). Spelled with the single letter `c` so the orthography stays
one-to-one (no `ch` digraph). The fricative `/ʃ/` was **rejected**: `ʃ`–`s` and
`ʃ`–`tʃ` are confusable for several large L1s (Spanish has no `/ʃ/`), two new
failure surfaces for modest gain.

### 2.3 Fricatives `f s h`, no voicing contrast
Voiceless only. `/f/` is broadly present or approximable; `/h/` is low-cost and
near-universal; `/s/` is near-universal. Voiced `/v z/` were **rejected**:
`v`–`w`–`b` and `z`–`s` are classic high-failure overlaps, voiced fricatives are
absent from several large L1s, and they invite final-devoicing trouble.

### 2.4 Exactly one liquid, `l`
The §2 ban on the `/r/`–`/l/` contrast means Talo gets **one** liquid phoneme,
not two. It is written `l` and its target is the lateral [l] (one of the most
cross-linguistically stable and easily-targeted consonants), but its tolerance
band is wide (§3): [l ~ ɾ ~ ɽ ~ r] all count as the same phoneme.

> **Cost accepted, recorded explicitly:** because the liquid is *spelled* `l`,
> there is **no grapheme `r`** in Talo. A speaker whose L1 leans on `r`
> orthographically cannot write the sound with `r`; they write `l` and may
> pronounce it [ɾ]/[r]. We accept a small orthographic unfamiliarity to keep the
> inventory one-liquid and one-to-one. (Tie-break rules 2, and one-to-one §2.)

### 2.5 Two glides, `w` `y`
`/w/` (`w`) and `/j/` (`y`). Both near-universal and low-fail. The grapheme
choice `y` for `/j/` is justified in §4.

### 2.6 Nasals `m n` (and the coda nasal)
Two nasal phonemes in onset position. In **coda** position only `n` is written,
and it stands for a place-tolerant nasal that assimilates to a following stop
(§3, §5). The velar nasal [ŋ] is therefore **never an independent grapheme** (it
only ever surfaces as an allophone of coda `n` before `k`/`g`), which keeps the
alphabet diacritic-free and one-to-one.

-----

## 3. Allophonic tolerance ranges (the intelligibility contract)

`0000` §2 promised "tolerance ranges, not point targets." This section is that
contract, and it is **normative**: a production counts as intelligible Talo iff
every segment falls within its range below. The ranges are drawn so that **no
two phonemes' ranges overlap** — sloppy production degrades *within* a cell, it
does not collapse a contrast.

**Vowels** (target → tolerated):
| Phoneme | Target | Tolerated band |
|---|---|---|
| `a` | [a] | [a ~ ä ~ ɑ ~ ʌ] |
| `e` | [e] | [e ~ ɛ] |
| `i` | [i] | [i ~ ɪ] |
| `o` | [o] | [o ~ ɔ] |
| `u` | [u] | [u ~ ʊ ~ ɯ] |

**Consonants:**
| Phoneme | Target | Tolerated band |
|---|---|---|
| `p t k` | [p t k] | [p t k] ~ [pʰ tʰ kʰ] |
| `b d g` | [b d g] | [b d g] ~ [p t k] (plain, unaspirated) |
| `c` | [tʃ] | [tʃ ~ tɕ ~ ts] |
| `f` | [f] | [f ~ ɸ] |
| `s` | [s] | [s ~ s̪ ~ ɕ] |
| `h` | [h] | [h ~ ɦ ~ x] |
| `m` | [m] | [m] |
| `n` (onset) | [n] | [n ~ ɲ] (palatalised before `i`) |
| `n` (coda) | [n] | [n ~ m ~ ŋ] by place assimilation to the following stop |
| `l` | [l] | [l ~ ɾ ~ ɽ ~ r] |
| `w` | [w] | [w ~ ʋ ~ β̞] |
| `y` | [j] | [j ~ ʝ] |

**Out-of-band substitutions** (e.g. `f`→[p], `h`→∅) are "accented but
recoverable" and remain legal *speech* so long as they do not collapse a
contrast a minimal pair relies on — which §4's collision checker guarantees they
cannot, by refusing to mint such minimal pairs in the first place. Tolerance is
thus enforced **at lexicon-design time**, not demanded of the speaker.

-----

## 4. Grapheme set & orthography

**Alphabet (20 letters), one grapheme ↔ one phoneme, both directions:**

```
a b c d e f g h i k l m n o p s t u w y
```

`c` = /tʃ/, `y` = /j/; the other eighteen letters take their plain values from
§§1–2.

**Letters NOT used (illegal in any Talo word):** `j q r v x z`.

- `r` — the liquid is `l` (§2.4); `r` would be a second liquid grapheme, banned.
- `v z` — no voiced fricatives (§2.3).
- `j` — the glide is `y` (below); `j` is left **unassigned and reserved** (a
  later phase could give it `/dʒ/` if ever justified — out of scope here).
- `q x` — no phoneme needs them; reserved/illegal.

**Why `y` and not `j` for /j/.** Both are common conventions. `y`-as-consonant
matches English and Spanish — two of the largest transfer blocs — whereas
English and Spanish readers see `j` as /dʒ/ or /x/, a predictable misread.
Because the vowels are strictly `a e i o u`, `y` is *never* a vowel in Talo, so
using it for the consonant /j/ stays unambiguous and one-to-one. (Tie-break rule
1: transfer beats internal/IPA elegance.)

> **Cost accepted:** `y = /j/` will mildly surprise readers from `j`-as-/j/
> orthographies (German, Dutch, Slavic, Esperanto). Judged smaller than the
> English+Spanish misread of `j`.

**No diacritics, no digraphs, no case rules.** Every phoneme is one ASCII
letter. Talo text is canonically lowercase; capitalisation, if used, is purely
visual convention and carries no phonemic load (consistent with one-to-one).

-----

## 5. Phonotactic grammar (the normative spec for the linter)

### 5.1 Syllable template
```
syllable = Onset? Nucleus Coda?
Onset    = any one consonant
Nucleus  = any one vowel
Coda     = 'n'      (only word-finally, or before a stop/affricate — see R4/R5)
```
A word is one or more syllables. The onset is optional, so **vowel-initial words
are legal** (e.g. `eko`, `ato`). Minimum word size is **one syllable**; the
shortest possible legal words are a bare vowel (`a`) or `Vn`/`CV`.

### 5.2 Syllabification is automatic (maximal onset)
The learner never decides syllable boundaries. A single consonant between vowels
attaches to the **following** vowel:
- `tana` → `ta.na` — the `n` is the onset of `na`, **not** a coda.
- `tanta` → `tan.ta` — `nt` is not a legal onset (no clusters), so `n` is forced
  to close the first syllable: that is a coda.
- `tan` → `ta.n` — word-final `n` is a coda.

A coda `n` therefore only ever *materialises* word-finally or immediately before
another consonant.

### 5.3 The normative rules (R1–R6)
The linter (`tools/phonotactic-linter/`) enforces exactly these, reports the
first one violated, and is the single source of truth for "is this legal Talo."

- **R1 — Alphabet.** Every character is one of `a e i o u p t k b d g c f s h m n
  l w y`. Anything else (incl. `j q r v x z`, uppercase, spaces, digits) fails.
- **R2 — Nucleus.** The word contains at least one vowel.
- **R3 — Onset cluster.** A word may not begin with two or more consonants
  (≤ 1 initial consonant — the optional onset).
- **R4 — Medial juncture.** Between two vowels there may be at most two
  consonants; if there are two, the first must be `n` and the second must be a
  stop or the affricate (`p t k b d g c`). Three or more, or any other
  two-consonant pair, is an illegal cluster. *(This is the only consonant
  cluster Talo permits.)*
- **R5 — Coda.** A word may not end in a consonant other than `n`, and may not
  end in two or more consonants.
- **R6 — No doubled vowels.** No two identical vowels may be adjacent (`aa`,
  `ee`, … are illegal — they would read as length, banned by §2). Unlike-vowel
  sequences (`ai`, `oa`, `eu`) are legal hiatus across syllables.

### 5.4 Worked examples
**Legal:** `talo`, `tana`, `tanta`, `tan`, `sanpa` ([ˈsampa]), `sanka`
([ˈsaŋka]), `eko`, `ato`, `a`, `kaito` (`ka.i.to`), `wun`, `cone` (`co.ne`).

**Illegal:**
| word | rule | why |
|---|---|---|
| `tar` | R1 | `r` is not in the alphabet |
| `bjok` | R1 | `j` is not in the alphabet |
| `pkt` | R2 | no vowel |
| `npa` | R3 | begins with cluster `np` |
| `sanfa` | R4 | coda `n` before `f` (only stops/affricate allowed) |
| `sanma` | R4 | coda `n` before nasal `m` |
| `aspa` | R4 | medial cluster `sp` (first consonant isn't `n`) |
| `tat` | R5 | ends in `t` (only `n` may be a coda) |
| `tant` | R5 | ends in cluster `nt` |
| `taa` | R6 | doubled vowel `aa` |

-----

## 6. Stress rule — fixed initial, advisory, unmarked

**Decision.** Primary stress falls on the **first syllable** of every word. It
is **not** written, and it is **not** enforced by the linter.

**Rationale.** §2 makes stress non-contrastive, which has a sharp consequence:
misplaced stress *cannot* produce a different word (there is nothing for it to
collide with), so wrong stress never blocks understanding — it is pure
convention/euphony. Given that, the rule is chosen for *teachability and
stability*, not for disambiguation:

- **Easiest possible rule** for the primary persona: "always hit the first
  beat." Zero judgement (tie-break rule 3).
- **Root-stable under derivation.** Talo is heavily suffixing (POS markers
  §3.3, additive derivation §3.4). Under *penultimate* stress the stressed
  syllable would shift every time a suffix is added (`tálo` → `taló-…`); under
  **initial** stress it stays nailed to the root's first syllable however much
  is bolted on, so the root keeps a stable acoustic shape through derivation.
  (Tie-break rules 4 transparency, 5 additive derivation.)

**Alternatives rejected.** *Penultimate* — common and predictable, but shifts
under suffixation (above). *No stress / even weight* — real speakers impose some
prominence anyway; better to specify a tolerant default than to claim none.

**Tolerance.** Because stress is non-contrastive, any stress placement is
*intelligible*; initial is the taught norm, not a legality condition. The linter
neither reads nor checks stress (nothing marks it — consistent with
ASCII/no-diacritics).

-----

## 7. Costs knowingly accepted (consolidated)

1. **Weak stop contrast.** `b/p`, `d/t`, `g/k` overlap in the unaspirated zone;
   pushed onto the §4 collision checker as a near-homophone constraint (§2.1).
2. **No grapheme `r`.** One liquid, spelled `l`; `r`-orthography L1s lose the
   familiar letter (§2.4).
3. **`y = /j/` surprises `j`-as-/j/ readers** (§4) — judged the smaller misread.
4. **Restrictive coda** (`n` + stop/affricate only) costs some lexical room
   versus a permissive coda, bought for maximum juncture familiarity (§5/R4).
5. **No voiced fricatives, no `/ʃ/`** — fewer distinctions, lower failure
   surface (§§2.2–2.3).

-----

## 8. Interfaces to later phases

- **Linter (this phase, §5/§3 of `0000`).** `tools/phonotactic-linter/`
  implements R1–R6 exactly and is the gate for every lexicon entry (Phase 3).
- **Collision checker (Phase 3/§4).** Must additionally treat `b/p`, `d/t`,
  `g/k` as near-homophones (§2.1) and screen accidental cross-language
  obscenities. The phonotactic linter is necessary but not sufficient for a
  lexicon entry; the collision checker is the second gate.
- **Morphology (Phase 2).** POS suffixes (O-2), derivation (O-3), role markers
  (O-4) and particles (O-5) must themselves be phonotactically legal Talo and
  pass the linter; the coda/cluster rules (R4) constrain how suffixes attach at
  morpheme boundaries.

-----

## Appendix A — Quick reference

```
Vowels (5):       a e i o u                      (no length, no doubles)
Consonants (15):  p t k  b d g  c  f s h  m n  l  w y
Alphabet (20):    a b c d e f g h i k l m n o p s t u w y
Illegal letters:  j q r v x z
Syllable:         (C)V(N)      coda = n only, before stop/affricate or word-final
Only cluster:     n + {p t k b d g c}
Vowels adjacent:  unlike yes (ai), identical no (aa)
Min word:         1 syllable, onset optional (vowel-initial OK)
Stress:           fixed initial — advisory, unmarked, not linted
```

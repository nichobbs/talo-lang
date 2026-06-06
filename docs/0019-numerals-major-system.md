# Talo — 0019: numerals re-aligned to the Major-System mnemonic

**Status:** Accepted (maintainer decision, this session). A review of the digit
forms 1–9 (prompted by the irregular blend `pikae` and the near-homophone pair
`haba`/`huba`) settled on aligning the whole digit set to the **Major System**,
the standard phonetic number-mnemonic. Six of the ten digit forms are re-minted;
the system (consonant = digit) is now principled rather than ad-hoc.

**Parent:** `docs/0003` §5 (numeral system — base-10, compositional), `docs/0001`
(phonotactics; the missing rhotic), `docs/0011` (form-retirement governance).
**Supersedes:** the digit *forms* 2, 4, 6, 7, 8, 9 of `docs/0003` §5. The numeral
*system* (base-10, powers-of-ten roots, compositional construction) is unchanged.

-----

## 1. The problem with the old set

The pre-0019 digits were `so ta ki mo fu le pikae haba cewa huba diko`. Two
flaws:

1. **Split-brained.** 0–5 and 10 were systematically coined CV monosyllables;
   6–9 were international blends. Numbers carry essentially **no positive
   transfer** (no donor digit-set is globally shared), so the blends bought
   nothing — they just broke the pattern and added length (`pikae` = 2 vowels).
2. **A near-homophone in the worst place.** Under the `0001` §2.1 collision
   collapse (b/p · d/t · g/k), `haba`→`hapa` and `huba`→`hupa` differ only in the
   medial vowel — 7 and 9 were a near-minimal pair, exactly the confusion a
   numeral set must not have.

## 2. The decision: onset = Major-System consonant

The **Major System** maps each digit to a consonant *sound*; vowels are free
filler. Talo adopts it as the principled basis for the digit forms — the **onset
consonant carries the digit**, the vowel is chosen only for a legal, distinct
syllable:

| Digit | Major sound | Talo | | Digit | Major sound | Talo |
|---|---|---|---|---|---|---|
| 0 | s / z | **so** | | 5 | l | **le** |
| 1 | t / d | **ta** | | 6 | ch / sh / j | **co** |
| 2 | n | **nu** | | 7 | k / g | **ki** |
| 3 | m | **mo** | | 8 | f / v | **fa** |
| 4 | r | **hu** *(exception)* | | 9 | p / b | **po** |

Powers of ten are unchanged: **`diko`** 10, **`samu`** 100, **`sebu`** 1000,
**`milion`** 10⁶.

**Why this fits Talo unusually well.** The Major System groups voiced + unvoiced
as one digit (t/d→1, k/g→7, p/b→9, s/z→0, f/v→8). Talo's collision rule *already*
collapses **b/p · d/t · g/k** as near-homophones (`0001` §2.1) — so the two
systems agree exactly, and a number-word stays unambiguous even if a stop is
voiced. The alignment is not forced; the phonologies genuinely coincide.

**The one exception — digit 4.** The Major System's 4 is **/r/**, the single
sound Talo lacks (no rhotic; the usual `r→l` adaptation is blocked because `l` is
already 5). 4 therefore takes **`hu`** — `h` is one of the Major System's own
"free" filler consonants (it carries no digit), so there is zero ambiguity; it is
simply the documented exception.

**Distinctness.** All ten digit skeletons are now distinct; the only shared rime
(`-o` on `so · mo · co · po`) falls on the four most acoustically distinct onsets
(s / m / affricate / p), spaced across the set, and the weak `h`-onset (4) was
deliberately kept off `-o` (`hu`, not `ho`).

## 3. Cost

- **Six forms re-minted** (2 `ki`→`nu`, 4 `fu`→`hu`, 6 `pikae`→`co`, 7 `haba`→
  `ki`, 8 `cewa`→`fa`, 9 `huba`→`po`); four kept (`so ta mo le`). All recorded in
  `data/deprecations.tsv` (`0011` governance).
- **`ki` is reused** — freed from 2, reassigned to 7 (Major 7 = k). The teaching
  examples that used `ki` = "2" were all migrated to `nu`; the trade-off (a missed
  one is a silent 2→7 rather than a caught error) was accepted by the maintainer
  over introducing a co/ko rhyme at 6/7.
- **Cascades** (all updated in lock-step): the parser's `FUNCTION_WORDS.other` +
  `NUMERAL_MORPHS`; the generated `derived-lexicon.tsv` (ordinals), `compounds.tsv`
  (weekday/month — e.g. Monday `nudinka`, Friday `codinka`, December
  `dikonulunka`), `dictionary.json`, and the SRS deck; corpus articles, the book,
  and the example numerals across `docs/0004–0018`.
- **No change** to the numeral *system* (base-10, compositional), the powers-of-
  ten roots, or the frozen particle inventory.

## 4. Change set

`data/lexicon.tsv` (6 forms + Major-System rationale on all 11 numeral rows),
`data/deprecations.tsv` (6 retirements), `tools/parser/src/morphology.ts`
(numeral list + `NUMERAL_MORPHS`), regenerated derived layers/dictionary/SRS,
corpus + book + docs example migration, and a parser test locking the new fused
numerals. Verified: parser tests pass, collision checker over the live lexicon
exit 0, generated artifacts in sync.

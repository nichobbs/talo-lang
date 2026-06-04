# Talo morphological linter

The complement to the [phonotactic linter](../phonotactic-linter): where that asks
*"is this whole word a legal Talo string?"*, this asks the word-**internal**
question `docs/0002` §3.1/§3.2 leaves to tooling — *"do the morphemes join legally,
and does the buffer-vowel rule fire exactly where it must?"* It is the executable
form of the compounding **seam** rule, and the fifth gate after the linter,
collision checker, parser, and corpus check.

A word is `ROOT (+ ROOT)* (+ AFFIX)* + BADGE`, written in the data as a
`morphemes` column joined by `+` (`pani+kama+ka` bathroom, `ta+pe` first,
`kelua+ta+to` evacuate). Given that decomposition the linter:

- checks each piece is a Talo-letter string and the last is a badge (`-ka`/`-to`/`-pe`);
- **joins** the pieces applying the §3.1 buffer rule — insert `a` only at an
  `n`-final piece meeting a non-stop onset (the one seam Talo would reject) — and
  returns the surface form;
- confirms that form is phonotactically legal (delegating R1–R6 to the linter).

`checkRow` additionally asserts the stated surface form **equals** the
reconstruction, so the data gate catches any generated row whose `form` and
`morphemes` disagree (a buffer slip or a hand-edit).

## Use

```sh
# lint a decomposition; prints the form it should produce
node --experimental-strip-types src/cli.ts "din+moto+ka"     # → dinamotoka (buffer)

# gate the generated layers: every compounds.tsv + derived-lexicon.tsv row's
# `morphemes` must join legally to its `form`
npm run check        # node ... src/cli.ts --data

# tests
npm test
```

Exit `0` iff everything is well-formed; `1` otherwise — composes in CI like the
other gates. Requires Node ≥ 22.6 (`--experimental-strip-types`), zero dependencies.

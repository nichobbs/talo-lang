# Teach Yourself Talo — the book

A complete "Teach Yourself"-style course in Talo: ten short chapters of dialogue,
grammar, vocabulary and exercises, plus a one-page grammar reference and an answer
key. Source is Markdown under [`chapters/`](chapters/); the build renders it to a
single self-contained HTML file and, optionally, a PDF.

**Every Talo example in the book is validated by the parser at build time**, so the
course can never teach an ungrammatical sentence. Examples marked with a leading
`*` (shown as ★ in the prose) are deliberately *wrong* and are asserted to fail.

## Build

```sh
cd book

# render chapters/*.md → build/talo-book.html (and validate every example)
npm run build

# just validate the Talo examples, produce no output (used in CI)
npm run check
```

Both are zero-dependency: Node ≥ 22.6, `--experimental-strip-types`, no install.
The build prints how many examples it validated and exits non-zero if any example
fails to validate as intended — so it is a content gate, not just a renderer.

## PDF

The HTML is print-ready (it has `@media print` styles, with each chapter starting
on a new page). To produce a PDF, render that HTML with any HTML→PDF tool. Two
common choices (either is fine; neither is committed as a dependency):

```sh
# WeasyPrint (pip install weasyprint)
npm run build
weasyprint build/talo-book.html build/talo-book.pdf

# or headless Chromium
npm run build
chromium --headless --print-to-pdf=build/talo-book.pdf build/talo-book.html
```

## Publishing to GitHub Pages

`build/talo-book.html` is a single standalone file (CSS inlined). To publish it as
a web page, copy it into the Pages site as `index.html` (or link to it). The
forthcoming site build (`web/`) wires the book HTML and the word-lookup tool
together under one GitHub Pages site.

## Structure

| file | chapter |
|---|---|
| `00-front.md` | front matter |
| `01-sounds.md` | the sounds and letters |
| `02-words.md` | words and the three badges |
| `03-being.md` | pronouns and "to be" |
| `04-sentences.md` | subject-first, objects, role markers |
| `05-questions.md` | questions and negation |
| `06-time.md` | time, aspect, plural |
| `07-building-words.md` | derivation and compounds |
| `08-correlatives.md` | the question-and-answer grid |
| `09-if-and-there-is.md` | conditionals and existence |
| `10-everyday.md` | phrasebook |
| `90-reference.md` | one-page grammar reference |
| `91-answers.md` | answer key |

Chapters are concatenated in filename order; the front-matter `# H1` of each
becomes a table-of-contents entry.

## Authoring notes

Talo examples go in fenced ` ```talo ` blocks. Inside such a block:

- `# ...` — a comment / label (not validated);
- `Talo clause   › English` — the clause before the `›` (or `—`, or two-plus
  spaces) is validated; the rest is a gloss;
- `* Talo clause   › ...` — a deliberately ungrammatical example, asserted to
  **fail** validation.

Use only attested lexicon roots (see [`../data/lexicon.tsv`](../data/lexicon.tsv))
and the grammar of [`docs/0002`](../docs/0002-morphology-grammar.md) /
[`docs/0005`](../docs/0005-grammar-completeness.md).

# Talo website

The public Talo site: a landing page, the rendered **Teach Yourself Talo** book,
and a client-side **word-lookup** tool over the generated dictionary. It builds to
`web/dist/` and is published to GitHub Pages by `.github/workflows/pages.yml`.

## Build

```sh
cd web
npm run build     # assemble web/dist/ (rebuilds the book, copies the dictionary)
npm run check     # verify all inputs are present, no output
```

The build is dependency-free (Node ≥ 22.6). It:

1. reads the generated `dictionary/dist/dictionary.json` (run the dictionary build
   first if it is stale: `cd dictionary && npm run build`);
2. builds the book (which validates every Talo example through the parser);
3. copies `web/src/*` + the dictionary JSON + the wrapped book into `web/dist/`.

`web/dist/` is git-ignored; the GitHub Pages workflow regenerates it on every push
to `main` that touches `web/`, `book/`, `dictionary/` or `data/`.

## Pages

- `src/index.html` — landing page
- `src/lookup.html` + `src/app.js` — the word-lookup tool (loads `dictionary.json`,
  searches Talo↔English in memory, filters by domain/tier; supports `?q=` deep links)
- `src/style.css` — shared styles
- `book.html` — the book, wrapped in the site shell (generated)

## Enabling GitHub Pages

In the repository settings, set **Pages → Source → GitHub Actions**. The
`pages.yml` workflow then publishes `web/dist/` on each push to `main`.

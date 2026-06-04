# talo-derivation-explorer

The dictionary's **cross-reference layer** as a library + CLI. Given any Talo
form it surfaces the four relations the web lookup shows (docs/0007):

- the source **root** of a derived/compound surface word;
- its **word family** — the non-trivial derivations (root+affix+badge) and
  compounds, with the predictable bare-badge forms dropped;
- the words it could be **confused with by ear** — other roots sharing its
  merge-skeleton (near-homophones under the b/p·d/t·g/k collapse, same rule as
  `tools/collision-checker`);
- the words it could be **confused with on the page** — citation-form
  coincidences, since a content root never surfaces bare: if a headword spells
  another content root **+ a badge** it `reads in text as` that (e.g. `kunato`
  reads as `kuna`(exist)+V — the `kunato`(lock) root itself only appears as
  `kunatoto`/`kunatoka`/…), and a content root reports which of its own badge
  forms are `spelled like` another root (`kan`(see) → `kanto` is also "office",
  `kanka` also "crab");
- any cross-language **false friend** warning.

It reads the already-enriched `dictionary/dist/dictionary.json` (built by
`dictionary/src/build.ts`), so examples and false-friend notes come along for
free and the index-building mirrors `web/src/app.js` exactly — the CLI and the
site always agree.

## Use

```
# build the dictionary data first if it is stale
node --experimental-strip-types dictionary/src/build.ts

node --experimental-strip-types tools/derivation-explorer/src/cli.ts bukama buta saya
```

```
bukama  /ˈbu.ka.ma/  — earthquake  [root]
  examples:
    bukamaka tuyoipe tatakuto Yapanka yana  › A strong earthquake struck Japan yesterday.
  family (3):
    bukamacika — little 'earthquake'; small/dear 'earthquake'
    bukamagoka — big 'earthquake'; great 'earthquake'
    bukamadeka — place of/for 'earthquake'

buta  /ˈbu.ta/  — pig  [root]
  family (3): …
  false friend: Japanese/Indonesian: pig / blind
```

Exit `2` on usage error or missing data, `1` if any queried form is unknown,
`0` otherwise.

## Test

```
npm test     # node --experimental-strip-types --test test/explorer.test.ts
```

Zero dependencies; Node ≥ 22.6 (uses `--experimental-strip-types`).

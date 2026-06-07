# Three small things (a poem)

- **Register:** verse / poetry — the corpus's first deliberately *expressive* text.
- **Source:** original poem, written first in English, then translated.
- **What it tests (qualitative, not gap-finding):** whether Talo can carry
  **metaphor and figurative language** — "the moon is a white stone", "the human
  heart is a little water", "we are small boats" — plus **personification**
  (the sea remembers, the mountain forgets), **parallelism/repetition**, and
  compression into short lines while every line stays grammatically valid.
- **Gaps found:** none. The imagery lexicon was already there — `bulan` moon,
  `batu` stone, `puti`/`hita` white/black, `umi` sea, `yama` mountain, `moyo` heart,
  `fune` boat, `coda` release/let-go, `hako` "nothing". A pure aesthetics test, no
  new roots.

## English

**i. The moon**
The moon is a white stone in the black sky.
It sees everything, and says nothing.
At night I look up at the sky, and I miss you;
maybe you see the same moon, in some far place.

**ii. Memory**
The sea remembers every river.
The mountain forgets nothing.
But the human heart is a little water:
it holds a little, then it lets go.

**iii. Time**
Time is a slow river.
We are small boats.
The water carries us to the sea,
and the sea does not give us back.

## Talo

```talo
# --- i. the moon (metaphor: moon = white stone; hako "nothing") ---
Bulanka yato batuka putipe, naka solaka hitape.   › The moon is a white stone in the black sky.
# gloss: moon-N COP stone-N white-MOD, in sky-N black-MOD
Te kanto ote, i semato hako.                      › It sees everything, and says nothing.
# gloss: it see-V all, and say-V nothing
Naka usikuka, mi kanto solaka su, i mi linduto yu. › At night I look up at the sky, and I miss you;
# gloss: in night-N, I see-V sky-N toward, and I miss-V you
mungi yu kanto bulanka samape, naka lokaka toipe. › maybe you see the same moon, in some far place.
# gloss: maybe you see-V moon-N same-MOD, in place-N far-MOD

# --- ii. memory (personification; coda "let go") ---
Umika ingato kawaka kila.                         › The sea remembers every river.
# gloss: sea-N remember-V river-N every
Yamaka lupato hako.                               › The mountain forgets nothing.
# gloss: mountain-N forget-V nothing
Ma moyoka hitope yato panika pikope:              › But the human heart is a little water:
# gloss: but heart-N human-MOD COP water-N small-MOD
te peganto kidogo, toki te codato.                › it holds a little, then it lets go.
# gloss: it hold-V a-little, then it release-V

# --- iii. time (metaphor: time = river, we = boats) ---
Wakatika yato kawaka osoipe.                       › Time is a slow river.
# gloss: time-N COP river-N slow-MOD
Mi pu yato funeka pikope.                          › We are small boats.
# gloss: we PL COP boat-N small-MOD
Panika bebato mi pu umika su.                      › The water carries us to the sea,
# gloss: water-N carry-V we PL sea-N toward
i umika ne ludiato mi pu.                          › and the sea does not give us back.
# gloss: and sea-N NEG return-V we PL
```

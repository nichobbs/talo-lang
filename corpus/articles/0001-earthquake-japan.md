# Earthquake in Japan

- **Register:** hard news (disaster)
- **Source:** original simplified item, BBC-style (not a verbatim reproduction)
- **Proper nouns:** `Yapan` (Japan) — see `../proper-nouns.tsv`

The Talo of each sentence is in the ```talo block: the clause first, then its
English on the right of `›`, with an interlinear gloss on the `#` line. Every
clause is validated through `tools/parser` by `npm run check`.

## English

A strong earthquake struck Japan yesterday. Many houses broke and many people
died. The government said help is coming now. People want water and food.

## Talo

```talo
# 1
bukamaka tuyoipe tatakuto Yapanka yana      › A strong earthquake struck Japan yesterday.
# gloss: earthquake-N strong-MOD strike-V Japan-N yesterday

# 2 — coordinated with i "and"; broke = intransitive peca, completive li
baitika ingi pecato li                       › Many houses broke,
# gloss: house-N many break-V COMPLETIVE
hitoka ingi matito li                        › and many people died.
# gloss: person-N many die-V COMPLETIVE

# 3 — reported speech as two juxtaposed clauses (no quotative yet; see ../GAPS.md)
seifuka semato li                            › The government said:
# gloss: government-N say-V COMPLETIVE
tolonaka datanto wi inino                     › help is coming now.
# gloss: help-N come-V PROGRESSIVE now

# 4 — two objects joined by i "and"
hitoka mauto panika i cakulaka               › People want water and food.
# gloss: person-N want-V water-N and food-N
```

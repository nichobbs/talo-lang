# A deadly fire in Delhi

- **Register:** hard news (disaster) — the largest corpus piece so far (27 clauses)
- **Source:** original factual summary of a real event (a New Delhi building fire,
  June 2026) written for this corpus — **not** a reproduction of any outlet's text.
- **Proper nouns:** `Deli` (Delhi) — `proper-nouns.tsv`.
- **Purpose:** a genuinely large translation to flush out missing areas. Fully
  valid Talo; the words/structures it had to paraphrase are in `corpus/GAPS.md`
  ("Large-article gaps").
- **New roots used:** `okoa` rescue, `soma` study.

## English

A big fire burned a tall building in Delhi. The fire began inside the building.
Then it grew fast and rose. Much smoke filled the building. The fire killed
twenty-one people. Some of the dead came from another country. Many people could
not escape, and the fire hurt many others. People came quickly and fought the
fire. They fought it for many hours. They rescued more than forty people and
carried the hurt to the hospital. A woman said: "I saw many people. I could not
find my child. Then a man helped me, and I ran outside." Officials do not yet know
the cause. Some people say the electricity caused the fire. The government will
study the building. The minister came to the place and said: this is a very sad
day. The country helps the families. Now many people fear the old buildings.

## Talo

```talo
# --- the fire ---
motoka gandepe yakuto tatemonoka takaipe Delika lo   › A big fire burned a tall building in Delhi.
# gloss: fire-N big-MOD burn-V building-N tall-MOD Delhi-N at
motoka mulaito tatemonoka naka                       › The fire began inside the building.
# gloss: fire-N begin-V building-N inside
toki motoka sodatuto hayaipe i naikito               › Then it grew fast and rose.
# gloss: then fire-N grow-V fast-MOD and rise-V
mosika ingi kunato tatemonoka naka                   › Much smoke was inside the building.
# gloss: smoke-N much exist-V building-N inside

# --- casualties (killed = matita, causative of die; "21" = ki diko ta) ---
motoka matitato hitoka ki diko ta                    › The fire killed twenty-one people.
# gloss: fire-N kill-V person-N two ten one
hitoka bala matito li                                › Some people died,
# gloss: person-N some die-V COMPLETIVE
sinuka bala datanto negalaka fe                      › and some of the dead came from another country.
# gloss: dead-N some come-V country-N from   (no "foreign"; see GAPS)
hitoka ingi ne kimiato                               › Many people could not escape.
# gloss: person-N many NEG escape-V
motoka sakito hitoka ingi ti                         › The fire also hurt many others.
# gloss: fire-N hurt-V person-N many also

# --- rescue (firefighter paraphrased: "people came and fought the fire") ---
hitoka datanto hayaipe i lagato motoka               › People came quickly and fought the fire.
# gloss: person-N come-V fast-MOD and fight-V fire-N
te lagato motoka yamuka ingi                         › They fought it for many hours.
# gloss: they fight-V fire-N hour-N many
te okoato hitoka fu diko lebi                        › They rescued more than forty people,
# gloss: they rescue-V person-N four ten more
te kiliato hitoka ugonape asipitalika su             › and carried the hurt to the hospital.
# gloss: they send-V person-N sick-MOD hospital-N toward

# --- a witness (reported speech by juxtaposition) ---
wanitaka semato li                                   › A woman said:
# gloss: woman-N say-V COMPLETIVE
mi kanto hitoka ingi                                 › I saw many people.
# gloss: I see-V person-N many
mi ne pataito mi we totoka                           › I could not find my child.
# gloss: I NEG find-V I GEN child-N
toki adamika tolonato mi                             › Then a man helped me,
# gloss: then man-N help-V me
mi hasiluto luaka                                    › and I ran outside.
# gloss: I run-V outside-N

# --- the cause ---
adikalika inino ne tauto                             › Officials do not yet know the cause.
# gloss: official-N now NEG know-V
hitoka bala semato li                                › Some people say:
# gloss: person-N some say-V COMPLETIVE
denkika hosito motoka                                › the electricity caused the fire.
# gloss: electricity-N cause-V fire-N
seifuka somato tatemonoka                            › The government will study the building.
# gloss: government-N study-V building-N

# --- aftermath ---
mentelika datanto lokaka su                          › The minister came to the place
# gloss: minister-N come-V place-N toward
te semato li                                         › and said:
# gloss: he say-V COMPLETIVE
ini yato dinka sedipe sana                           › this is a very sad day.
# gloss: this COP day-N sad-MOD very
negalaka tolonato familika pu                        › The country helps the families.
# gloss: country-N help-V family-N PL
inino hitoka ingi takuto tatemonoka tuape            › Now many people fear the old buildings.
# gloss: now person-N many fear-V building-N old-MOD
```

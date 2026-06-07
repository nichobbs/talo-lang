# An interview with a community gardener

- **Register:** interview / Q&A — sustained question-and-answer, turn by turn.
- **Source:** original, written as a normal interview and then translated.
- **What it stress-tests:** the **full question paradigm in place**, sustained —
  `seko` what, `seno` when, `sefu` **why** (the true interrogative, not `bafu`),
  `sela` who, `sewa` how, `semu` how-many — plus answers with ranges (`fe … su`),
  `salin` "each other", and negation.
- **Also in this PR — a correctness fix:** the earlier articles (0017, 0018) used
  `bafu` for "why?", but `bafu` is `ba-`(some)+`fu` = "for some reason"; the
  interrogative is `sefu`. Corrected all five occurrences.
- **Gaps found:** none — `nama` name, `sayu` vegetable, `tamatala` tomato, `mame`
  bean, `tetanga` neighbour, `asobu` play, `geni` stranger, `poside` own all
  existed. "Community garden" = `kebunka fe kelopoka`, "easy" would be `ne katai`.

## English

**Q:** What do you do?
**A:** I grow vegetables in a community garden.
**Q:** When did you start the garden?
**A:** I started it three years ago, with a few friends.
**Q:** Why did you begin?
**A:** Because there was no green space in our area, and the children had no place to play.
**Q:** How many people work here now?
**A:** About thirty — from young children to old people.
**Q:** What do you grow?
**A:** Many things — tomatoes, beans, and flowers.
**Q:** Who owns the land?
**A:** The city owns it, but it lets us use it, free of charge.
**Q:** How has the garden changed the area?
**A:** People know each other now. Before, they were strangers; now they are friends.
**Q:** What is hardest?
**A:** Water, in the summer. And there is never enough time.
**Q:** What do you hope for the future?
**A:** I hope more people will grow their own food. It is good for the body and the mind.

## Talo

```talo
# --- who and what (seko "what"; seno "when") ---
Yu tendato seko?                              › Q: What do you do?
# gloss: you do-V what
Mi tubuto sayuka naka kebunka fe kelopoka.     › A: I grow vegetables in a community garden.
# gloss: I grow-V vegetable-N in garden-N of group-N
Yu mulaito kebunka seno?                      › Q: When did you start the garden?
# gloss: you begin-V garden-N when
Mi mulaito te mo taunka mae, tomoka bala wa. › A: I started it three years ago, with a few friends.
# gloss: I begin-V it 3 year-N before, friend-N some with

# --- why (sefu = the true interrogative "why") ---
Yu mulaito sefu?                              › Q: Why did you begin?
# gloss: you begin-V why
Sababu kowenka hakuna naka lokaka mi pu, i totoka pu ne motuto lokaka fo asobuka. › A: Because there was no green space in our area, and the children had no place to play.
# gloss: because park-N none in place-N our, and child-N PL NEG have-V place-N for play-N

# --- how many (semu); range fe … su ---
Hitoka semu kasito inilo inino?              › Q: How many people work here now?
# gloss: person-N how-many work-V here now
Mungi mo diko — fe totoka mudape su hitoka tuape. › A: About thirty — from young children to old people.
# gloss: maybe 3 10 — from child-N young-MOD to person-N old-MOD

# --- what, again ---
Yu tubuto seko?                              › Q: What do you grow?
# gloss: you grow-V what
Monoka ingi — tamatala, mame, i hana.        › A: Many things — tomatoes, beans, and flowers.
# gloss: thing-N many — tomato-N, bean-N, and flower-N

# --- who (sela); owning, permission, free ---
Sela posideto tocika?                        › Q: Who owns the land?
# gloss: who own-V land-N
Kotaka posideto te, ma te isinito mi pu pakaito te, nedanka tanpa. › A: The city owns it, but it lets us use it, free of charge.
# gloss: city-N own-V it, but it allow-V we PL use-V it, price-N without

# --- how (sewa); each-other (salin) ---
Kebunka badilito lokaka sewa?                › Q: How has the garden changed the area?
# gloss: garden-N change-V place-N how
Hitoka tauto salin inino. Mae, te pu yato genika; inino, te pu yato tomoka. › A: People know each other now. Before, they were strangers; now they are friends.
# gloss: person-N know-V each-other now. before, they PL COP stranger-N; now, they PL COP friend-N

# --- the hardest; never (hano) ---
Seko kataipe lebi ote fe?                 › Q: What is hardest?
# gloss: what COP hard more all from
Panika, naka kisesuka panape. I wakatika hano yato cukupe. › A: Water, in the summer. And there is never enough time.
# gloss: water-N, in season-N hot-MOD. and time-N never COP enough-MOD

# --- hopes for the future ---
Yu tumainito seko fo banayaka?               › Q: What do you hope for the future?
# gloss: you hope-V what for future-N
Mi tumainito ce hitoka ingi lebi tubuto cakulaka te pu. › A: I hope more people will grow their own food.
# gloss: I hope-V that person-N many more grow-V food-N their PL
Ini yato haope fo kaladaka i akalika.        › It is good for the body and the mind.
# gloss: this COP good-MOD for body-N and mind-N
```

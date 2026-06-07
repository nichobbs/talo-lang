# Tech Firms Race to Build "Self-Repairing" Software as Outages Mount

- **Register:** hard news — technology / business.
- **Source:** agent-generated for this corpus, BBC-style; not from any outlet.
  Hosted verbatim with the translation.
- **Proper nouns:** generalized in the Talo (Dr Helena Marsh → *a researcher* /
  *a systems person* `hitoka kitonka fe`; the unnamed consultant likewise), per the
  corpus's generic convention.
- **Vocab:** entirely existing roots + paraphrase — **no new vocab.** software =
  `gulamu`, repair/self-heal = `malaito`, fault = `caca`, data network/service =
  `leti`, traffic = `kosu`, invest = `tosi`, control = `kendali`, compare =
  `komala`, replace = `kokana`, race/compete = `kosoi`. server → `konpu` (computer).
- **Known gaps (paraphrased):** outage (→ `gulamu gagae`), cascading, downtime
  (→ `wakatika henti`), regulator (→ `hitoka seliaka fe`), aviation (→ `wolaka`),
  confident (→ "believes it is correct"), round-the-clock engineering teams.

## English

Major technology companies are investing heavily in a new generation of software
that can detect and fix its own faults, following a series of high-profile outages
that have disrupted banks, airlines and hospitals over the past year.

The systems, known in the industry as "self-healing" software, use artificial
intelligence to monitor their own performance, identify problems and apply
corrections without human intervention. Supporters say the technology could prevent
the kind of cascading failures that have grounded flights and frozen payment systems
across the world.

"We are reaching a point where modern systems are simply too complex for engineers to
monitor manually," said Dr Helena Marsh, a researcher in distributed computing at a
London university. "A single application might depend on thousands of separate
services. When one fails at three in the morning, you want the system to respond
before anyone notices."

### How it works

The software continuously compares its behaviour against a model of how it should be
running. If it detects an unusual pattern — a server responding too slowly, or memory
filling up unexpectedly — it can restart components, reroute traffic or roll back
recent changes on its own.

Early trials have produced mixed results. One European bank reported that automated
recovery had reduced its system downtime by almost 70% over six months. However,
critics warn that handing control to automated systems carries its own risks.

"The danger is that the software makes a confident decision that turns out to be
wrong," said one cybersecurity consultant, who asked not to be named. "If it
misdiagnoses the problem, it can make a small fault much worse very quickly."

### Concerns over oversight

Regulators in several countries are now examining whether existing rules are
adequate. There are particular concerns about industries such as healthcare and
aviation, where an incorrect automated decision could put lives at risk.

Consumer groups have also questioned who would be held responsible when self-repairing
software causes harm. At present, the legal position remains unclear.

Despite the concerns, analysts expect investment in the technology to continue
growing. The global market for such tools is forecast to more than double within
three years, as companies seek to cut costs and reduce their reliance on
round-the-clock engineering teams.

For now, most firms insist that human engineers will remain firmly in control. "This
is about giving people better tools, not replacing them," said Dr Marsh. "But the
direction of travel is clear."

## Talo

```talo
# --- the race (kosoi "compete"; gulamu "software"; malaito "repair") ---
kaisaka kikaika fe kosoito fo tendato gulamuka seko malaito te › Tech firms are racing to build software that repairs itself,
# gloss: company-N machine-N of compete-V for make-V software-N which repair-V it
sababu gulamuka gagaeto ingi mae › following a series of high-profile outages,
# gloss: because software-N fail-V many before
i ini cedelato banka, kaisaka wolaka fe, i poniadeka naka taunka mae › which disrupted banks, airlines and hospitals over the past year.
# gloss: and this harm-V bank-N, company-N fly-N of, and hospital-N in year-N before

# --- what it does (kikaiakalika "AI"; tanpa "without"; cega "prevent") ---
gulamuka ini pakaito kikaiakalika fo kanto kasika te › This "self-healing" software uses AI to monitor its own performance,
# gloss: software-N this use-V AI for watch-V work-N its
te pataito masalaka i malaito te, tanpa tolonaka hitope › identifying problems and applying corrections without human help.
# gloss: it find-V problem-N and repair-V it, without help-N human of
hitoka seko sukito ini semato ce gulamuka bekito cegato gagaeboka gandepe › Supporters say the technology could prevent big cascading failures
# gloss: person-N who like-V this say-V that software-N can prevent-V failure-N big-MOD
seko mae hentito wolaka i kitonka bayaeka fe › that have grounded flights and frozen payment systems.
# gloss: which before stop-V flight-N and system-N pay-N of

# --- the researcher (kitonka "system"; leti "service"; yawa "respond") ---
hitoka kitonka fe semato: kitonka nayape yato gandepe sana, sehinga hito ne bekito kanto te › A researcher said: "Modern systems are too complex for humans to monitor by hand.
# gloss: person-N system-N of say-V: system-N new-MOD COP big-MOD very, so human NEG can watch-V it
gulamuka ta bekito mauto letika sebu › A single application may depend on thousands of services.
# gloss: software-N one can need-V network-N 1000
fi ta gagaeto naka mo asagohanka, yu mauto ce kitonka yawato mae hitoka kanto te › When one fails at three in the morning, you want the system to respond before anyone notices."
# gloss: if one fail-V in 3 morning-N, you want-V that system-N respond-V before person-N see-V it

# --- how it works (komala "compare"; conto "model"; kosu "traffic") ---
gulamuka komalato kasika te contoka wa › The software continuously compares its behaviour against a model of how it should run.
# gloss: software-N compare-V work-N its model-N with
fi te pataito masalaka — konpuka yawato osoipe, o sitika balaito — te bekito mulaito lagia, badilito kosuka, o badilito kasika te lagia › If it detects an unusual pattern — a server too slow, or memory filling up — it can restart, reroute traffic, or roll back recent changes.
# gloss: if it find-V problem-N — computer-N respond-V slow-MOD, or memory-N fill-V — it can start-V again, change-V traffic-N, or change-V work-N its again

# --- mixed results (yalibio "trial"; pungusa "reduce"; pasento "%") ---
yalibioka hayakupe donato hasiaka, ma hasiaka ne samape › Early trials have produced mixed results.
# gloss: trial-N early-MOD give-V result-N, but result-N NEG same
banka ta semato ce malaiboka tanpa hitoka pungusato wakatika hentipe ki diko pasento, naka co lunka › One European bank reported that automated recovery cut system downtime by almost 70% over six months.
# gloss: bank-N one say-V that repair-N without human reduce-V time-N stop 70 percent, in 6 month-N
ma hitoka bala semato ce ini bahayape: hitoka donato kendalika kikaika su › But critics warn that handing control to automated systems carries its own risks.
# gloss: but person-N some say-V that this dangerous-MOD: person-N give-V control-N machine-N toward

# --- the consultant (caca "fault"; tadasi "correct"; sala "wrong") ---
hitoka kitonka fe semato: bahayaka yato ce gulamuka kimeluto salape, ma te pecayato ce te yato tadasipe › A consultant said: "The danger is that the software makes a confident decision that turns out wrong.
# gloss: person-N system-N of say-V: danger-N COP that software-N decide-V wrong, but it believe-V that it COP correct-MOD
fi te pataito cacaka salape, te bekito tendato cacaka pikope gandepe lebi, hayaipe › If it misdiagnoses the fault, it can make a small fault much worse, very quickly."
# gloss: if it find-V fault-N wrong, it can make-V fault-N small-MOD big more, fast-MOD

# --- oversight (seliaka "law"; atulan "rule"; selo "where") ---
hitoka seliaka fe naka negalaka bala inino kanto ce atulanka tuape yato cukupe ke › Regulators in several countries are now examining whether existing rules are adequate.
# gloss: person-N law-N of in country-N some now look-V whether rule-N old-MOD COP enough-MOD Q
lisikoka gandepe naka poniaka i wolaka, selo kimeluboka salape bekito cedelato hiduka › The concern is greatest in healthcare and aviation, where an incorrect decision could put lives at risk.
# gloss: risk-N big-MOD in healing-N and flying-N, where decision-N wrong-MOD can harm-V life-N
kelopoka hitoka fe tayaeto: sela motuto salaka, sa gulamuka seko malaito te cedelato hitoka ke › Consumer groups have questioned who would be held responsible when self-repairing software causes harm.
# gloss: group-N person-N of ask-V: who have-V wrong, when software-N which repair-V it harm-V person-N Q
inino, seliaka masi ne yato kelipe › At present, the legal position remains unclear.
# gloss: now, law-N still NEG COP real-MOD

# --- the outlook (tosi "invest"; duba "double"; kokana "replace") ---
ma tosika keso sodatuto lebi › Despite the concerns, investment is expected to keep growing.
# gloss: but investment-N later grow-V more
sokoka gulamuka ini fe keso dubato lebi naka mo taunka, sababu kaisaka mauto pungusato kosaka › The market for such tools is forecast to more than double within three years, as companies seek to cut costs.
# gloss: market-N software-N this of later double-V more, in 3 year-N, because company-N want-V reduce-V cost-N
inino, kaisaka ingi semato ce hitoka masi kendalito › For now, most firms insist that human engineers will remain firmly in control.
# gloss: now, company-N many say-V that human still control-V
hitoka kitonka fe semato: ini donato hitoka doguka haope lebi, te ne kokanato hitoka › "This is about giving people better tools, not replacing them," the researcher said.
# gloss: person-N system-N of say-V: this give-V person-N tool-N good-MOD more, it NEG replace-V person-N
ma disaka wakatika fe yato kelipe › "But the direction of travel is clear."
# gloss: but direction-N time-N of COP real-MOD
```

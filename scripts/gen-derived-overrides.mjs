// Generate data/derived-overrides.tsv — the curated real-word/suppression layer
// over the generated derivation paradigm (consumed by scripts/derive-lexicon.mjs).
//
// The CURATION lives in the maps below: this is the per-definition surface for
// the comprehensive pass (docs/0013; CLAUDE.md "defining new words includes
// their derivations"). Real lexicalisations (dog+dim → "puppy", strong+quality →
// "strength") are not rule-derivable, so they are listed here; regular quality
// nouns fall back to a clean "-ness"; agents/places/etc. without a real word keep
// the generator's template. To fix or add a definition, edit the relevant map and
// re-run:  node scripts/gen-derived-overrides.mjs
import { readFileSync, writeFileSync } from "node:fs";

const HEADER = `# Talo derived-form GLOSS overrides — the curated layer over the generated
# derivation paradigm (scripts/derive-lexicon.mjs, docs/0002 §3.2, 0007).
#
# The Talo FORMS stay rule-generated and collision-checked; this file only
# replaces the templated English GLOSS where a real lexicalisation exists
# (dog + diminutive → "puppy", not "little 'dog'"), because such words are not
# rule-derivable — they are curated one definition at a time. A row may also
# SUPPRESS a derivation that doesn't lexicalise sensibly (diminutive of
# "opinion"): the form stays grammatically derivable, we just don't list a
# useless dictionary entry.
#
# Columns: key <TAB> deriv-label <TAB> gloss      ('#' = comment)
#   key   = a root id (ANI-002 — precise, per-definition) OR a domain code
#           (COG — a class rule). A root-id row beats a domain row beats the
#           template.
#   deriv = the derivation label exactly as in the paradigm: diminutive,
#           augmentative, agent, instrument, patient/result, place, quality,
#           causative, inchoative, opposite, ordinal, …
#   gloss = the real English word; LEAVE EMPTY (or write "(suppress)") to drop.
#
# This is an OPEN, growing curation surface — add a row to fix any definition.
key	deriv	gloss`;

const con = readFileSync("data/concepts.tsv","utf8").trim().split("\n").slice(1).map(l=>l.split("\t"));
const roots = con.filter(r=>r[5]==="yes").map(r=>({id:r[0],gloss:r[1],domain:r[2],pos:r[4]}));
const key = g => g.split(/\s*[\/,]\s*/)[0].replace(/\(.*?\)/g,"").trim().toLowerCase();

const ANIMAL_YOUNG = {dog:"puppy",cat:"kitten",cow:"calf",horse:"foal",pig:"piglet",sheep:"lamb",goat:"kid (young goat)",chicken:"chick","fowl":"chick",duck:"duckling",lion:"lion cub",tiger:"tiger cub",bear:"bear cub",deer:"fawn",fish:"fry (young fish)",bird:"nestling / chick",elephant:"elephant calf",camel:"camel calf",donkey:"foal (young donkey)",snake:"hatchling",crocodile:"hatchling",frog:"tadpole",rabbit:"kit / young rabbit",wolf:"wolf pup",fox:"fox kit",goose:"gosling",butterfly:"caterpillar",spider:"spiderling",kangaroo:"joey",eagle:"eaglet",owl:"owlet",buffalo:"buffalo calf"};
const KIN_DIM = {"man":"boy","woman":"girl"};
const QUALITY_IRREG = {long:"length",wide:"width",deep:"depth",high:"height",strong:"strength",true:"truth",hot:"heat",warm:"warmth",heavy:"weight",fast:"speed","fast / quick":"speed",big:"size",young:"youth",old:"age",dead:"death",alive:"life",dry:"dryness",low:"lowness / depth",short:"shortness",proud:"pride",angry:"anger",wise:"wisdom",poor:"poverty",rich:"wealth",free:"freedom",able:"ability",broad:"breadth"};
const AGENT = {teach:"teacher",learn:"learner / student",sing:"singer",write:"writer / author",read:"reader",lead:"leader",build:"builder",fight:"fighter / warrior",heal:"healer / doctor",run:"runner",swim:"swimmer",work:"worker",play:"player",say:"speaker",help:"helper",govern:"ruler / governor",cook:"cook",carve:"carver / sculptor",judge:"judge",fly:"pilot / flyer",jump:"jumper",walk:"walker",buy:"buyer",own:"owner",give:"giver",follow:"follower",rule:"ruler",attack:"attacker",rescue:"rescuer",observe:"observer",advise:"adviser / counsellor",bake:"baker","weave (v)":"weaver",weave:"weaver",sew:"tailor / sewer",sail:"sailor",worship:"worshipper",betray:"betrayer / traitor",invest:"investor",compete:"competitor",complain:"complainer",joke:"joker",dream:"dreamer",love:"lover",lie:"liar",catch:"catcher",throw:"thrower",kick:"kicker",paint:"painter",print:"printer",hunt:"hunter",pray:"worshipper",boast:"boaster",drink:"drinker",hold:"holder",send:"sender",pay:"payer",owe:"debtor",serve:"servant",repair:"repairer / mechanic",guide:"guide",invent:"inventor",explore:"explorer",rob:"robber",steal:"thief"};
const AGENT_SUPPRESS = new Set(["can","must","should","exist","seem","cost","be born","appear","die","fall","fall over","arrive","depart","pass by","stay","come","go","become","happen","remain","live","grow","swell","bleed","blink","yawn","sneeze","cough","itch","sweat","tremble","shiver","hiccough"]);
const PLACE = {learn:"school",cook:"kitchen",sleep:"bedroom",bathe:"bathroom",pray:"temple / place of worship",buy:"market / shop",work:"workplace",play:"playground",bake:"bakery",fight:"battlefield",eat:"dining hall",heal:"hospital / clinic",worship:"temple",study:"school",read:"library",sell:"market",bury:"cemetery"};
const INSTRUMENT = {cut:"knife / cutter",sweep:"broom",write:"pen",dig:"spade / shovel",measure:"measure / gauge",weigh:"scales"};
const CAUSATIVE = {fall:"drop / fell",rise:"raise / lift",sit:"seat",eat:"feed",see:"show",know:"inform / tell",remember:"remind",learn:"teach",die:"kill",wake:"wake / rouse",drink:"give to drink",lie:"lay"};
const RESULT = {build:"building",write:"writing / document",give:"gift",ask:"question",cook:"dish / cooked food",buy:"purchase / goods",draw:"drawing",paint:"painting",say:"statement",answer:"answer",pay:"payment",promise:"promise"};
const DIM_SUPPRESS_DOMAINS = new Set(["COG","EMO"]);

function quality(k){
  if (QUALITY_IRREG[k]) return QUALITY_IRREG[k];
  if (/[^aeiou]y$/.test(k)) return k.slice(0,-1)+"iness";
  return k+"ness";
}

const out = [];
const push = (id,deriv,gloss)=>out.push(`${id}\t${deriv}\t${gloss}`);
for (const r of roots){
  const k = key(r.gloss);
  if (r.pos==="n"){ if (ANIMAL_YOUNG[k]) push(r.id,"diminutive",ANIMAL_YOUNG[k]); else if (KIN_DIM[k]) push(r.id,"diminutive",KIN_DIM[k]); }
  if (r.pos==="mod"){ push(r.id,"quality",quality(k)); }
  if (r.pos==="v"){
    if (AGENT[k]) push(r.id,"agent",AGENT[k]); else if (AGENT_SUPPRESS.has(k)) push(r.id,"agent","(suppress)");
    if (PLACE[k]) push(r.id,"place",PLACE[k]);
    if (INSTRUMENT[k]) push(r.id,"instrument",INSTRUMENT[k]);
    if (CAUSATIVE[k]) push(r.id,"causative",CAUSATIVE[k]);
    if (RESULT[k]) push(r.id,"patient/result",RESULT[k]);
  }
}
const classSup = [...DIM_SUPPRESS_DOMAINS].map(d=>`${d}\tdiminutive\t(suppress)`);
writeFileSync("data/derived-overrides.tsv", HEADER.trimEnd()+"\n"+out.join("\n")+"\n\n# class suppressions (abstract diminutives — overridable per-root above)\n"+classSup.join("\n")+"\n");
console.log(`wrote data/derived-overrides.tsv: ${out.length} per-form + ${classSup.length} class rule(s)`);

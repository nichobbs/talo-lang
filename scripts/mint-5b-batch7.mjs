// Phase 5b batch 1 — catalogue + mint ~150 tier-2/3 concepts across three areas:
//   People/social/mind, Everyday/material life, Modern/tech/civic.
// Append-only, fail-fast, self-validating through the REAL collision checker.
// Run: node --experimental-strip-types scripts/mint-5b-batch1.mjs
//   (writes data/concepts.tsv + data/lexicon.tsv only on full success)
import { checkForm, RESERVED_FORMS } from "../tools/collision-checker/src/index.ts";
import { readFileSync, writeFileSync } from "node:fs";

const VOWELS = new Set([..."aeiou"]);
const STOPS = new Set([..."ptkbdgc"]);
const CONS = new Set([..."ptkbdgcfshmnlwy"]);

// Legalizer that SIMPLIFIES to legal Talo per 0003 §7b (simplify clusters/codas,
// don't pad), unlike mint-remaining's buffer-padding. Recognisability > length
// (rule 1): we drop the offending consonant at an illegal seam rather than insert
// a buffer vowel that mangles the donor (e.g. shokuji -> sokuyi, not sahokuyi).
function legalize(raw) {
  let s = raw.toLowerCase();
  // 1. romanisation digraphs FIRST, before single-char mapping:
  s = s
    .replace(/sh/g, "s")   // shokuji -> sokuyi, shizuka -> sizuka
    .replace(/ch/g, "c")   // cha -> ca, machigai -> macigai (c = /tʃ/)
    .replace(/ts/g, "s")   // tsumi -> sumi
    .replace(/ngg/g, "ng") // anggota -> angota, tetangga -> tetanga
    .replace(/th/g, "t")
    .replace(/ph/g, "f")
    .replace(/ck/g, "k")
    .replace(/gh/g, "g")
    .replace(/dh/g, "d")
    .replace(/kh/g, "h");
  // 2. single-letter substitutions (no r,j,v,z,q,x in Talo)
  const map = { r: "l", j: "y", v: "w", z: "s", q: "k", x: "k" };
  s = [...s].map((c) => map[c] ?? c).join("");
  // 3. keep only Talo letters
  s = [...s].filter((c) => VOWELS.has(c) || CONS.has(c)).join("");
  // 4. walk left-to-right enforcing (C)V(n): coda 'n' only before a stop/affricate,
  //    else DROP the offending coda consonant (simplify, don't pad).
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const prev = out[out.length - 1] ?? "";
    const next = s[i + 1] ?? "";
    if (VOWELS.has(c)) {
      if (prev === c) continue;            // no doubled vowel (R6)
      out += c;
    } else {
      if (prev === "" || VOWELS.has(prev)) {
        out += c;                          // legal onset after vowel/start
      } else if (prev === "n" && STOPS.has(c)) {
        out += c;                          // the one legal cluster: n + stop/affricate
      } else {
        // illegal seam. If THIS consonant is 'n' and the next is a stop, the n is a
        // legal coda -> keep it by dropping the PREVIOUS dangling consonant instead.
        if (c === "n" && STOPS.has(next)) { out = out.slice(0, -1) + c; }
        else continue;                     // drop this consonant (simplify)
      }
    }
  }
  // 5. coda repair: a word may only end in a vowel or 'n'. If it ends in another
  //    consonant, drop it (keep donor shape) rather than pad.
  while (out.length && !VOWELS.has(out.at(-1)) && out.at(-1) !== "n") out = out.slice(0, -1);
  out = out.replace(/([aeiou])\1+/g, "$1");
  // 6. R3: no initial cluster — drop leading consonant(s) until C?V.
  while (out.length >= 2 && !VOWELS.has(out[0]) && !VOWELS.has(out[1])) out = out.slice(1);
  return out;
}

// New concepts: [domain, gloss, tier, pos, source, family]. id auto-assigned by
// continuing each domain's sequence. pos: n/v/mod. family is for the notes tag.
const NEW = [
  ["MOD","screen",2,"n","pantala","Romance"],
  ["MOD","control button",2,"n","botone","Romance"],
  ["MOD","network",2,"n","leti","Austronesian"],
  ["MOD","signal",2,"n","senale","Romance"],
  ["MOD","data",2,"n","dato","Romance"],
  ["MOD","file (digital)",2,"n","failu","international"],
  ["MOD","digital message",2,"n","mesahi","Romance"],
  ["MOD","password",2,"n","angou","Japonic"],
  ["MOD","battery",2,"n","denci","Japonic"],
  ["MOD","switch (device)",2,"n","suici","Japonic"],
  ["MOD","wire",2,"n","kawale","Austronesian"],
  ["MOD","lens",2,"n","lente","Romance"],
  ["MOD","photo",2,"n","foto","international"],
  ["MOD","video",2,"n","wideo","international"],
  ["MOD","record (v)",2,"v","gulaba","international"],
  ["MOD","broadcast",2,"v","hoso","Japonic"],
  ["MOD","channel",2,"n","canele","Romance"],
  ["MOD","program (software)",2,"n","gulamu","international"],
  ["MOD","robot",2,"n","loboto","international"],
  ["MOD","satellite",3,"n","satelite","Romance"],
  ["MOD","app (application)",2,"n","apuli","international"],
  ["MOD","keyboard",2,"n","kibodo","international"],
  ["MOD","speaker (audio)",2,"n","alabo","Romance"],
  ["MOD","cable (data)",2,"n","kabele","Romance"],
  ["MOD","update (v)",2,"v","akutuali","Romance"],
  ["MOD","download",2,"v","desikaga","international"],
  ["MOD","account (online)",2,"n","kuenta","Romance"],
  ["MOD","website",2,"n","sitio","Romance"],
  ["MOD","microphone",3,"n","maiku","Japonic"],
  ["MOD","antenna",3,"n","antena","Romance"],
  ["MOD","pharmacy",3,"n","famasia","Romance"],
  ["MOD","library",2,"n","tosokan","Japonic"],
  ["MOD","museum",2,"n","museo","Romance"],
  ["MOD","theatre",2,"n","teatulo","Romance"],
  ["MOD","stadium",2,"n","sutadio","international"],
  ["MOD","warehouse",2,"n","gudan","Austronesian"],
  ["MOD","bakery",2,"n","panadeli","Romance"],
  ["MOD","restaurant",2,"n","lesolan","Romance"],
  ["MOD","cafe",2,"n","kafeti","Romance"],
  ["MOD","post office",2,"n","yubinko","Japonic"],
  ["MOD","embassy",3,"n","taisikan","Japonic"],
  ["MOD","courtroom",3,"n","saiban","Japonic"],
  ["MOD","temple",2,"n","kuile","Japonic"],
  ["MOD","church",2,"n","ilesia","Romance"],
  ["MOD","mosque",2,"n","masidi","Semitic"],
  ["MOD","cemetery",2,"n","makaba","Semitic"],
  ["MOD","park (public)",2,"n","kowen","Japonic"],
  ["MOD","plaza / square",2,"n","pasa","Romance"],
  ["MOD","stamp (postage)",2,"n","kite","Japonic"],
  ["MOD","passport",2,"n","pasepole","Romance"],
  ["MOD","license / permit",2,"n","luwidi","international"],
  ["MOD","election / vote",2,"n","sengo","Japonic"],
  ["MOD","union (labor)",3,"n","kumiai","Japonic"],
  ["MOD","insurance",3,"n","hoken","Japonic"],
  ["MOD","university",2,"n","daigaku","Japonic"],
  ["FOO","fry",2,"v","golen","Austronesian"],
  ["FOO","bake",2,"v","panega","Romance"],
  ["FOO","roast",2,"v","asalo","Romance"],
  ["FOO","grill",2,"v","yakito","Japonic"],
  ["FOO","peel (v)",2,"v","mugito","Japonic"],
  ["FOO","slice (v)",2,"v","kilito","Romance"],
  ["FOO","grind",2,"v","muelo","Romance"],
  ["FOO","knead",2,"v","koneto","Romance"],
  ["FOO","ferment",3,"v","lagiwa","Austronesian"],
  ["FOO","recipe",2,"n","leseta","Romance"],
  ["FOO","ingredient",2,"n","saigo","Japonic"],
  ["FOO","dough",2,"n","masa","Romance"],
  ["FOO","sauce",2,"n","sosu","Japonic"],
  ["FOO","broth / stock",2,"n","kaludo","Romance"],
  ["FOO","snack",2,"n","gaiti","Japonic"],
  ["FOO","dessert",2,"n","posole","Romance"],
  ["FOO","ripe",2,"mod","masaku","Austronesian"],
  ["FOO","raw",2,"mod","namai","Japonic"],
  ["FOO","stale",3,"mod","basi","Austronesian"],
  ["FOO","rotten",2,"mod","busuku","Austronesian"],
  ["FOO","stew (dish)",2,"n","gisado","Romance"],
  ["FOO","salad",2,"n","enalada","Romance"],
  ["FOO","noodle",2,"n","mien","Sinitic"],
  ["FOO","dumpling",3,"n","gosai","Japonic"],
  ["FOO","pastry / cake",2,"n","gateu","Romance"],
  ["FOO","jam (preserve)",3,"n","yamua","international"],
  ["FOO","syrup",3,"n","silopu","Semitic"],
  ["FOO","yogurt",2,"n","yogulu","Semitic"],
  ["FOO","tofu",2,"n","tofu","Sinitic"],
  ["FOO","sausage",3,"n","saluci","Romance"],
  ["FOO","seafood",2,"n","maliko","Romance"],
  ["FOO","spicy / hot (taste)",2,"mod","pedasi","Austronesian"],
  ["FOO","crunchy",3,"mod","galiga","Austronesian"],
  ["FOO","fatty / greasy",3,"mod","abula","Romance"],
  ["ACT","serve (food)",2,"v","selito","Romance"],
  ["ACT","taste-test",2,"v","kicimi","Japonic"],
  ["ACT","store / stow",2,"v","gudanto","Austronesian"],
  ["ACT","pack",2,"v","tunaga","Austronesian"],
  ["ACT","tidy up",2,"v","kataduke","Japonic"],
  ["ACT","decorate",2,"v","kasalito","Romance"],
  ["ACT","polish",2,"v","migakito","Japonic"],
  ["ACT","sharpen",2,"v","togito","Japonic"],
  ["ACT","lock (v)",2,"v","kunato","Romance"],
  ["ACT","unlock",2,"v","akito","Japonic"],
  ["ACT","knock",2,"v","tokito","Japonic"],
  ["ACT","ring a bell",2,"v","nalasi","Japonic"],
  ["ACT","switch on",2,"v","cuketo","Japonic"],
  ["ACT","switch off",2,"v","kesito","Japonic"],
  ["ACT","plug in",2,"v","sasito","Japonic"],
  ["ACT","charge (battery)",2,"v","cudento","Japonic"],
  ["ACT","print",2,"v","selakito","Austronesian"],
  ["ACT","scan",2,"v","sukana","international"],
  ["ACT","type (v)",2,"v","tipeto","Romance"],
  ["ACT","click",2,"v","kuliki","international"],
  ["ACT","mince / chop fine",3,"v","kisami","Japonic"],
  ["ACT","assemble / put together",2,"v","kumitalo","Japonic"],
  ["ACT","install",2,"v","setudate","international"],
  ["ACT","wrap",2,"v","cucumi","Japonic"],
  ["ACT","fasten / buckle",3,"v","tomelo","Romance"],
  ["ACT","hang up (object)",2,"v","kageto","Japonic"],
  ["ACT","pile / stack",2,"v","kasaneto","Japonic"],
  ["ACT","sort / classify",2,"v","walito","Japonic"],
  ["ACT","label / tag",3,"v","labelo","Romance"],
  ["ACT","weld / solder",3,"v","sugito","Japonic"],
  ["ACT","drill (v)",3,"v","beleto","Romance"],
  ["ACT","paint (v)",2,"v","nulito","Japonic"],
  ["ACT","rinse",3,"v","susugi","Japonic"],
  ["ACT","soak",2,"v","celento","Austronesian"],
  ["ACT","dry (cause to)",2,"v","hosito","Japonic"],
  ["ACT","light (a fire)",2,"v","tomosi","Japonic"],
  ["DWE","apartment",2,"n","apato","Japonic"],
  ["DWE","cottage",3,"n","kabana","Romance"],
  ["DWE","tower",2,"n","tolea","Romance"],
  ["DWE","hut",2,"n","kubo","Austronesian"],
  ["DWE","tent",2,"n","tendai","Romance"],
  ["DWE","palace",2,"n","palasio","Romance"],
  ["DWE","barn",3,"n","binaga","Austronesian"],
  ["DWE","chimney",3,"n","cimini","international"],
  ["DWE","balcony",2,"n","balukon","Romance"],
  ["DWE","basement",2,"n","cikato","Japonic"],
  ["DWE","corridor",2,"n","lodaka","Japonic"],
  ["DWE","courtyard",3,"n","niwa","Japonic"],
  ["DWE","pillar / column",2,"n","hasila","Austronesian"],
  ["DWE","brick",2,"n","ladilo","Romance"],
  ["DWE","cement",2,"n","semento","Romance"],
  ["DWE","tile",2,"n","tegula","Romance"],
  ["DWE","paint (substance)",2,"n","pintula","Romance"],
  ["DWE","stove / cooker",2,"n","kono","Japonic"],
  ["DWE","sink (basin)",2,"n","nagasi","Japonic"],
  ["DWE","faucet / tap",2,"n","gilipo","Romance"],
  ["DWE","ladder",2,"n","hasigo","Japonic"],
  ["DWE","fireplace / hearth",3,"n","dano","Sinitic"],
  ["DWE","mattress",3,"n","kasugen","Japonic"],
  ["DWE","cushion",2,"n","kuhin","Romance"],
  ["DWE","curtain",2,"n","katen","Japonic"],
  ["DWE","carpet / rug",2,"n","kalupeta","Romance"],
  ["DWE","wardrobe",3,"n","tanua","Japonic"],
  ["DWE","stool / bench",2,"n","bankoa","Romance"],
  ["DWE","sofa / couch",2,"n","sofa","international"],
  ["DWE","drill (tool)",2,"n","kilido","Japonic"],
  ["DWE","screw",2,"n","nedi","Japonic"],
  ["DWE","chain",2,"n","kusali","Japonic"],
  ["DWE","lever",3,"n","palanka","Romance"],
  ["DWE","pump",2,"n","ponpu","international"],
  ["DWE","blade",2,"n","habale","Japonic"],
  ["DWE","kiln / furnace",3,"n","kamado","Japonic"],
  ["DWE","glue",2,"n","nolito","Japonic"],
  ["DWE","wax",2,"n","losoku","Japonic"],
  ["DWE","cable / cord",2,"n","kodale","Romance"],
  ["MOT","vehicle",2,"n","sialin","Sinitic"],
  ["MOT","tyre",2,"n","taiya","Japonic"],
  ["MOT","fuel",2,"n","nento","Japonic"],
  ["MOT","brake",2,"n","buleki","international"],
  ["MOT","highway",2,"n","kosoku","Japonic"],
  ["MOT","path / trail",2,"n","sendelo","Romance"],
  ["MOT","track / lane",2,"n","picita","Romance"],
  ["MOT","harbour / port",2,"n","minato","Japonic"],
  ["MOT","airport",2,"n","kuko","Japonic"],
  ["MOT","platform (station)",2,"n","homu","international"],
  ["MOT","fare",2,"n","uncin","Japonic"],
  ["MOT","luggage",2,"n","nimotu","Japonic"],
  ["MOT","journey / trip",2,"n","tabi","Japonic"],
  ["MOT","route",2,"n","keilo","Romance"],
  ["MOT","traffic",2,"n","kosu","Japonic"],
  ["MOT","tunnel",2,"n","tonele","Romance"],
  ["MOT","sail (v)",2,"v","koline","Romance"],
  ["MOT","anchor",2,"n","ikali","Japonic"],
  ["MOT","ferry",3,"n","felibo","international"],
  ["MOT","truck / lorry",2,"n","tolaku","international"],
  ["MOT","motorcycle",2,"n","baiku","international"],
  ["MOT","subway / metro",3,"n","cikatela","Japonic"],
  ["MOT","cart / wagon",2,"n","kalita","Romance"],
  ["MOT","passenger",2,"n","yokaku","Japonic"],
  ["MOT","driver",2,"n","untente","Japonic"],
  ["MOT","departure",2,"n","sapasu","Japonic"],
  ["MOT","crossroads / junction",3,"n","kosaten","Japonic"],
  ["MOT","load / cargo",2,"n","kaluga","Romance"],
  ["TIM","weekend",2,"n","sumatu","Japonic"],
  ["TIM","interval / pause",2,"n","aida","Japonic"],
  ["TIM","shift (work period)",3,"n","kotaia","Japonic"],
  ["TIM","timer / countdown",3,"n","taima","international"],
  ["QTY","container / vessel",2,"n","yoki","Japonic"],
  ["QTY","crate / case",2,"n","kahako","Japonic"],
  ["QTY","barrel / drum",3,"n","talu","international"],
  ["QTY","sack",2,"n","fukulo","Japonic"],
  ["QTY","tank / reservoir",2,"n","tankua","international"],
  ["QTY","tube",3,"n","cuboa","Romance"],
  ["QTY","scale (weighing)",2,"n","hakali","Japonic"],
  ["QTY","heap / pile",2,"n","yamada","Japonic"],
  ["QTY","slice / portion",2,"n","kilen","Romance"],
  ["QTY","square (math)",3,"n","kuwadalo","Romance"],
  ["QTY","angle / degree-turn",3,"n","kakudo","Japonic"],
  ["SPA","interior",2,"n","naibo","Japonic"],
  ["SPA","exterior",2,"n","gaibo","Japonic"],
  ["SPA","gap / clearance",3,"n","sukima","Japonic"],
  ["SPA","level / floor (storey)",2,"n","kaida","Japonic"],
  ["SPA","zone / sector",2,"n","kuiki","Japonic"],
  ["SPA","slot / niche",3,"n","kukan","Japonic"],
];

// ---- load current data ----
const conLines = readFileSync("data/concepts.tsv","utf8").replace(/\n+$/,"").split("\n");
const lexLines = readFileSync("data/lexicon.tsv","utf8").replace(/\n+$/,"").split("\n");
const conRows = conLines.slice(1).map(l=>l.split("\t"));
const haveForm = new Map(lexLines.slice(1).map(l=>{const c=l.split("\t");return [c[0],c[2]];}));
const glossSeen = new Set(conRows.map(r=>r[1].toLowerCase()));

// next sequence number per domain
const maxSeq = {};
for (const r of conRows) { const [d,n]=r[0].split("-"); const v=+n; if(!(d in maxSeq)||v>maxSeq[d]) maxSeq[d]=v; }

// occupied forms for collision checking: reserved + all existing forms
const occupied=[...RESERVED_FORMS].map(f=>({form:f,label:"reserved"}));
for(const [id,form] of haveForm) occupied.push({form,label:id});

const vowels=["a","e","i","o","u"], cmix=["k","t","p","n","s","l","m"];
const newConRows=[], newLexRows=[], fails=[], dupes=[];

for (const [domain,gloss,tier,pos,src,family] of NEW) {
  if (glossSeen.has(gloss.toLowerCase())) { dupes.push(gloss); continue; }
  const seq = (maxSeq[domain]=(maxSeq[domain]??0)+1);
  const id = domain+"-"+String(seq).padStart(3,"0");
  // mint form (legalize + collision-resolve, identical strategy to mint-remaining)
  const base = legalize(src);
  let cand=base, ok=false;
  for(let t=0;t<60 && !ok;t++){
    if(t>0){
      if(t<=5) cand=base+vowels[t-1];
      else if(t<=30) cand=base+vowels[t%5]+cmix[t%7]+vowels[Math.floor(t/5)%5];
      else cand=base+vowels[t%5]+vowels[(t+2)%5];
      cand=legalize(cand);
    }
    if(cand.length>=2 && checkForm(cand,occupied).ok) ok=true;
  }
  if(!ok){ fails.push(id+"/"+src); continue; }
  occupied.push({form:cand,label:id});
  glossSeen.add(gloss.toLowerCase());
  const srcTag = (tier>=3 && family==="international") ? "MOD" : "IDS";
  // concepts.tsv: id gloss domain tier pos_hint is_root derivation source notes
  newConRows.push([id,gloss,domain,String(tier),pos,"yes","",srcTag,"5b batch1 ("+family+")"].join("\t"));
  // lexicon.tsv: id gloss form source rationale notes
  const note = base!==cand ? "blend (legalised); "+family : "blend; "+family;
  newLexRows.push([id,gloss,cand,"INTL","blend rubric; src '"+src+"'",note].join("\t"));
}

if (dupes.length) { console.error("ABORT: gloss already in catalogue: "+dupes.join(", ")); process.exit(1); }
if (fails.length) { console.error("ABORT: could not mint: "+fails.join(", ")); process.exit(1); }

// APPEND ONLY: keep every existing line byte-identical, add new rows.
writeFileSync("data/concepts.tsv", conLines.join("\n")+"\n"+newConRows.join("\n")+"\n");
writeFileSync("data/lexicon.tsv", lexLines.join("\n")+"\n"+newLexRows.join("\n")+"\n");
console.log("minted "+newLexRows.length+" new forms across "+new Set(NEW.map(n=>n[0])).size+" domains");
writeFileSync("/tmp/mint-5b-report.txt", newLexRows.join("\n")+"\n");

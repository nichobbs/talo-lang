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
  // ===== BODY (anatomy) =====
  ["BOD","lung",2,"n","pafu","Bantu"],
  ["BOD","liver",2,"n","ini","Bantu"],
  ["BOD","throat",2,"n","umio","Bantu"],
  ["BOD","brain",2,"n","ubongo","Bantu"],
  ["BOD","cheek",2,"n","shavu","Bantu"],
  ["BOD","lip",2,"n","midomo","Bantu"],
  ["BOD","shoulder",2,"n","bega","Bantu"],
  ["BOD","elbow",3,"n","kiko","Bantu"],
  ["BOD","hip",3,"n","nyonga","Bantu"],
  ["BOD","heel",3,"n","kisigino","Bantu"],
  ["BOD","kidney",3,"n","figo","Bantu"],
  ["BOD","muscle",2,"n","mansa","Indo-Aryan"],
  ["BOD","vein",3,"n","nasa","Indo-Aryan"],
  ["BOD","nerve",3,"n","nadi","Indo-Aryan"],
  ["BOD","womb",3,"n","kokhi","Indo-Aryan"],
  ["BOD","fist",3,"n","mutthi","Indo-Aryan"],
  ["BOD","navel",3,"n","nabhi","Indo-Aryan"],
  ["BOD","ankle",3,"n","gitta","Indo-Aryan"],
  ["BOD","eyebrow",3,"n","bhamri","Indo-Aryan"],
  ["BOD","chin",3,"n","thodi","Indo-Aryan"],
  ["BOD","jaw",3,"n","tani","Bantu"],
  ["BOD","skull",3,"n","fuvu","Bantu"],
  ["BOD","limb",3,"n","sizhi","Sinitic"],
  ["BOD","gland",3,"n","glandula","Romance"],
  ["BOD","artery",3,"n","arteria","Romance"],
  ["BOD","skeleton",3,"n","skeleto","Romance"],
  ["BOD","beard",2,"n","lihya","Semitic"],
  ["BOD","waist",2,"n","pinggang","Austronesian"],
  ["BOD","calf (of leg)",3,"n","betis","Austronesian"],
  // ===== BODY (states & functions) =====
  ["BOD","pregnant",2,"mod","garbhini","Indo-Aryan"],
  ["BOD","breath",2,"n","pumzi","Bantu"],
  ["BOD","bald",3,"mod","ganja","Indo-Aryan"],
  ["BOD","sweat",2,"v","jasho","Bantu"],
  ["BOD","cough",2,"v","kohoa","Bantu"],
  ["BOD","sneeze",2,"v","chemua","Bantu"],
  ["BOD","yawn",3,"v","piasa","Bantu"],
  ["BOD","saliva",3,"n","mate","Bantu"],
  ["BOD","scar",3,"n","kovu","Bantu"],
  ["BOD","bleed",2,"v","liuxie","Sinitic"],
  ["BOD","swallow",2,"v","tunyan","Sinitic"],
  ["BOD","chew",2,"v","jueju","Sinitic"],
  ["BOD","itch",2,"v","khujli","Indo-Aryan"],
  ["BOD","spit",3,"v","tafala","Semitic"],
  ["BOD","digest",3,"v","digeri","Romance"],
  ["BOD","blink",3,"v","kedip","Austronesian"],
  ["BOD","urine",3,"n","peshaba","Indo-Aryan"],
  // ===== PERCEPTION =====
  ["PER","glance",2,"v","nawa","Bantu"],
  ["PER","stare / gaze",2,"v","kazia","Bantu"],
  ["PER","odour / scent",2,"n","harufu","Bantu"],
  ["PER","flavour",2,"n","zaika","Indo-Aryan"],
  ["PER","brightness",3,"n","mwanga","Bantu"],
  ["PER","darkness",2,"n","giza","Bantu"],
  ["PER","loud / noisy",2,"mod","kelele","Bantu"],
  ["PER","silent / quiet",2,"mod","kimya","Bantu"],
  ["PER","fragrance",2,"n","sugandha","Indo-Aryan"],
  ["PER","stench",2,"n","badbu","Indo-Aryan"],
  ["PER","perceive / sense",2,"v","anubhava","Indo-Aryan"],
  ["PER","observe",2,"v","guancha","Sinitic"],
  ["PER","sensation",2,"n","sensasio","Romance"],
  ["PER","echo",3,"n","sada","Semitic"],
  ["PER","aroma",2,"n","arifa","Semitic"],
  ["PER","sticky",3,"mod","lengket","Austronesian"],
  ["PER","slippery",3,"mod","licin","Austronesian"],
  // ===== MOTION =====
  ["MOT","return / go back",2,"v","rudia","Bantu"],
  ["MOT","jump / leap",2,"v","ruka","Bantu"],
  ["MOT","flee / escape",2,"v","kimbia","Bantu"],
  ["MOT","chase / pursue",2,"v","fukuza","Bantu"],
  ["MOT","crawl",2,"v","tambaa","Bantu"],
  ["MOT","approach / draw near",2,"v","karibia","Bantu"],
  ["MOT","pass by",2,"v","pita","Bantu"],
  ["MOT","slide / slip",2,"v","teleza","Bantu"],
  ["MOT","wander / roam",3,"v","tangatanga","Bantu"],
  ["MOT","tremble / shake",2,"v","tetemeka","Bantu"],
  ["MOT","spin / rotate",2,"v","zunguluka","Bantu"],
  ["MOT","collide / crash",3,"v","gonga","Bantu"],
  ["MOT","cross / traverse",2,"v","yatra","Indo-Aryan"],
  ["MOT","retreat / withdraw",2,"v","pichehat","Indo-Aryan"],
  ["MOT","gather / assemble",2,"v","ikattha","Indo-Aryan"],
  ["MOT","drag / haul",3,"v","ghasitna","Indo-Aryan"],
  ["MOT","float / drift",2,"v","talna","Indo-Aryan"],
  ["MOT","stumble / trip",3,"v","ladkhada","Indo-Aryan"],
  ["MOT","step / pace",2,"v","hatua","Bantu"],
  ["MOT","advance / go forward",2,"v","qianjin","Sinitic"],
  ["MOT","fall over / topple",2,"v","daota","Sinitic"],
  ["MOT","roll",2,"v","gundun","Sinitic"],
  ["MOT","ascend / climb up",2,"v","montar","Romance"],
  ["MOT","circulate",3,"v","sirkula","Romance"],
  ["MOT","navigate / steer",3,"v","naviga","Romance"],
  ["MOT","accelerate / speed up",3,"v","akselera","Romance"],
  ["MOT","depart / set off",2,"v","safara","Semitic"],
  ["MOT","hurry / rush",2,"v","saria","Semitic"],
  ["MOT","creep / sneak",3,"v","menyusup","Austronesian"],
  // ===== HEALTH / MEDICAL (MOD) =====
  ["MOD","sick / ill",2,"mod","ugonjwa","Bantu"],
  ["MOD","fever",2,"n","homa","Bantu"],
  ["MOD","wound / injury",2,"n","jeraha","Bantu"],
  ["MOD","disease / illness",2,"n","maradhi","Bantu"],
  ["MOD","swell / swelling",3,"v","vimba","Bantu"],
  ["MOD","poison / venom",2,"n","sumu","Bantu"],
  ["MOD","health",2,"n","afiya","Bantu"],
  ["MOD","blind",2,"mod","kipofu","Bantu"],
  ["MOD","deaf",2,"mod","kiziwi","Bantu"],
  ["MOD","sore / ulcer",3,"n","kidonda","Bantu"],
  ["MOD","cure / remedy",2,"n","upachar","Indo-Aryan"],
  ["MOD","drug / medication",2,"n","dawai","Indo-Aryan"],
  ["MOD","cold / flu",2,"n","ganmao","Sinitic"],
  ["MOD","vitality / strength (health)",3,"n","nguvu","Bantu"],
  ["MOD","lame / crippled",3,"mod","langda","Indo-Aryan"],
  ["MOD","virus",2,"n","bingdu","Sinitic"],
  ["MOD","infect / infection",3,"v","ganran","Sinitic"],
  ["MOD","tumor / lump",3,"n","zhongliu","Sinitic"],
  ["MOD","vaccine",3,"n","yamiao","Sinitic"],
  ["MOD","diarrhea",3,"n","fuxie","Sinitic"],
  ["MOD","surgery / operation",2,"n","kirurgia","Romance"],
  ["MOD","nurse",2,"n","muuguzi","Bantu"],
  ["MOD","clinic",3,"n","klinika","Romance"],
  ["MOD","antibiotic",3,"n","antibiotika","Romance"],
  ["MOD","epidemic / plague",3,"n","epidemia","Romance"],
  ["MOD","pill / tablet",2,"n","pastilla","Romance"],
  ["MOD","ointment / balm",3,"n","salaba","Semitic"],
  ["MOD","contagion / catch (illness)",3,"n","kansen","Japonic"],
  ["MOD","dizzy / faint",3,"mod","kizunguzungu","Bantu"],
  ["MOD","recover / heal up",2,"v","pona","Bantu"],
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

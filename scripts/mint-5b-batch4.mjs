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
  // ===== PHY — landforms, water, weather, sky, materials, minerals, directions =====
  ["PHY","hill",2,"n","kilima","Bantu"],
  ["PHY","valley",2,"n","kanyon","Romance"],
  ["PHY","island",2,"n","kisiwa","Bantu"],
  ["PHY","coast / shore",2,"n","tira","Indo-Aryan"],
  ["PHY","desert",2,"n","registan","Semitic"],
  ["PHY","plain / grassland",3,"n","nyika","Bantu"],
  ["PHY","cave",2,"n","pango","Bantu"],
  ["PHY","cliff",3,"n","genge","Bantu"],
  ["PHY","swamp / marsh",3,"n","daladala","Indo-Aryan"],
  ["PHY","stream / brook",2,"n","kijito","Bantu"],
  ["PHY","spring (water source)",3,"n","casma","Semitic"],
  ["PHY","well (water)",2,"n","kuva","Semitic"],
  ["PHY","pond / pool",2,"n","talao","Indo-Aryan"],
  ["PHY","wave",2,"n","lahari","Indo-Aryan"],
  ["PHY","mud",2,"n","matope","Bantu"],
  ["PHY","clay",2,"n","udongo","Bantu"],
  ["PHY","gold",2,"n","sonari","Indo-Aryan"],
  ["PHY","silver",2,"n","candi","Indo-Aryan"],
  ["PHY","iron",2,"n","ispata","Indo-Aryan"],
  ["PHY","copper",3,"n","tonga","Sinitic"],
  ["PHY","coal",2,"n","meitan","Sinitic"],
  ["PHY","glass",2,"n","kanca","Indo-Aryan"],
  ["PHY","jewel / gem",3,"n","ratana","Indo-Aryan"],
  ["PHY","diamond",3,"n","hira","Indo-Aryan"],
  ["PHY","ocean / deep sea",2,"n","bahari","Semitic"],
  ["PHY","earthquake",3,"n","bhukamba","Indo-Aryan"],
  ["PHY","volcano",3,"n","wulkano","Romance"],
  ["PHY","weather / climate",2,"n","mausam","Indo-Aryan"],
  ["PHY","storm",2,"n","tufani","Semitic"],
  ["PHY","thunder",2,"n","garaja","Indo-Aryan"],
  ["PHY","lightning",2,"n","biyuli","Indo-Aryan"],
  ["PHY","fog / mist",2,"n","kohla","Indo-Aryan"],
  ["PHY","dew",3,"n","himpata","Indo-Aryan"],
  ["PHY","flood",2,"n","sailaba","Semitic"],
  ["PHY","drought",3,"n","sukha","Indo-Aryan"],
  ["PHY","rainbow",2,"n","indladanu","Indo-Aryan"],
  ["PHY","heat / warmth",2,"n","garmi","Indo-Aryan"],
  ["PHY","planet",3,"n","graha","Indo-Aryan"],
  ["PHY","universe / cosmos",3,"n","bramanda","Indo-Aryan"],
  ["PHY","gas",3,"n","gesi","Romance"],
  ["PHY","steam / vapour",3,"n","bafa","Indo-Aryan"],
  ["PHY","flame",2,"n","yvala","Indo-Aryan"],
  ["PHY","spark",3,"n","cingali","Indo-Aryan"],
  ["PHY","leather / hide",2,"n","camla","Indo-Aryan"],
  ["PHY","rubber",3,"n","labala","Romance"],
  ["PHY","plastic",3,"n","palasiti","Romance"],
  ["PHY","powder",3,"n","fenmo","Sinitic"],
  ["PHY","north",2,"n","uttari","Austronesian"],
  ["PHY","south",2,"n","daksina","Indo-Aryan"],
  ["PHY","east",2,"n","masharika","Semitic"],
  ["PHY","west",2,"n","magharibi","Semitic"],
  ["PHY","hole / pit",2,"n","gaddhe","Indo-Aryan"],
  ["PHY","horizon",3,"n","ufukweni","Bantu"],
  ["PHY","peak / summit",2,"n","cotti","Indo-Aryan"],
  ["PHY","slope / hillside",3,"n","dhalan","Indo-Aryan"],
  ["PHY","current / flow",3,"n","pravaha","Indo-Aryan"],
  ["PHY","tide",3,"n","mawimbi","Bantu"],
  ["PHY","crystal",3,"n","sufatika","Indo-Aryan"],
  ["PHY","marble / stone-slab",3,"n","sangamarmar","Indo-Aryan"],
  ["PHY","clayware / pottery",3,"n","mataka","Indo-Aryan"],
  // ===== AGR — crops, plants, parts, farming =====
  ["AGR","crop / produce",2,"n","fasala","Semitic"],
  ["AGR","wheat",2,"n","gehu","Indo-Aryan"],
  ["AGR","barley",3,"n","shayiri","Semitic"],
  ["AGR","millet",3,"n","bajila","Indo-Aryan"],
  ["AGR","potato",2,"n","batata","Romance"],
  ["AGR","tomato",2,"n","tamatala","Romance"],
  ["AGR","onion",2,"n","piyaja","Indo-Aryan"],
  ["AGR","garlic",3,"n","kitunguu","Bantu"],
  ["AGR","ginger",3,"n","adraka","Indo-Aryan"],
  ["AGR","cabbage",3,"n","phulgobi","Indo-Aryan"],
  ["AGR","carrot",3,"n","gajara","Indo-Aryan"],
  ["AGR","cucumber",3,"n","timun","Austronesian"],
  ["AGR","pumpkin / gourd",3,"n","boga","Bantu"],
  ["AGR","banana",2,"n","kadali","Indo-Aryan"],
  ["AGR","mango",2,"n","ambaphal","Indo-Aryan"],
  ["AGR","coconut",2,"n","naliyala","Indo-Aryan"],
  ["AGR","orange (fruit)",2,"n","santara","Indo-Aryan"],
  ["AGR","lemon",3,"n","nimbu","Indo-Aryan"],
  ["AGR","apple",2,"n","seba","Indo-Aryan"],
  ["AGR","grape",3,"n","angula","Indo-Aryan"],
  ["AGR","melon",3,"n","tikiti","Bantu"],
  ["AGR","pineapple",3,"n","ananasa","Austronesian"],
  ["AGR","date (fruit)",3,"n","tende","Semitic"],
  ["AGR","olive",3,"n","saituni","Semitic"],
  ["AGR","sugarcane",2,"n","ganno","Indo-Aryan"],
  ["AGR","cotton",2,"n","pamba","Bantu"],
  ["AGR","bamboo",3,"n","wansa","Indo-Aryan"],
  ["AGR","bark (of tree)",2,"n","twaca","Indo-Aryan"],
  ["AGR","stem / stalk",2,"n","dantala","Indo-Aryan"],
  ["AGR","thorn",3,"n","kantaka","Indo-Aryan"],
  ["AGR","vine / creeper",3,"n","lataka","Indo-Aryan"],
  ["AGR","weed",3,"n","kharapatawa","Indo-Aryan"],
  ["AGR","field / cropland",2,"n","kheta","Indo-Aryan"],
  ["AGR","plough (v)",2,"v","yotana","Indo-Aryan"],
  ["AGR","fertilizer / manure",3,"n","mbolea","Bantu"],
  ["AGR","crop-harvest (n)",3,"n","upaja","Indo-Aryan"],
  // ===== ANI — mammals, birds, water creatures, insects, parts =====
  ["ANI","tiger",2,"n","harimau","Austronesian"],
  ["ANI","leopard",3,"n","duma","Bantu"],
  ["ANI","bear",2,"n","xiongmao","Sinitic"],
  ["ANI","wolf",2,"n","bediya","Indo-Aryan"],
  ["ANI","fox",3,"n","musang","Austronesian"],
  ["ANI","deer",2,"n","mbawala","Bantu"],
  ["ANI","rabbit / hare",2,"n","kharagosa","Indo-Aryan"],
  ["ANI","mouse / rat",2,"n","cucha","Indo-Aryan"],
  ["ANI","sheep",2,"n","menda","Indo-Aryan"],
  ["ANI","donkey",2,"n","gadaha","Indo-Aryan"],
  ["ANI","camel",2,"n","unta","Indo-Aryan"],
  ["ANI","buffalo",3,"n","baisa","Indo-Aryan"],
  ["ANI","giraffe",3,"n","twiga","Bantu"],
  ["ANI","crocodile",3,"n","magara","Indo-Aryan"],
  ["ANI","lizard",2,"n","kirikiti","Indo-Aryan"],
  ["ANI","frog / toad",2,"n","menduka","Indo-Aryan"],
  ["ANI","turtle / tortoise",3,"n","kobe","Bantu"],
  ["ANI","whale",3,"n","nyangumi","Bantu"],
  ["ANI","shark",3,"n","papako","Bantu"],
  ["ANI","crab",3,"n","kankda","Indo-Aryan"],
  ["ANI","duck",2,"n","batuka","Indo-Aryan"],
  ["ANI","eagle / hawk",2,"n","ukaba","Semitic"],
  ["ANI","owl",3,"n","bundi","Bantu"],
  ["ANI","crow / raven",3,"n","wuya","Sinitic"],
  ["ANI","pigeon / dove",2,"n","kabutala","Indo-Aryan"],
  ["ANI","parrot",3,"n","kasuku","Bantu"],
  ["ANI","peacock",3,"n","mora","Indo-Aryan"],
  ["ANI","bee",2,"n","nyuki","Bantu"],
  ["ANI","ant",2,"n","cinti","Indo-Aryan"],
  ["ANI","fly (insect)",2,"n","makhi","Indo-Aryan"],
  ["ANI","mosquito",2,"n","macala","Indo-Aryan"],
  ["ANI","butterfly",2,"n","tituli","Indo-Aryan"],
  ["ANI","spider",2,"n","buibui","Bantu"],
  ["ANI","worm",2,"n","kiruda","Indo-Aryan"],
  ["ANI","claw / talon",3,"n","nakha","Indo-Aryan"],
  ["ANI","fur / pelt",2,"n","manyoya","Bantu"],
  ["ANI","nest",2,"n","kiota","Bantu"],
  ["ANI","herd / flock",3,"n","yutha","Indo-Aryan"],
  ["ANI","cattle / livestock",2,"n","pasudana","Indo-Aryan"],
  ["ANI","beast / wild animal",2,"n","yangali","Indo-Aryan"],
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

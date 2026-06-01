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
  // ===== ACT — more everyday actions =====
  ["ACT","close / shut",2,"v","fungai","Bantu"],
  ["ACT","cover",2,"v","danka","Indo-Aryan"],
  ["ACT","fill",2,"v","balai","Indo-Aryan"],
  ["ACT","empty / pour out",2,"v","halia","Indo-Aryan"],
  ["ACT","pour",2,"v","mimina","Bantu"],
  ["ACT","mix / blend",2,"v","milana","Indo-Aryan"],
  ["ACT","stir",3,"v","kologa","Bantu"],
  ["ACT","squeeze / press",2,"v","dabana","Indo-Aryan"],
  ["ACT","fold",3,"v","kunai","Bantu"],
  ["ACT","bend",2,"v","modi","Indo-Aryan"],
  ["ACT","stretch",3,"v","tanai","Indo-Aryan"],
  ["ACT","twist",3,"v","maloda","Indo-Aryan"],
  ["ACT","shake (object)",3,"v","hilana","Indo-Aryan"],
  ["ACT","drop / let fall",2,"v","gilana","Indo-Aryan"],
  ["ACT","lift / raise",2,"v","utana","Indo-Aryan"],
  ["ACT","drag-pull (heavy)",3,"v","gasitai","Indo-Aryan"],
  ["ACT","catch / seize",2,"v","pakala","Indo-Aryan"],
  ["ACT","release / let go",2,"v","coda","Indo-Aryan"],
  ["ACT","tear / rip",2,"v","fala","Indo-Aryan"],
  ["ACT","scratch",3,"v","kunao","Indo-Aryan"],
  ["ACT","stab / pierce",3,"v","copana","Indo-Aryan"],
  ["ACT","bite",2,"v","umai","Bantu"],
  ["ACT","lick",3,"v","cata","Indo-Aryan"],
  ["ACT","blow",2,"v","pukai","Bantu"],
  ["ACT","suck",3,"v","cusa","Indo-Aryan"],
  ["ACT","kick",2,"v","teka","Bantu"],
  ["ACT","sweep",3,"v","fagia","Bantu"],
  ["ACT","wipe / clean off",3,"v","ponda","Indo-Aryan"],
  ["ACT","build / construct",2,"v","yenga","Bantu"],
  ["ACT","destroy / wreck",2,"v","nasai","Indo-Aryan"],
  ["ACT","repair / mend",2,"v","malai","Indo-Aryan"],
  ["ACT","measure-out / weigh",3,"v","tolai","Indo-Aryan"],
  ["ACT","count-out / tally",3,"v","gina","Indo-Aryan"],
  ["ACT","hide / conceal",2,"v","cupai","Indo-Aryan"],
  ["ACT","search / seek",2,"v","tafuta","Bantu"],
  ["ACT","find / discover",2,"v","patai","Bantu"],
  ["ACT","choose-pick",2,"v","cagua","Bantu"],
  ["ACT","collect / gather up",2,"v","kusana","Bantu"],
  ["ACT","share / distribute",2,"v","bantai","Indo-Aryan"],
  ["ACT","prepare / get ready",2,"v","tayalisa","Bantu"],
  ["ACT","arrange / order",3,"v","pangai","Bantu"],
  ["ACT","change / alter",2,"v","badili","Bantu"],
  ["ACT","add-to / increase",2,"v","ongesa","Bantu"],
  ["ACT","reduce / lessen",2,"v","pungusa","Bantu"],
  ["ACT","continue / keep on",2,"v","endelea","Bantu"],
  ["ACT","repeat / do again",2,"v","ludiai","Bantu"],
  ["ACT","wait",2,"v","subili","Bantu"],
  ["ACT","rest",2,"v","pumika","Bantu"],
  // ===== SOC — society, work, economy, governance =====
  ["SOC","work-job / occupation",2,"n","kasana","Bantu"],
  ["SOC","worker / labourer",2,"n","mania","Bantu"],
  ["SOC","master / boss",2,"n","banai","Bantu"],
  ["SOC","servant",3,"n","sewaka","Indo-Aryan"],
  ["SOC","slave",3,"n","gulama","Semitic"],
  ["SOC","wealth / riches",2,"n","mali","Semitic"],
  ["SOC","poverty",2,"n","umasini","Bantu"],
  ["SOC","rich / wealthy",2,"mod","tayili","Semitic"],
  ["SOC","poor / needy",2,"mod","masini","Semitic"],
  ["SOC","market / bazaar",2,"n","soko","Bantu"],
  ["SOC","goods / wares",3,"n","bidai","Bantu"],
  ["SOC","custom / tradition",2,"n","mila","Bantu"],
  ["SOC","festival / holiday",2,"n","tohala","Indo-Aryan"],
  ["SOC","meeting / assembly",2,"n","mutano","Bantu"],
  ["SOC","council / committee",3,"n","balasa","Bantu"],
  ["SOC","nation / people",2,"n","taifa","Semitic"],
  ["SOC","citizen-subject",3,"n","laiyati","Semitic"],
  ["SOC","border-of-state",3,"n","maka","Bantu"],
  ["SOC","king-rule / kingdom",3,"n","ufalume","Bantu"],
  ["SOC","chief / headman",2,"n","muku","Bantu"],
  ["SOC","judge (person)",2,"n","yayi","Semitic"],
  ["SOC","court (law)",3,"n","mahakama","Semitic"],
  ["SOC","punishment / penalty",2,"n","adabu","Semitic"],
  ["SOC","prison / jail",2,"n","gelesa","Bantu"],
  ["SOC","duty / obligation",2,"n","wayibu","Semitic"],
  ["SOC","help-aid / service",3,"n","huduma","Bantu"],
  ["SOC","gift / present",2,"n","sawadi","Bantu"],
  ["SOC","message / news-item",2,"n","uyume","Bantu"],
  ["SOC","secret-society / faith group",3,"n","yumuiya","Bantu"],
  ["SOC","class / rank",3,"n","tabakai","Semitic"],
  // ===== DWE/FOO/CLO — more material life =====
  ["DWE","kitchen",2,"n","yikoni","Bantu"],
  ["DWE","toilet / bathroom",2,"n","cooni","Bantu"],
  ["DWE","ceiling",3,"n","dalio","Indo-Aryan"],
  ["DWE","fence / hedge",3,"n","uzio","Bantu"],
  ["DWE","gate",2,"n","lango","Bantu"],
  ["DWE","shelf",3,"n","lafu","Bantu"],
  ["DWE","drawer",3,"n","dalasa","Bantu"],
  ["DWE","cupboard / cabinet",3,"n","kabati","Bantu"],
  ["DWE","bucket",2,"n","balti","Indo-Aryan"],
  ["DWE","broom",3,"n","ufagio","Bantu"],
  ["DWE","blanket",2,"n","banketi","Romance"],
  ["DWE","towel",3,"n","taulo","Romance"],
  ["DWE","fork (utensil)",2,"n","umao","Bantu"],
  ["DWE","pot / pan",2,"n","sufulia","Bantu"],
  ["DWE","kettle",3,"n","bilika","Bantu"],
  ["DWE","jar / pot",3,"n","gudu","Indo-Aryan"],
  ["DWE","nail (metal)",3,"n","misumali","Bantu"],
  ["DWE","hammer",3,"n","nundo","Bantu"],
  ["DWE","saw (tool)",3,"n","mumeno","Bantu"],
  ["DWE","needle-tool / pin",3,"n","pini","Romance"],
  ["FOO","meat-dish / curry",3,"n","musio","Bantu"],
  ["FOO","porridge / gruel",3,"n","ugali","Bantu"],
  ["FOO","flour-dough",3,"n","unga","Bantu"],
  ["FOO","fruit-juice / drink",2,"n","yusi","Romance"],
  ["FOO","spice / seasoning",2,"n","masalai","Indo-Aryan"],
  ["FOO","vinegar",3,"n","sila","Indo-Aryan"],
  ["FOO","butter",3,"n","mahana","Indo-Aryan"],
  ["FOO","egg-dish / omelette",3,"n","kimanda","Bantu"],
  ["FOO","feast / banquet",3,"n","kalamu","Bantu"],
  ["FOO","hunger / famine",2,"n","njala","Bantu"],
  ["CLO","dress / gown",2,"n","gauni","Romance"],
  ["CLO","skirt",3,"n","setia","Romance"],
  ["CLO","belt",3,"n","manda","Bantu"],
  ["CLO","glove",3,"n","gawua","Romance"],
  ["CLO","sock / stocking",3,"n","soki","Romance"],
  ["CLO","scarf / veil",3,"n","leso","Bantu"],
  ["CLO","collar",3,"n","ukosi","Bantu"],
  ["CLO","sleeve",3,"n","monoa","Bantu"],
  ["CLO","cloth-wrap / robe",2,"n","kangai","Bantu"],
  ["CLO","jewellery / ornament",3,"n","palata","Indo-Aryan"],
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

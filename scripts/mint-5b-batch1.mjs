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
  // ===== PEOPLE / SOCIAL / MIND =====
  // KIN — kinship & people
  ["KIN","grandmother",2,"n","bibi","Bantu"],
  ["KIN","grandfather",2,"n","babu","Bantu"],
  ["KIN","baby / infant",2,"n","bayi","Austronesian"],
  ["KIN","adult",2,"n","dewasa","Austronesian"],
  ["KIN","family",2,"n","famili","Austronesian"],
  ["KIN","ancestor",3,"n","nasaba","Bantu"],
  ["KIN","neighbour",2,"n","tetangga","Austronesian"],
  ["KIN","guest",2,"n","tamu","Austronesian"],
  ["KIN","enemy",2,"n","adui","Bantu"],
  ["KIN","self / oneself",2,"n","diri","Austronesian"],
  ["KIN","tribe / clan",3,"n","kabila","Bantu"],
  ["KIN","member",3,"n","anggota","Austronesian"],
  // SOC — social & political
  ["SOC","society",3,"n","shakai","Japonic"],
  ["SOC","king / ruler",2,"n","falme","Bantu"],
  ["SOC","citizen",3,"n","warga","Austronesian"],
  ["SOC","law",2,"n","sheria","Bantu"],
  ["SOC","rule",2,"n","aturan","Austronesian"],
  ["SOC","right / entitlement",3,"n","haki","Bantu"],
  ["SOC","freedom",2,"n","merdeka","Austronesian"],
  ["SOC","peace",2,"n","amani","Bantu"],
  ["SOC","crime",3,"n","tsumi","Japonic"],
  ["SOC","police",3,"n","polisi","international"],
  ["SOC","soldier",2,"n","tentara","Austronesian"],
  ["SOC","army",3,"n","guntai","Japonic"],
  ["SOC","religion",2,"n","agama","Austronesian"],
  ["SOC","god / deity",2,"n","tuhan","Austronesian"],
  ["SOC","spirit / soul",2,"n","jiwa","Austronesian"],
  ["SOC","history",3,"n","tarihi","Bantu"],
  ["SOC","culture",3,"n","budaya","Austronesian"],
  ["SOC","power / authority",2,"n","kuasa","Austronesian"],
  ["SOC","tax",3,"n","kodi","Bantu"],
  ["SOC","trade / commerce",2,"n","dagang","Austronesian"],
  ["SOC","village",2,"n","kijiji","Bantu"],
  // EMO — emotion & value
  ["EMO","hope",2,"v","tumaini","Bantu"],
  ["EMO","worry / anxiety",2,"v","kawatir","Austronesian"],
  ["EMO","surprise",2,"v","odoroku","Japonic"],
  ["EMO","shame",2,"n","haji","Japonic"],
  ["EMO","proud / pride",2,"mod","bangga","Austronesian"],
  ["EMO","hate",2,"v","nikumu","Japonic"],
  ["EMO","calm",2,"mod","shizuka","Japonic"],
  ["EMO","tired",2,"mod","lelah","Austronesian"],
  ["EMO","pain / hurt",2,"n","sakit","Austronesian"],
  ["EMO","brave",2,"mod","berani","Austronesian"],
  ["EMO","patience",3,"n","subira","Bantu"],
  ["EMO","lonely",2,"mod","sabishii","Japonic"],
  ["EMO","jealousy / envy",3,"n","wivu","Bantu"],
  ["EMO","feeling / emotion",2,"n","hisia","Bantu"],
  // COG — cognition
  ["COG","wise / wisdom",2,"mod","hekima","Bantu"],
  ["COG","doubt",2,"v","ragu","Austronesian"],
  ["COG","decide",2,"v","kimeru","Japonic"],
  ["COG","choose",2,"v","pilih","Austronesian"],
  ["COG","dream",2,"n","yume","Japonic"],
  ["COG","notice / realise",2,"v","kizuku","Japonic"],
  ["COG","mistake / error",2,"n","machigai","Japonic"],
  ["COG","problem",2,"n","masalah","Austronesian"],
  ["COG","ability / skill",2,"n","uwezo","Bantu"],
  ["COG","can / be able",1,"v","bisa","Austronesian"],
  ["COG","must / have to",1,"v","lazima","Bantu"],
  ["COG","try / attempt",2,"v","coba","Austronesian"],
  // SPE — speech & language
  ["SPE","story",2,"n","cerita","Austronesian"],
  ["SPE","news",2,"n","berita","Austronesian"],
  ["SPE","voice",2,"n","koe","Japonic"],
  ["SPE","letter / mail",2,"n","tegami","Japonic"],
  ["SPE","promise",2,"v","yakusoku","Japonic"],
  ["SPE","lie / falsehood",2,"n","uso","Japonic"],
  ["SPE","call / shout",2,"v","yobu","Japonic"],
  ["SPE","sing",2,"v","utau","Japonic"],
  ["SPE","song",2,"n","wimbo","Bantu"],
  ["SPE","sentence",3,"n","kalimat","Austronesian"],
  ["SPE","sign / mark",2,"n","tanda","Austronesian"],
  ["SPE","letter / character",3,"n","moji","Japonic"],
  ["SPE","agree",2,"v","setuju","Austronesian"],
  ["SPE","refuse / reject",2,"v","tolak","Austronesian"],

  // ===== EVERYDAY / MATERIAL LIFE =====
  // FOO — food & drink
  ["FOO","meal",2,"n","shokuji","Japonic"],
  ["FOO","tea",2,"n","cha","Sinitic"],
  ["FOO","coffee",2,"n","kopi","Austronesian"],
  ["FOO","alcohol / liquor",2,"n","sake","Japonic"],
  ["FOO","sugar",2,"n","gula","Austronesian"],
  ["FOO","flour",2,"n","kona","Japonic"],
  ["FOO","vegetable",2,"n","sayur","Austronesian"],
  ["FOO","cheese",3,"n","keju","Austronesian"],
  ["FOO","soup",2,"n","supu","Bantu"],
  ["FOO","pepper / chili",2,"n","pilipili","Bantu"],
  ["FOO","honey",2,"n","asali","Bantu"],
  ["FOO","plate / dish",2,"n","piring","Austronesian"],
  ["FOO","cup",2,"n","kikombe","Bantu"],
  ["FOO","bottle",2,"n","chupa","Bantu"],
  ["FOO","spoon",2,"n","kijiko","Bantu"],
  ["FOO","hungry",2,"mod","lapar","Austronesian"],
  ["FOO","thirsty",2,"mod","haus","Austronesian"],
  ["FOO","delicious / tasty",2,"mod","oisii","Japonic"],
  ["FOO","bitter",2,"mod","nigai","Japonic"],
  ["FOO","sour",2,"mod","suppai","Japonic"],
  ["FOO","fresh",2,"mod","segar","Austronesian"],
  // ANI — animals (everyday/food-adjacent)
  ["ANI","chicken",2,"n","niwatoli","Japonic"],
  ["ANI","pig",2,"n","buta","Japonic"],
  ["ANI","goat",2,"n","buzi","Bantu"],
  ["ANI","snake",2,"n","ular","Austronesian"],
  ["ANI","insect / bug",2,"n","mushi","Japonic"],
  ["ANI","lion",2,"n","singa","Austronesian"],
  ["ANI","elephant",2,"n","gajah","Austronesian"],
  ["ANI","monkey",2,"n","saru","Japonic"],
  // CLO — clothing
  ["CLO","shirt",2,"n","kemeja","Austronesian"],
  ["CLO","trousers / pants",2,"n","celana","Austronesian"],
  ["CLO","hat",2,"n","topi","Austronesian"],
  ["CLO","jacket / coat",2,"n","jaket","international"],
  ["CLO","button",2,"n","botan","Japonic"],
  ["CLO","pocket",2,"n","saku","Austronesian"],
  ["CLO","cloth / fabric",2,"n","kitambaa","Bantu"],
  ["CLO","thread",2,"n","ito","Japonic"],
  ["CLO","needle",2,"n","hari","Japonic"],
  ["CLO","sew",2,"v","shona","Bantu"],
  ["CLO","ring",2,"n","yubiwa","Japonic"],
  ["CLO","bag",2,"n","mfuko","Bantu"],
  // DWE — dwelling & artefacts
  ["DWE","room",2,"n","kamar","Austronesian"],
  ["DWE","wall",2,"n","dinding","Austronesian"],
  ["DWE","window",2,"n","jendela","Austronesian"],
  ["DWE","floor",2,"n","yuka","Japonic"],
  ["DWE","stairs",2,"n","kaidan","Japonic"],
  ["DWE","chair",2,"n","isu","Japonic"],
  ["DWE","lamp",2,"n","lampu","Austronesian"],
  ["DWE","key",2,"n","kagi","Japonic"],
  ["DWE","mirror",2,"n","kagami","Japonic"],
  ["DWE","box",2,"n","sanduku","Bantu"],
  ["DWE","basket",2,"n","kikapu","Bantu"],
  ["DWE","pillow",2,"n","makura","Japonic"],
  ["DWE","soap",2,"n","sabuni","Bantu"],
  ["DWE","candle",3,"n","shumaa","Bantu"],
  ["DWE","clock / watch",2,"n","tokei","Japonic"],
  ["DWE","garden / yard",2,"n","kebun","Austronesian"],
  ["DWE","building",2,"n","tatemono","Japonic"],
  ["DWE","mat",2,"n","mkeka","Bantu"],
  // AGR — plants & farming
  ["AGR","farm / field",2,"n","noen","Japonic"],
  ["AGR","forest",2,"n","hutan","Austronesian"],
  ["AGR","harvest",2,"n","panen","Austronesian"],
  ["AGR","branch",2,"n","eda","Japonic"],
  ["AGR","bean",2,"n","mame","Japonic"],
  ["AGR","maize / corn",2,"n","mahindi","Bantu"],
  ["AGR","mushroom",2,"n","kinoko","Japonic"],
  ["AGR","sow / plant (v)",2,"v","panda","Bantu"],

  // ===== MODERN / TECH / CIVIC (tier 3 internationalisms allowed, 0003 §7b) =====
  ["MOD","bridge",2,"n","hashi","Japonic"],
  ["MOD","station",3,"n","eki","Japonic"],
  ["MOD","factory",3,"n","kojo","Japonic"],
  ["MOD","shop / store",2,"n","mise","Japonic"],
  ["MOD","hotel",3,"n","hoteru","international"],
  ["MOD","bank",3,"n","bank","international"],
  ["MOD","office",3,"n","kantor","Austronesian"],
  ["MOD","ticket",3,"n","kippu","Japonic"],
  ["MOD","map",2,"n","chizu","Japonic"],
  ["MOD","picture / image",2,"n","pica","Bantu"],
  ["MOD","music",2,"n","musik","international"],
  ["MOD","art",3,"n","seni","Austronesian"],
  ["MOD","film / movie",3,"n","eiga","Japonic"],
  ["MOD","camera",3,"n","kamera","international"],
  ["MOD","television",3,"n","terebi","international"],
  ["MOD","radio",3,"n","radio","international"],
  ["MOD","newspaper",3,"n","shinbun","Japonic"],
  ["MOD","science",3,"n","kagaku","Japonic"],
  ["MOD","energy",3,"n","tenaga","Austronesian"],
  ["MOD","engine / motor",3,"n","enjin","international"],
  ["MOD","wheel",2,"n","roda","Austronesian"],
  ["MOD","price / cost",2,"n","nedan","Japonic"],
  ["MOD","company / firm",3,"n","kaisha","Japonic"],
  ["MOD","plan / project",2,"n","rencana","Austronesian"],
  ["MOD","result / outcome",2,"n","hasil","Austronesian"],
  ["MOD","aeroplane",3,"n","hikoki","Japonic"],
  ["MOD","ship / boat",2,"n","fune","Japonic"],
  ["MOD","bicycle",3,"n","baisikeli","Bantu"],
  // TIM — a couple of high-frequency time units
  ["TIM","minute",2,"n","menit","Austronesian"],
  ["TIM","season",2,"n","kisetsu","Japonic"],
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

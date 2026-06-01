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
  // ===== PROP — abstract properties (lean Romance/Indo-Aryan/Sinitic) =====
  ["PROP","important",2,"mod","muhimu","Bantu"],
  ["PROP","necessary",2,"mod","necesa","Romance"],
  ["PROP","possible",2,"mod","posible","Romance"],
  ["PROP","useful",2,"mod","utile","Romance"],
  ["PROP","difficult",2,"mod","katina","Indo-Aryan"],
  ["PROP","simple / easy",2,"mod","sahala","Bantu"],
  ["PROP","dangerous",2,"mod","hatari","Bantu"],
  ["PROP","safe",2,"mod","salama","Bantu"],
  ["PROP","strange / odd",2,"mod","ajabu","Semitic"],
  ["PROP","common / usual",2,"mod","kawaida","Semitic"],
  ["PROP","normal",2,"mod","normale","Romance"],
  ["PROP","real / actual",2,"mod","kweli","Bantu"],
  ["PROP","certain / sure",2,"mod","yakini","Semitic"],
  ["PROP","main / chief",2,"mod","mukhya","Indo-Aryan"],
  ["PROP","whole / entire",2,"mod","sampulna","Indo-Aryan"],
  ["PROP","double",2,"mod","dubla","Romance"],
  ["PROP","busy",2,"mod","masulo","Indo-Aryan"],
  ["PROP","ready",2,"mod","tayari","Bantu"],
  ["PROP","serious",2,"mod","gambhila","Indo-Aryan"],
  ["PROP","clear / obvious",2,"mod","spasta","Indo-Aryan"],
  ["PROP","secret / hidden",2,"mod","siri","Bantu"],
  ["PROP","public",2,"mod","publiko","Romance"],
  ["PROP","general",2,"mod","henela","Romance"],
  ["PROP","special",2,"mod","khaso","Indo-Aryan"],
  ["PROP","basic / fundamental",2,"mod","mula","Indo-Aryan"],
  ["PROP","total / entire",2,"mod","kabisa","Bantu"],
  ["PROP","extra / spare",2,"mod","ziyada","Semitic"],
  ["PROP","ordinary",2,"mod","samanya","Indo-Aryan"],
  ["PROP","similar / alike",2,"mod","sadrisa","Indo-Aryan"],
  ["PROP","opposite / reverse",2,"mod","kinyume","Bantu"],
  ["PROP","equal",2,"mod","sawa","Bantu"],
  ["PROP","fair / just",2,"mod","adili","Semitic"],
  ["PROP","honest",2,"mod","mwaminifu","Bantu"],
  ["PROP","rare",2,"mod","nadira","Semitic"],
  ["PROP","modern",2,"mod","moderno","Romance"],
  ["PROP","ancient / old",2,"mod","kadimu","Semitic"],
  ["PROP","natural",2,"mod","naturale","Romance"],
  ["PROP","useless / vain",2,"mod","bekala","Indo-Aryan"],
  ["PROP","precious / valuable",2,"mod","thamani","Bantu"],
  ["PROP","famous",2,"mod","mashuhuli","Semitic"],
  ["PROP","complete / finished",2,"mod","kamili","Semitic"],
  ["PROP","sharp-witted / clever",2,"mod","calaku","Indo-Aryan"],
  ["PROP","stupid / foolish",2,"mod","mupumba","Bantu"],
  ["PROP","brief / temporary",2,"mod","kshanika","Indo-Aryan"],
  ["PROP","main-real / genuine",3,"mod","aslia","Semitic"],
  ["PROP","flexible / soft",3,"mod","lacila","Indo-Aryan"],
  ["PROP","rigid / stiff",3,"mod","kathora","Indo-Aryan"],
  ["PROP","steady / stable",2,"mod","sutila","Indo-Aryan"],
  ["PROP","sudden",2,"mod","acanaka","Indo-Aryan"],
  ["PROP","gradual / slow",3,"mod","talela","Romance"],
  // ===== COG — cognition (lean Indo-Aryan/Romance/Sinitic) =====
  ["COG","imagine",2,"v","kalpana","Indo-Aryan"],
  ["COG","guess / estimate",2,"v","andasa","Indo-Aryan"],
  ["COG","plan / arrange",2,"v","yoyana","Indo-Aryan"],
  ["COG","compare",2,"v","kompala","Romance"],
  ["COG","judge / weigh",2,"v","hukumu","Semitic"],
  ["COG","intend / aim",2,"v","kusudia","Semitic"],
  ["COG","expect / await",2,"v","tegemea","Bantu"],
  ["COG","assume / suppose",2,"v","manana","Indo-Aryan"],
  ["COG","conclude / decide",2,"v","decidi","Romance"],
  ["COG","focus / concentrate",2,"v","cuyili","Sinitic"],
  ["COG","confuse / muddle",2,"v","canganya","Bantu"],
  ["COG","consider / ponder",2,"v","considela","Romance"],
  ["COG","examine / analyze",2,"v","cunguza","Bantu"],
  ["COG","predict / foretell",2,"v","yuce","Sinitic"],
  ["COG","prove / verify",2,"v","tibita","Bantu"],
  ["COG","solve / resolve",2,"v","sulisa","Bantu"],
  ["COG","interpret / explain",2,"v","fasili","Semitic"],
  ["COG","convince / persuade",2,"v","sadiki","Semitic"],
  ["COG","knowledge",2,"n","pragya","Indo-Aryan"],
  ["COG","opinion / view",2,"n","abhipraya","Indo-Aryan"],
  ["COG","purpose / goal",2,"n","lengo","Bantu"],
  ["COG","intention",2,"n","sankalpa","Indo-Aryan"],
  ["COG","attention",2,"n","atensi","Romance"],
  ["COG","memory",2,"n","smriti","Indo-Aryan"],
  ["COG","concept / notion",2,"n","dharana","Indo-Aryan"],
  ["COG","theory",2,"n","nadaria","Semitic"],
  ["COG","logic / reason",2,"n","loyika","Romance"],
  ["COG","proof / evidence",2,"n","dalili","Semitic"],
  ["COG","wisdom",2,"n","viveka","Indo-Aryan"],
  ["COG","curiosity",2,"n","udadisi","Bantu"],
  ["COG","skill / expertise",2,"n","ustadi","Semitic"],
  ["COG","method / way",2,"n","paddhati","Indo-Aryan"],
  ["COG","truth",2,"n","sacai","Indo-Aryan"],
  ["COG","secret / mystery",3,"n","silia","Semitic"],
  // ===== QTY — quantity & measure (lean Romance/Indo-Aryan) =====
  ["QTY","weight",2,"n","usito","Bantu"],
  ["QTY","length",2,"n","lambai","Austronesian"],
  ["QTY","width",2,"n","upana","Bantu"],
  ["QTY","height / tallness",2,"n","kimo","Bantu"],
  ["QTY","measure / gauge",2,"v","pima","Bantu"],
  ["QTY","amount / quantity",2,"n","parimana","Indo-Aryan"],
  ["QTY","add / sum",2,"v","yoda","Indo-Aryan"],
  ["QTY","subtract / remove",2,"v","ghatana","Indo-Aryan"],
  ["QTY","multiply",2,"v","gunita","Indo-Aryan"],
  ["QTY","divide / split",2,"v","taksima","Semitic"],
  ["QTY","pair / couple",2,"n","yodi","Indo-Aryan"],
  ["QTY","dozen",3,"n","dosena","Romance"],
  ["QTY","percent",2,"n","pasento","Romance"],
  ["QTY","average / mean",3,"n","wasita","Semitic"],
  ["QTY","degree / level",2,"n","daraja","Semitic"],
  ["QTY","quarter / fourth",2,"n","cauthai","Indo-Aryan"],
  ["QTY","majority / most",2,"n","wengi","Bantu"],
  ["QTY","limit / bound",2,"n","mipaka","Bantu"],
  ["QTY","total / sum",2,"n","yumula","Semitic"],
  ["QTY","gram",3,"n","gramu","Romance"],
  ["QTY","meter (unit)",3,"n","mita","Romance"],
  ["QTY","liter",3,"n","lita","Romance"],
  ["QTY","kilo / kilogram",3,"n","kilo","Romance"],
  ["QTY","dose / portion",3,"n","hissa","Semitic"],
  // ===== TIM — time (lean Romance/Indo-Aryan) =====
  ["TIM","future",2,"n","banaya","Indo-Aryan"],
  ["TIM","past / bygone",2,"n","atita","Indo-Aryan"],
  ["TIM","present / current",2,"mod","watamana","Indo-Aryan"],
  ["TIM","moment / instant",2,"n","nimisa","Indo-Aryan"],
  ["TIM","period / phase",2,"n","kipindi","Bantu"],
  ["TIM","era / age",2,"n","kalayuga","Indo-Aryan"],
  ["TIM","dawn / daybreak",2,"n","alfayili","Semitic"],
  ["TIM","dusk / twilight",2,"n","gosani","Indo-Aryan"],
  ["TIM","schedule / timetable",2,"n","latiba","Semitic"],
  ["TIM","delay / lateness",2,"n","celewa","Bantu"],
  ["TIM","calendar",2,"n","kalenda","Romance"],
  ["TIM","century",3,"n","sekulo","Romance"],
  ["TIM","decade",3,"n","dasaka","Indo-Aryan"],
  ["TIM","duration / span",2,"n","avadhi","Indo-Aryan"],
  ["TIM","frequency / rate",3,"n","barambar","Indo-Aryan"],
  ["TIM","midnight",2,"n","manane","Bantu"],
  ["TIM","midday / noon",2,"n","yohali","Semitic"],
  ["TIM","stage / step",2,"n","carana","Indo-Aryan"],
  ["TIM","recently / lately",2,"mod","halini","Semitic"],
  ["TIM","constantly / ever",3,"mod","nitya","Indo-Aryan"],
  // ===== SPA — spatial / relational (lean Romance/Indo-Aryan) =====
  ["SPA","between / among",2,"n","kati","Bantu"],
  ["SPA","around / about",2,"n","calupasa","Indo-Aryan"],
  ["SPA","through / via",2,"n","katika","Bantu"],
  ["SPA","across / opposite",2,"n","palele","Indo-Aryan"],
  ["SPA","beyond / past",2,"n","pale","Indo-Aryan"],
  ["SPA","against / facing",2,"n","sammukha","Indo-Aryan"],
  ["SPA","edge / rim",2,"n","kingo","Bantu"],
  ["SPA","corner / angle",2,"n","pembe","Bantu"],
  ["SPA","gap / space",2,"n","antara","Indo-Aryan"],
  ["SPA","direction",2,"n","disa","Indo-Aryan"],
  ["SPA","layer / level",2,"n","tabaka","Semitic"],
  ["SPA","border / boundary",2,"n","sima","Indo-Aryan"],
  ["SPA","distance",2,"n","dula","Indo-Aryan"],
  ["SPA","region / area",2,"n","pradesa","Indo-Aryan"],
  ["SPA","zone / belt",3,"n","kanda","Bantu"],
  ["SPA","row / line",2,"n","safu","Bantu"],
  ["SPA","position / spot",2,"n","yaga","Indo-Aryan"],
  ["SPA","slope / incline",3,"n","tegemeo","Bantu"],
  ["SPA","top / summit",2,"n","kilele","Bantu"],
  ["SPA","bottom / base",2,"n","cini","Indo-Aryan"],
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

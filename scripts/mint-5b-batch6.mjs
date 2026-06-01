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
  ["EMO","grief / sorrow",2,"n","luto","Romance"],
  ["EMO","pity / compassion",2,"n","pieda","Romance"],
  ["EMO","relief",2,"n","aliwio","Romance"],
  ["EMO","disgust",2,"n","asako","Japonic"],
  ["EMO","trust",2,"n","tikai","Semitic"],
  ["EMO","comfort / solace",2,"n","conolo","Romance"],
  ["EMO","longing / yearning",2,"n","saudade","Romance"],
  ["EMO","gratitude",2,"n","gacia","Romance"],
  ["EMO","regret / remorse",2,"n","nadama","Semitic"],
  ["EMO","courage",2,"n","sayai","Semitic"],
  ["EMO","despair",2,"n","yaisu","Semitic"],
  ["EMO","joy / delight",2,"n","gioia","Romance"],
  ["EMO","anger / wrath",2,"n","ganabu","Semitic"],
  ["EMO","calmness / serenity",2,"n","sukunai","Semitic"],
  ["EMO","loneliness",3,"n","soledade","Romance"],
  ["EMO","boredom",3,"n","noia","Romance"],
  ["EMO","excitement",2,"n","emosione","Romance"],
  ["EMO","contentment",2,"n","manoku","Japonic"],
  ["EMO","affection / fondness",2,"n","aiyo","Japonic"],
  ["EMO","desire / craving",2,"n","deseo","Romance"],
  ["EMO","disappointment",3,"n","desilusione","Romance"],
  ["EMO","frustration",3,"n","ihatu","Semitic"],
  ["EMO","sympathy",2,"n","kokan","Japonic"],
  ["EMO","amazement / awe",3,"n","ihan","Semitic"],
  ["EMO","confidence / self-assurance",2,"n","fiducia","Romance"],
  ["EMO","resentment / grudge",3,"n","ulami","Japonic"],
  ["EMO","tenderness",3,"n","telula","Romance"],
  ["EMO","enthusiasm / zeal",3,"n","hamasa","Semitic"],
  ["EMO","comfort / console",2,"v","conolale","Romance"],
  ["EMO","enjoy",2,"v","godele","Romance"],
  ["EMO","suffer",2,"v","sufile","Romance"],
  ["EMO","cheerful",2,"mod","alege","Romance"],
  ["EMO","gloomy / glum",3,"mod","cupo","Romance"],
  ["EMO","anxious / nervous",2,"mod","anioso","Romance"],
  ["EMO","eager / keen",3,"mod","neso","Semitic"],
  ["COG","reason / intellect",2,"n","akilu","Semitic"],
  ["COG","intelligence",2,"n","inteliyena","Romance"],
  ["COG","judgment",2,"n","handan","Sinitic"],
  ["COG","intuition / hunch",3,"n","cokan","Japonic"],
  ["COG","assumption",3,"n","suposisione","Romance"],
  ["COG","conclusion",3,"n","concusione","Romance"],
  ["COG","belief / conviction",2,"n","cena","Romance"],
  ["COG","conscience",3,"n","damilu","Semitic"],
  ["COG","imagination",2,"n","imayinasione","Romance"],
  ["COG","understand-grasp",2,"v","capile","Romance"],
  ["COG","comprehend / fathom",3,"v","likai","Japonic"],
  ["COG","ponder / reflect",2,"v","kangae","Japonic"],
  ["COG","recall / recollect",2,"v","omoidasu","Japonic"],
  ["COG","perceive / discern",2,"v","pelipi","Romance"],
  ["COG","recognize",2,"v","leconose","Romance"],
  ["COG","suspect",3,"v","soseta","Romance"],
  ["COG","analyze / break-down",2,"v","buneki","Japonic"],
  ["COG","distinguish / tell apart",3,"v","kubesu","Japonic"],
  ["COG","aware / conscious",2,"mod","conapewole","Romance"],
  ["COG","rational / logical",3,"mod","lasionale","Romance"],
  ["SPE","greeting",2,"n","salutu","Romance"],
  ["SPE","conversation / talk",2,"n","cosa","Sinitic"],
  ["SPE","argument / quarrel",2,"n","litiyo","Romance"],
  ["SPE","announcement",3,"n","anunio","Romance"],
  ["SPE","declaration",3,"n","sengen","Japonic"],
  ["SPE","report / account",2,"n","lapolu","Austronesian"],
  ["SPE","explanation",2,"n","setumei","Japonic"],
  ["SPE","reply / response",2,"n","heni","Japonic"],
  ["SPE","rumor / gossip",3,"n","uwasa","Japonic"],
  ["SPE","dialect / accent",3,"n","fanen","Sinitic"],
  ["SPE","translation",3,"n","honaku","Japonic"],
  ["SPE","summary",3,"n","yoyaku","Japonic"],
  ["SPE","greet",2,"v","saluta","Romance"],
  ["SPE","invite",2,"v","inita","Romance"],
  ["SPE","thank-someone",2,"v","lingasia","Romance"],
  ["SPE","apologize",2,"v","ayamalu","Japonic"],
  ["SPE","praise / commend",2,"v","lodai","Romance"],
  ["SPE","blame / accuse",2,"v","inola","Romance"],
  ["SPE","forgive / pardon",2,"v","yulusu","Japonic"],
  ["SPE","advise",2,"v","conilia","Romance"],
  ["SPE","warn",2,"v","keikoku","Japonic"],
  ["SPE","complain",2,"v","kucu","Japonic"],
  ["SPE","joke",2,"v","yodan","Japonic"],
  ["SPE","discuss",2,"v","gilon","Sinitic"],
  ["SPE","describe",2,"v","desibe","Romance"],
  ["SPE","whisper",3,"v","sasayaku","Japonic"],
  ["SPE","spell / spell out",3,"v","silaba","Romance"],
  ["SPE","insult / offend",3,"v","busula","Romance"],
  ["SPE","boast / brag",3,"v","yiman","Japonic"],
  ["SPE","negotiate",3,"v","kosoa","Japonic"],
  ["SPE","fluent / eloquent",3,"mod","fasaha","Semitic"],
  ["SPE","polite / courteous",2,"mod","colese","Romance"],
  ["POS","ownership / property",2,"n","poseso","Romance"],
  ["POS","debt",2,"n","deuda","Romance"],
  ["POS","profit / gain",2,"n","libun","Semitic"],
  ["POS","loss",2,"n","pelitai","Romance"],
  ["POS","budget",3,"n","yosan","Japonic"],
  ["POS","value / worth",2,"n","walole","Romance"],
  ["POS","exchange / swap",2,"n","kokana","Japonic"],
  ["POS","rent / lease",3,"n","yacin","Japonic"],
  ["POS","fee / charge",3,"n","tasa","Romance"],
  ["POS","fortune / asset",3,"n","saisan","Japonic"],
  ["POS","coin",3,"n","moneda","Romance"],
  ["POS","wage / salary",2,"n","kulo","Japonic"],
  ["POS","own / possess",2,"v","poside","Romance"],
  ["POS","lend",2,"v","kasua","Japonic"],
  ["POS","borrow",2,"v","kalile","Romance"],
  ["POS","owe",2,"v","debe","Romance"],
  ["POS","spend",2,"v","gasa","Romance"],
  ["POS","waste / squander",2,"v","sekai","Romance"],
  ["POS","earn",2,"v","kasegu","Japonic"],
  ["POS","cost / be priced",2,"v","kosa","Romance"],
  ["POS","invest",3,"v","tosi","Japonic"],
  ["POS","cheap / inexpensive",2,"mod","balato","Romance"],
  ["POS","expensive / costly",2,"mod","takaia","Japonic"],
  ["POS","free / no-cost",2,"mod","mulo","Japonic"],
  ["POS","valuable / worthy",2,"mod","balioso","Romance"],
  ["KIN","stranger",2,"n","sukonosino","Romance"],
  ["KIN","partner / companion",2,"n","comano","Romance"],
  ["KIN","colleague / coworker",2,"n","dolo","Japonic"],
  ["KIN","rival / competitor",2,"n","laibalu","Japonic"],
  ["KIN","follower / disciple",2,"n","tabai","Austronesian"],
  ["KIN","expert / specialist",2,"n","senonka","Japonic"],
  ["KIN","beginner / novice",2,"n","sosina","Japonic"],
  ["KIN","witness",2,"n","sahidu","Semitic"],
  ["KIN","owner / proprietor",2,"n","dueno","Romance"],
  ["KIN","employee / staff",2,"n","yugoin","Japonic"],
  ["KIN","crowd / throng",2,"n","gunu","Sinitic"],
  ["KIN","individual",2,"n","koyin","Japonic"],
  ["KIN","generation",2,"n","sedai","Japonic"],
  ["KIN","youth / young person",2,"n","sababua","Semitic"],
  ["KIN","elder / senior",2,"n","sinin","Sinitic"],
  ["KIN","hero",2,"n","eiyusi","Japonic"],
  ["KIN","fool / idiot",2,"n","bakao","Japonic"],
  ["KIN","liar",2,"n","busiadolo","Romance"],
  ["KIN","ally",3,"n","domei","Japonic"],
  ["KIN","opponent / adversary",3,"n","aite","Japonic"],
  ["KIN","apprentice / trainee",3,"n","desi","Japonic"],
  ["KIN","customer / client",2,"n","kaku","Japonic"],
  ["KIN","twin",3,"n","futago","Japonic"],
  ["KIN","orphan",3,"n","yatima","Semitic"],
  ["KIN","widow",3,"n","wiuda","Romance"],
  ["SOC","honour / dignity",2,"n","onole","Romance"],
  ["SOC","respect / esteem",2,"n","ihila","Semitic"],
  ["SOC","fame / renown",2,"n","meisei","Japonic"],
  ["SOC","reputation",2,"n","hoban","Japonic"],
  ["SOC","status / standing",2,"n","cihi","Sinitic"],
  ["SOC","role / function",2,"n","yakuwali","Japonic"],
  ["SOC","mercy / clemency",2,"n","laha","Semitic"],
  ["SOC","justice",2,"n","yutisia","Romance"],
  ["SOC","loyalty / fidelity",2,"n","cunei","Sinitic"],
  ["SOC","cooperation",2,"n","koloku","Japonic"],
  ["SOC","conflict / strife",2,"n","funo","Japonic"],
  ["SOC","agreement / accord",2,"n","gappi","Japonic"],
  ["SOC","norm / rule-social",2,"n","kihan","Japonic"],
  ["SOC","habit / routine",2,"n","sukan","Japonic"],
  ["SOC","manner / conduct",2,"n","taido","Japonic"],
  ["SOC","ceremony",2,"n","gisiki","Japonic"],
  ["SOC","ritual / rite",3,"n","gile","Romance"],
  ["SOC","privilege",3,"n","token","Japonic"],
  ["SOC","equality",3,"n","bodo","Japonic"],
  ["SOC","cruelty",3,"n","yanin","Sinitic"],
  ["SOC","kindness / benevolence",2,"n","sinetu","Japonic"],
  ["SOC","generosity",3,"n","kalamua","Semitic"],
  ["SOC","prejudice / bias",3,"n","henken","Japonic"],
  ["SOC","reward / recompense",2,"n","hosu","Japonic"],
  ["SOC","cooperate",2,"v","kolo","Japonic"],
  ["SOC","compete / contend",2,"v","kosoi","Japonic"],
  ["SOC","obey / comply",2,"v","sitagau","Japonic"],
  ["SOC","rebel / resist",3,"v","hanko","Japonic"],
  ["SOC","celebrate",2,"v","iwau","Japonic"],
  ["SOC","participate / take part",2,"v","sanka","Japonic"],
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

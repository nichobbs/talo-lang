// Mint ALL remaining tier-2/3 forms. Append-only, complete, self-checking.
// Run: node --experimental-strip-types scripts/mint-remaining.mjs
import { checkForm, RESERVED_FORMS } from "../tools/collision-checker/src/index.ts";
import { readFileSync, writeFileSync } from "node:fs";

const VOWELS = new Set([..."aeiou"]);
const STOPS = new Set([..."ptkbdgc"]);
const CONS = new Set([..."ptkbdgcfshmnlwy"]);

function legalize(raw) {
  let s = raw.toLowerCase();
  const map = { r: "l", j: "y", v: "w", z: "s", q: "k", x: "k" };
  s = [...s].map((c) => map[c] ?? c).join("");
  s = [...s].filter((c) => VOWELS.has(c) || CONS.has(c)).join("");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const prev = out[out.length - 1] ?? "";
    if (VOWELS.has(c)) {
      if (prev === c) continue;
      out += c;
    } else {
      if (prev === "" || VOWELS.has(prev)) out += c;
      else if (prev === "n" && STOPS.has(c)) out += c;
      else out += "a" + c;
    }
  }
  if (out.length && !VOWELS.has(out.at(-1)) && out.at(-1) !== "n") out += "a";
  out = out.replace(/([aeiou])\1+/g, "$1");
  return out;
}

// Source form per concept id (blend rubric). MUST cover every missing root.
const rough = {
  // PROP
  "PROP-004":"mizika","PROP-005":"hiroi","PROP-006":"sempit","PROP-007":"atsui","PROP-008":"tipis",
  "PROP-009":"berat","PROP-010":"ringan","PROP-013":"atataka","PROP-016":"muda","PROP-021":"kotori",
  "PROP-022":"safi","PROP-023":"nyevu","PROP-025":"katai","PROP-026":"lembut","PROP-027":"tajam",
  "PROP-029":"sugu","PROP-030":"bulat","PROP-031":"rata","PROP-032":"halus","PROP-033":"dalam",
  "PROP-034":"takai","PROP-035":"hikui","PROP-038":"hayai","PROP-039":"osoi","PROP-040":"tuyoi",
  "PROP-041":"lemah","PROP-042":"tadasi","PROP-043":"salah","PROP-044":"benar","PROP-050":"hijau",
  "PROP-051":"kuning","PROP-052":"awoi","PROP-053":"ikiru","PROP-054":"sinu",
  // ACT
  "ACT-005":"hasiru","ACT-008":"rebah","ACT-011":"pegang","ACT-013":"beba","ACT-014":"letak",
  "ACT-015":"nageru","ACT-017":"mawaru","ACT-018":"gerak","ACT-019":"buka","ACT-023":"tataku",
  "ACT-024":"dorong","ACT-025":"tarik","ACT-026":"funga","ACT-027":"osha","ACT-028":"gosok",
  "ACT-029":"horu","ACT-031":"nagare","ACT-032":"ogelea","ACT-033":"terbang","ACT-035":"asobu",
  "ACT-036":"pakai","ACT-037":"tolong","ACT-038":"mulai","ACT-039":"henti","ACT-040":"selesai","ACT-042":"sodatu",
  // FUN
  "FUN-007":"dore","FUN-013":"sehingga","FUN-014":"walau","FUN-020":"lagi","FUN-021":"mungkin",
  // QTY
  "QTY-007":"pika","QTY-008":"haba","QTY-009":"cewa","QTY-010":"huba","QTY-013":"sebu","QTY-014":"miliong",
  "QTY-023":"kila","QTY-025":"sukuna","QTY-026":"cukup","QTY-027":"setenga","QTY-028":"kazu",
  "QTY-029":"bagian","QTY-030":"hitung",
  // TIM
  "TIM-004":"asagohan","TIM-005":"yugata","TIM-010":"toki","TIM-012":"tsuki","TIM-013":"minggu",
  "TIM-014":"jamu","TIM-019":"sering","TIM-020":"kadang","TIM-021":"hayaku","TIM-022":"osoku",
  // CLO
  "CLO-001":"baju","CLO-002":"sepatu","CLO-003":"pakaru",
  // DWE
  "DWE-002":"pintu","DWE-003":"atap","DWE-004":"tempat","DWE-005":"meja","DWE-007":"talia","DWE-009":"dogu",
  // MOT
  "MOT-001":"masuk","MOT-002":"keluar","MOT-003":"sampai","MOT-004":"ikuti","MOT-005":"naiki","MOT-006":"kirim",
  // SPA
  "SPA-010":"depan","SPA-011":"belakang","SPA-012":"kiri","SPA-013":"kanan","SPA-014":"samping","SPA-015":"tenga",
  // PER
  "PER-003":"nioi","PER-004":"rasa","PER-005":"sentuh","PER-006":"miru","PER-007":"dengar","PER-008":"iro","PER-009":"oto",
  // EMO
  "EMO-001":"suki","EMO-002":"suka","EMO-005":"senang","EMO-007":"marah","EMO-008":"tawa","EMO-009":"naku",
  // COG
  "COG-003":"paham","COG-004":"belajar","COG-005":"ajaru","COG-006":"ingat","COG-008":"percaya","COG-009":"akaru",
  // SPE
  "SPE-004":"basha","SPE-005":"tanya","SPE-006":"jawab","SPE-007":"baca","SPE-008":"tulis","SPE-009":"arti",
  // POS
  "POS-002":"dapat","POS-003":"beli","POS-005":"bayar",
  // SOC
  "SOC-001":"kelompo","SOC-003":"perang","SOC-004":"laga","SOC-005":"kota","SOC-006":"negara","SOC-007":"pimpin",
  // MOD
  "MOD-001":"uang","MOD-002":"hon","MOD-003":"kertas","MOD-005":"kuruma","MOD-006":"jalan","MOD-007":"basu",
  "MOD-008":"kicha","MOD-009":"denwa","MOD-010":"konpyuta","MOD-011":"intaneto","MOD-012":"denki","MOD-013":"kikai",
  "MOD-014":"byoin","MOD-015":"kusuri","MOD-016":"isha","MOD-018":"seifu",
};

const con = readFileSync("data/concepts.tsv","utf8").trim().split("\n").slice(1).map(l=>l.split("\t"));
const lexLines = readFileSync("data/lexicon.tsv","utf8").trim().split("\n");
const have = new Map(lexLines.slice(1).map(l=>{const c=l.split("\t");return [c[0],c[2]];}));
const glossOf = new Map(con.map(r=>[r[0],r[1]]));

const need = con.filter(r=>r[5]==="yes" && !have.has(r[0]));
const missing = need.filter(r=>!rough[r[0]]);
if (missing.length) {
  console.error("ABORT: no source form for: " + missing.map(r=>r[0]+"("+r[1]+")").join(", "));
  process.exit(1);
}

const occupied = [...RESERVED_FORMS].map(f=>({form:f,label:"reserved"}));
for (const [id,form] of have) occupied.push({form,label:id});

const vowels=["a","e","i","o","u"];
const cmix=["k","t","p","n","s","l","m"];
const newRows=[]; const fails=[];
for (const r of need) {
  const id=r[0];
  const src=rough[id].replace(/\d+$/,"");
  const base=legalize(src);
  let cand=base, ok=false;
  for(let t=0;t<60 && !ok;t++){
    if(t>0){
      if(t<=5) cand=base+vowels[t-1];
      else if(t<=30) cand=base+vowels[(t)%5]+cmix[t%7]+vowels[Math.floor(t/5)%5];
      else cand=base+vowels[t%5]+vowels[(t+2)%5];
      cand=legalize(cand);
    }
    if(checkForm(cand, occupied).ok) ok=true;
  }
  if(!ok){fails.push(id+"/"+src);continue;}
  occupied.push({form:cand,label:id});
  const note = src!==cand ? "blend (legalised)" : "blend";
  newRows.push([id, glossOf.get(id), cand, "INTL", "blend rubric; src '"+src+"'", note].join("\t"));
}

if (fails.length) { console.error("ABORT: could not mint: "+fails.join(", ")); process.exit(1); }

// APPEND ONLY: keep every existing line byte-identical, add the new rows.
writeFileSync("data/lexicon.tsv", lexLines.join("\n")+"\n"+newRows.join("\n")+"\n");
writeFileSync("/tmp/mint-report.txt", "minted="+newRows.length+" need="+need.length+" fails="+fails.length+"\n");
console.log("minted "+newRows.length+" / need "+need.length);

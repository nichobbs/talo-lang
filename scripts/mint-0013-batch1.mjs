// 0013 Batch 1 — first reading-coverage minting batch. Genuine IDS-spine root
// gaps (triaged: derivable concepts like ordinals/opposites/agents are NOT here),
// donor-balanced toward the under-weighted families (Austronesian-led, plus
// Dravidian/Semitic/Indo-Aryan/Bantu; no Japonic/Romance — both are near the top
// of the ≤25% cap). Append-only, fail-fast, self-validating through the REAL
// collision checker. Dupe glosses are SKIPPED (warned), not fatal.
//   Run: node --experimental-strip-types scripts/mint-0013-batch1.mjs
import { checkForm, RESERVED_FORMS } from "../tools/collision-checker/src/index.ts";
import { readFileSync, writeFileSync } from "node:fs";

const VOWELS = new Set([..."aeiou"]);
const STOPS = new Set([..."ptkbdgc"]);
const CONS = new Set([..."ptkbdgcfshmnlwy"]);

// Legalizer: SIMPLIFY to legal Talo per 0003 §7b (drop at illegal seams, don't
// pad). Identical to the Phase-5b minting scripts.
function legalize(raw) {
  let s = raw.toLowerCase()
    .replace(/sh/g, "s").replace(/ch/g, "c").replace(/ts/g, "s").replace(/ngg/g, "ng")
    .replace(/th/g, "t").replace(/ph/g, "f").replace(/ck/g, "k").replace(/gh/g, "g")
    .replace(/dh/g, "d").replace(/kh/g, "h");
  const map = { r: "l", j: "y", v: "w", z: "s", q: "k", x: "k" };
  s = [...s].map((c) => map[c] ?? c).join("");
  s = [...s].filter((c) => VOWELS.has(c) || CONS.has(c)).join("");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i], prev = out[out.length - 1] ?? "", next = s[i + 1] ?? "";
    if (VOWELS.has(c)) { if (prev === c) continue; out += c; }
    else if (prev === "" || VOWELS.has(prev)) out += c;
    else if (prev === "n" && STOPS.has(c)) out += c;
    else if (c === "n" && STOPS.has(next)) out = out.slice(0, -1) + c;
    // else drop
  }
  while (out.length && !VOWELS.has(out.at(-1)) && out.at(-1) !== "n") out = out.slice(0, -1);
  out = out.replace(/([aeiou])\1+/g, "$1");
  while (out.length >= 2 && !VOWELS.has(out[0]) && !VOWELS.has(out[1])) out = out.slice(1);
  return out;
}

// [domain, gloss, tier, pos, donor-src, family]
const NEW = [
  // animals / insects (ch3)
  ["ANI","snail",2,"n","siput","Austronesian"],
  ["ANI","grasshopper",2,"n","belalang","Austronesian"],
  ["ANI","cockroach",2,"n","kecoa","Austronesian"],
  ["ANI","wasp",2,"n","tawon","Austronesian"],
  ["ANI","worm",2,"n","cacing","Austronesian"],
  ["ANI","frog",2,"n","kodok","Austronesian"],
  ["ANI","turtle",2,"n","kasa","Bantu"],
  ["ANI","lizard",2,"n","cicak","Austronesian"],
  ["ANI","mosquito",2,"n","kosu","Dravidian"],
  ["ANI","bat (animal)",3,"n","kalong","Austronesian"],
  ["ANI","scorpion",3,"n","bicchu","Indo-Aryan"],
  ["ANI","lion",2,"n","simba","Bantu"],
  // plants / agriculture (ch8)
  ["AGR","cassava / manioc",3,"n","singkong","Austronesian"],
  ["AGR","tobacco",2,"n","tembakau","Austronesian"],
  ["AGR","sugar cane",2,"n","tebu","Austronesian"],
  ["AGR","yam",3,"n","ubi","Austronesian"],
  ["AGR","bean",2,"n","kacang","Austronesian"],
  ["AGR","thorn",2,"n","duri","Austronesian"],
  ["AGR","mushroom",2,"n","jamur","Austronesian"],
  ["AGR","sap / resin",3,"n","gond","Indo-Aryan"],
  // warfare / hunting (ch20)
  ["SOC","bow (weapon)",2,"n","busur","Austronesian"],
  ["SOC","arrow",2,"n","ambu","Dravidian"],
  ["SOC","spear",2,"n","tombak","Austronesian"],
  ["SOC","sword",2,"n","pedang","Austronesian"],
  ["SOC","shield",2,"n","perisai","Austronesian"],
  ["SOC","gun / firearm",2,"n","senapang","Austronesian"],
  ["SOC","cannon",3,"n","meriam","Austronesian"],
  ["SOC","army",2,"n","sena","Indo-Aryan"],
  ["SOC","soldier",2,"n","tentara","Austronesian"],
  ["SOC","enemy",2,"n","musuh","Austronesian"],
  ["SOC","club / mace (weapon)",3,"n","rungu","Bantu"],
  // religion / belief (ch22)
  ["SOC","worship (v)",2,"v","ibada","Semitic"],
  ["SOC","pray",2,"v","omba","Bantu"],
  ["SOC","sacred / holy",2,"mod","muqaddas","Semitic"],
  ["SOC","soul / spirit",2,"n","roho","Bantu"],
  ["SOC","heaven / paradise",2,"n","surga","Austronesian"],
  ["SOC","sin",2,"n","dosa","Austronesian"],
  ["SOC","sacrifice / offering",3,"n","korban","Semitic"],
  ["SOC","bless",3,"v","baraka","Semitic"],
  ["SOC","curse (v)",3,"v","laana","Bantu"],
  ["SOC","demon / evil spirit",3,"n","shaitan","Semitic"],
  ["SOC","deity / god",2,"n","mungu","Bantu"],
  // food / drink (ch5)
  ["FOO","beer / brew",2,"n","pombe","Bantu"],
  ["FOO","wine",2,"n","anggur","Austronesian"],
  ["FOO","flour",2,"n","tepung","Austronesian"],
  ["FOO","cooking oil",2,"n","mafuta","Bantu"],
  ["FOO","vinegar",3,"n","cuka","Austronesian"],
  ["FOO","porridge",3,"n","bubur","Austronesian"],
  ["FOO","honey",2,"n","madu","Austronesian"],
  // properties (ch15/16/12)
  ["PROP","naked / bare",2,"mod","telanjang","Austronesian"],
  ["PROP","deaf",2,"mod","tuli","Austronesian"],
  ["PROP","mute / dumb",2,"mod","bisu","Austronesian"],
  ["PROP","lazy",2,"mod","alasi","Indo-Aryan"],
  ["PROP","salty",2,"mod","masin","Austronesian"],
  ["PROP","sour",2,"mod","asam","Austronesian"],
  ["PROP","smooth",2,"mod","halus","Austronesian"],
  ["PROP","rough / coarse",2,"mod","kesat","Austronesian"],
  ["PROP","tall / high",2,"mod","tinggi","Austronesian"],
  ["PROP","shallow",2,"mod","cetek","Austronesian"],
  ["PROP","narrow",2,"mod","sempit","Austronesian"],
  // body (ch4)
  ["BOD","pus",3,"n","usaha","Bantu"],
  ["BOD","itch (v)",2,"v","arippu","Dravidian"],
  // speech (ch18)
  ["SPE","whistle (v)",2,"v","siul","Austronesian"],
  ["SPE","whisper (v)",2,"v","bisik","Austronesian"],
  ["SPE","shout / yell",2,"v","teriak","Austronesian"],
];

// ---- load current data ----
const conLines = readFileSync("data/concepts.tsv", "utf8").replace(/\n+$/, "").split("\n");
const lexLines = readFileSync("data/lexicon.tsv", "utf8").replace(/\n+$/, "").split("\n");
const conRows = conLines.slice(1).map((l) => l.split("\t"));
const haveForm = new Map(lexLines.slice(1).map((l) => { const c = l.split("\t"); return [c[0], c[2]]; }));
const glossSeen = new Set(conRows.map((r) => r[1].toLowerCase()));

const maxSeq = {};
for (const r of conRows) { const [d, n] = r[0].split("-"); const v = +n; if (!(d in maxSeq) || v > maxSeq[d]) maxSeq[d] = v; }

const occupied = [...RESERVED_FORMS].map((f) => ({ form: f, label: "reserved" }));
for (const [id, form] of haveForm) occupied.push({ form, label: id });

const vowels = ["a", "e", "i", "o", "u"], cmix = ["k", "t", "p", "n", "s", "l", "m"];
const newConRows = [], newLexRows = [], fails = [], skipped = [];

for (const [domain, gloss, tier, pos, src, family] of NEW) {
  if (glossSeen.has(gloss.toLowerCase())) { skipped.push(gloss); continue; }
  const seq = (maxSeq[domain] = (maxSeq[domain] ?? 0) + 1);
  const id = domain + "-" + String(seq).padStart(3, "0");
  const base = legalize(src);
  let cand = base, ok = false;
  for (let t = 0; t < 60 && !ok; t++) {
    if (t > 0) {
      if (t <= 5) cand = base + vowels[t - 1];
      else if (t <= 30) cand = base + vowels[t % 5] + cmix[t % 7] + vowels[Math.floor(t / 5) % 5];
      else cand = base + vowels[t % 5] + vowels[(t + 2) % 5];
      cand = legalize(cand);
    }
    if (cand.length >= 2 && checkForm(cand, occupied).ok) ok = true;
  }
  if (!ok) { fails.push(id + "/" + src); continue; }
  occupied.push({ form: cand, label: id });
  glossSeen.add(gloss.toLowerCase());
  newConRows.push([id, gloss, domain, String(tier), pos, "yes", "", "IDS", "0013 batch1 (" + family + ")"].join("\t"));
  const note = (base !== cand ? "blend (legalised); " : "blend; ") + family;
  newLexRows.push([id, gloss, cand, "INTL", "blend rubric; src '" + src + "'", note].join("\t"));
}

if (fails.length) { console.error("ABORT: could not mint: " + fails.join(", ")); process.exit(1); }
if (skipped.length) console.warn("skipped " + skipped.length + " existing gloss(es): " + skipped.join(", "));

writeFileSync("data/concepts.tsv", conLines.join("\n") + "\n" + newConRows.join("\n") + "\n");
writeFileSync("data/lexicon.tsv", lexLines.join("\n") + "\n" + newLexRows.join("\n") + "\n");
console.log("minted " + newLexRows.length + " new forms across " + new Set(newConRows.map((r) => r.split("\t")[2])).size + " domains");
for (const r of newLexRows) console.log("  " + r.split("\t").slice(0, 3).join("  "));

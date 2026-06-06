// 0013 Batch 3 — first reading-coverage minting batch. Genuine IDS-spine root
// gaps (triaged: derivable concepts like ordinals/opposites/agents are NOT here),
// donor-balanced toward the under-weighted families (Austronesian-led, plus
// Dravidian/Semitic/Indo-Aryan/Bantu; no Japonic/Romance — both are near the top
// of the ≤25% cap). Append-only, fail-fast, self-validating through the REAL
// collision checker. Dupe glosses are SKIPPED (warned), not fatal.
//   Run: node --experimental-strip-types scripts/mint-0013-batch3.mjs
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
  // food / kitchen (ch5 -> FOO/DWE)
  ["FOO","nut",2,"n","mewa","Indo-Aryan"],
  ["FOO","fig",3,"n","tin","Semitic"],
  ["FOO","fat / grease",2,"n","charbi","Indo-Aryan"],
  ["FOO","vegetable",2,"n","cai","Sinitic"],
  ["FOO","bowl",2,"n","wan","Sinitic"],
  ["FOO","pot / cauldron",2,"n","guo","Sinitic"],
  ["FOO","jug / pitcher",2,"n","kudam","Dravidian"],
  ["FOO","oven",2,"n","tandoor","Indo-Aryan"],
  ["FOO","thirst",2,"n","haus","Austronesian"],
  ["FOO","vomit (v)",2,"v","muntah","Austronesian"],
  ["FOO","boil (cook in water)",2,"v","ubal","Indo-Aryan"],
  ["FOO","sieve / strain",3,"v","ayak","Austronesian"],
  ["FOO","mead",3,"n","madhu","Indo-Aryan"],
  // body (ch4 -> BOD)
  ["BOD","belly / stomach",2,"n","perut","Austronesian"],
  ["BOD","breast (of woman)",2,"n","mulai","Dravidian"],
  ["BOD","thigh",2,"n","paha","Austronesian"],
  ["BOD","rib",3,"n","pasli","Indo-Aryan"],
  ["BOD","intestines / guts",2,"n","usus","Austronesian"],
  ["BOD","forehead",2,"n","dahi","Austronesian"],
  ["BOD","bathe",2,"v","mandi","Austronesian"],
  ["BOD","shiver / tremble",2,"v","getar","Austronesian"],
  ["BOD","corpse",2,"n","mayat","Austronesian"],
  ["BOD","grave / tomb",2,"n","kubur","Austronesian"],
  ["BOD","bury (the dead)",2,"v","tanam","Austronesian"],
  // animals (ch3 -> ANI)
  ["ANI","fowl / chicken",2,"n","ayam","Austronesian"],
  ["ANI","bull",2,"n","saand","Indo-Aryan"],
  ["ANI","goose / swan",3,"n","hansa","Indo-Aryan"],
  ["ANI","sheep",2,"n","kondoo","Bantu"],
  ["ANI","goat",2,"n","mbuzi","Bantu"],
  ["ANI","flea",3,"n","pissu","Indo-Aryan"],
  ["ANI","louse",2,"n","kutu","Austronesian"],
  ["ANI","eel",3,"n","belut","Austronesian"],
  ["ANI","shell",2,"n","sippi","Dravidian"],
  ["ANI","dolphin / porpoise",3,"n","lumba","Austronesian"],
  // plants / farming (ch8 -> AGR)
  ["AGR","hoe",2,"n","jembe","Bantu"],
  ["AGR","plough",2,"n","kalappai","Dravidian"],
  ["AGR","sickle",3,"n","sabit","Austronesian"],
  ["AGR","spade / shovel",2,"n","phaavda","Indo-Aryan"],
  ["AGR","rake",3,"n","garu","Austronesian"],
  ["AGR","pine (tree)",3,"n","song","Sinitic"],
  ["AGR","hay / straw",2,"n","jerami","Austronesian"],
  // dwelling / building (ch7 -> DWE)
  ["DWE","board / plank",2,"n","papan","Austronesian"],
  ["DWE","beam",3,"n","liang","Sinitic"],
  ["DWE","post / pole",2,"n","tiang","Austronesian"],
  ["DWE","mortar (vessel)",3,"n","lesung","Austronesian"],
  ["DWE","pestle",3,"n","alu","Austronesian"],
  // time (ch14 -> TIM)
  ["TIM","afternoon / evening",2,"n","petang","Austronesian"],
  ["TIM","season",2,"n","musim","Austronesian"],
  // perception (ch15 -> PER)
  ["PER","sniff / smell (v)",2,"v","sungha","Indo-Aryan"],
  ["PER","shine / glow",2,"v","sinar","Austronesian"],
  ["PER","pinch (v)",2,"v","cubit","Austronesian"],
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
  newConRows.push([id, gloss, domain, String(tier), pos, "yes", "", "IDS", "0013 batch3 (" + family + ")"].join("\t"));
  const note = (base !== cand ? "blend (legalised); " : "blend; ") + family;
  newLexRows.push([id, gloss, cand, "INTL", "blend rubric; src '" + src + "'", note].join("\t"));
}

if (fails.length) { console.error("ABORT: could not mint: " + fails.join(", ")); process.exit(1); }
if (skipped.length) console.warn("skipped " + skipped.length + " existing gloss(es): " + skipped.join(", "));

writeFileSync("data/concepts.tsv", conLines.join("\n") + "\n" + newConRows.join("\n") + "\n");
writeFileSync("data/lexicon.tsv", lexLines.join("\n") + "\n" + newLexRows.join("\n") + "\n");
console.log("minted " + newLexRows.length + " new forms across " + new Set(newConRows.map((r) => r.split("\t")[2])).size + " domains");
for (const r of newLexRows) console.log("  " + r.split("\t").slice(0, 3).join("  "));

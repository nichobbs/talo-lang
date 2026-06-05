// 0013 Batch 2 — first reading-coverage minting batch. Genuine IDS-spine root
// gaps (triaged: derivable concepts like ordinals/opposites/agents are NOT here),
// donor-balanced toward the under-weighted families (Austronesian-led, plus
// Dravidian/Semitic/Indo-Aryan/Bantu; no Japonic/Romance — both are near the top
// of the ≤25% cap). Append-only, fail-fast, self-validating through the REAL
// collision checker. Dupe glosses are SKIPPED (warned), not fatal.
//   Run: node --experimental-strip-types scripts/mint-0013-batch2.mjs
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
  // clothing / textiles (ch6 -> CLO)
  ["CLO","bead",2,"n","manik","Austronesian"],
  ["CLO","bracelet",2,"n","gelang","Austronesian"],
  ["CLO","comb",2,"n","sisir","Austronesian"],
  ["CLO","earring",2,"n","anting","Austronesian"],
  ["CLO","necklace",2,"n","mkufu","Bantu"],
  ["CLO","razor",2,"n","wembe","Bantu"],
  ["CLO","brush",2,"n","sikat","Austronesian"],
  ["CLO","weave (v)",2,"v","tenun","Austronesian"],
  ["CLO","wool",2,"n","suf","Semitic"],
  ["CLO","silk",3,"n","sutera","Austronesian"],
  ["CLO","dye (v)",2,"v","celup","Austronesian"],
  ["CLO","tattoo",3,"n","tatau","Austronesian"],
  ["CLO","cloak / robe",2,"n","jubah","Austronesian"],
  ["CLO","thread",2,"n","benang","Austronesian"],
  ["CLO","needle",2,"n","jarum","Austronesian"],
  // crafts / tools (ch9 -> ACT)
  ["ACT","axe",2,"n","kapak","Austronesian"],
  ["ACT","hammer",2,"n","palu","Austronesian"],
  ["ACT","nail (metal)",2,"n","paku","Austronesian"],
  ["ACT","saw (tool)",2,"n","msumeno","Bantu"],
  ["ACT","chisel",3,"n","pahat","Austronesian"],
  ["ACT","carve",2,"v","ukir","Austronesian"],
  ["ACT","rope",2,"n","tali","Austronesian"],
  ["ACT","knot",2,"n","simpul","Austronesian"],
  ["ACT","basket",2,"n","kikapu","Bantu"],
  ["ACT","mat",2,"n","tikar","Austronesian"],
  ["ACT","net",2,"n","jala","Austronesian"],
  ["ACT","statue",3,"n","murti","Indo-Aryan"],
  ["ACT","fan (device)",2,"n","kipas","Austronesian"],
  ["ACT","glue",2,"n","gundi","Bantu"],
  // motion / transport (ch10 -> MOT)
  ["MOT","oar / paddle",2,"n","dayung","Austronesian"],
  ["MOT","raft",2,"n","rakit","Austronesian"],
  ["MOT","canoe",2,"n","bangka","Austronesian"],
  ["MOT","sail (noun)",2,"n","layar","Austronesian"],
  ["MOT","yoke",3,"n","jua","Indo-Aryan"],
  ["MOT","saddle",3,"n","pelana","Austronesian"],
  // possession / trade (ch11 -> POS)
  ["POS","wages / salary",2,"n","gaji","Austronesian"],
  ["POS","debt",2,"n","hutang","Austronesian"],
  ["POS","borrow",2,"v","pinjam","Austronesian"],
  ["POS","rich / wealthy",2,"mod","kaya","Austronesian"],
  ["POS","poor",2,"mod","miskin","Austronesian"],
  ["POS","profit / gain",2,"n","untung","Austronesian"],
  ["POS","wealth / property",2,"n","harta","Austronesian"],
  ["POS","stingy / miserly",3,"mod","kikir","Austronesian"],
  // spatial / shape (ch12 -> SPA)
  ["SPA","ball / sphere",2,"n","bola","Austronesian"],
  ["SPA","hook",2,"n","kait","Austronesian"],
  ["SPA","corner",2,"n","sudut","Austronesian"],
  ["SPA","edge",2,"n","tepi","Austronesian"],
  ["SPA","crooked / bent",2,"mod","bengkok","Austronesian"],
  ["SPA","layer",2,"n","lapis","Austronesian"],
  // emotion (ch16 -> EMO)
  ["EMO","smile",2,"v","senyum","Austronesian"],
  ["EMO","kiss",2,"v","cium","Austronesian"],
  ["EMO","embrace / hug",2,"v","peluk","Austronesian"],
  ["EMO","shame",2,"n","malu","Austronesian"],
  ["EMO","proud / pride",2,"mod","bangga","Austronesian"],
  ["EMO","jealous / envy",2,"mod","cemburu","Austronesian"],
  ["EMO","mercy / compassion",2,"n","huruma","Bantu"],
  ["EMO","patience",2,"n","sabari","Bantu"],
  ["EMO","startled / surprised",2,"mod","kejut","Austronesian"],
  // speech (ch18 -> SPE)
  ["SPE","praise (v)",2,"v","puji","Austronesian"],
  ["SPE","boastful / arrogant",3,"mod","sombong","Austronesian"],
  ["SPE","deny",2,"v","sangkal","Austronesian"],
  ["SPE","promise",2,"n","janji","Austronesian"],
  ["SPE","warn",2,"v","onya","Bantu"],
  ["SPE","scold / rebuke",2,"v","tegur","Austronesian"],
  // society / law (ch19/21 -> SOC)
  ["SOC","king",2,"n","malik","Semitic"],
  ["SOC","queen",2,"n","ratu","Austronesian"],
  ["SOC","slave",2,"n","hamba","Austronesian"],
  ["SOC","crowd",2,"n","umati","Bantu"],
  ["SOC","tribe / clan",2,"n","kabila","Bantu"],
  ["SOC","custom / tradition",2,"n","adat","Austronesian"],
  ["SOC","law",2,"n","sheria","Bantu"],
  ["SOC","judge (person)",2,"n","kadhi","Semitic"],
  ["SOC","witness",2,"n","shahidi","Bantu"],
  ["SOC","prison / jail",2,"n","penjara","Austronesian"],
  ["SOC","punish / penalty",2,"n","hukum","Austronesian"],
  ["SOC","oath / swear",3,"n","sumpah","Austronesian"],
  // physical world (ch1 -> PHY)
  ["PHY","mud",2,"n","lumpur","Austronesian"],
  ["PHY","clay",2,"n","udongo","Bantu"],
  ["PHY","dust",2,"n","debu","Austronesian"],
  ["PHY","fog / mist",2,"n","kabut","Austronesian"],
  ["PHY","wave (water)",2,"n","ombak","Austronesian"],
  ["PHY","foam",2,"n","povu","Bantu"],
  ["PHY","charcoal",2,"n","arang","Austronesian"],
  ["PHY","cave",2,"n","pango","Bantu"],
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
  newConRows.push([id, gloss, domain, String(tier), pos, "yes", "", "IDS", "0013 batch2 (" + family + ")"].join("\t"));
  const note = (base !== cand ? "blend (legalised); " : "blend; ") + family;
  newLexRows.push([id, gloss, cand, "INTL", "blend rubric; src '" + src + "'", note].join("\t"));
}

if (fails.length) { console.error("ABORT: could not mint: " + fails.join(", ")); process.exit(1); }
if (skipped.length) console.warn("skipped " + skipped.length + " existing gloss(es): " + skipped.join(", "));

writeFileSync("data/concepts.tsv", conLines.join("\n") + "\n" + newConRows.join("\n") + "\n");
writeFileSync("data/lexicon.tsv", lexLines.join("\n") + "\n" + newLexRows.join("\n") + "\n");
console.log("minted " + newLexRows.length + " new forms across " + new Set(newConRows.map((r) => r.split("\t")[2])).size + " domains");
for (const r of newLexRows) console.log("  " + r.split("\t").slice(0, 3).join("  "));

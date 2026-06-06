// Curated compounding — the third derivation layer (docs/0002 §3.1, docs/0007 §8).
//
// Compounding (modifier-root(s) + head-root + ONE badge) is open-ended N×N over
// ~1,400 roots, so it CANNOT be auto-generated as a cross-product without
// drowning in noise. This builds a CURATED seed instead: a hand-picked list of
// genuinely idiomatic compounds, each referencing concept IDs (robust to form
// edits). The script looks up the forms, applies the §3.1 buffer-vowel rule at an
// illegal n-seam, and FAIL-FASTS through the real collision checker — every
// curated compound must pass (no silent mangling). It is a seed, extensible.
//
// Output: data/compounds.tsv. Run:
//   node --experimental-strip-types scripts/derive-compounds.mjs
import { checkForm, RESERVED_FORMS } from "../tools/collision-checker/src/index.ts";
import { FUNCTION_WORDS } from "../tools/parser/src/morphology.ts";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const LEXICON = "data/lexicon.tsv";
const BLOCKLIST = "data/collision-blocklist.txt";
const FALSE_FRIENDS = "data/false-friends.tsv";
const DERIVED = "data/derived-lexicon.tsv";
const OUT = "data/compounds.tsv";

const STOPS = new Set([..."ptkbdgc"]);
const VOWELS = new Set([..."aeiou"]);

// ---- the curated compound list ---------------------------------------------
// { parts: [modId, …, headId], badge, gloss }. Parts are concept IDs; the LAST
// is the head (docs/0002 §3.1: modifier-root(s) first, head last). One badge
// categorises the whole. Glosses are real (this layer is editorial, not
// templated). Add freely — the script gates every entry.
const COMPOUNDS = [
  // ---- places: X-room / X-house (head: room DWE-010 / house DWE-001) --------
  { parts: ["PHY-008", "DWE-010"], badge: "ka", gloss: "bathroom (water-room)" },
  { parts: ["FOO-005", "DWE-001"], badge: "ka", gloss: "kitchen (cook-house)" },
  { parts: ["BOD-027", "DWE-010"], badge: "ka", gloss: "bedroom (sleep-room)" },
  { parts: ["BOD-028", "DWE-010"], badge: "ka", gloss: "dining room (eat-room)" },
  { parts: ["KIN-004", "DWE-010"], badge: "ka", gloss: "nursery (child-room)" },
  { parts: ["ACT-034", "DWE-010"], badge: "ka", gloss: "office (work-room)" },
  { parts: ["MOD-002", "DWE-001"], badge: "ka", gloss: "library (book-house)" },
  { parts: ["MOD-047", "DWE-001"], badge: "ka", gloss: "hospital (sick-house)" },
  { parts: ["MOD-001", "DWE-001"], badge: "ka", gloss: "bank (money-house)" },
  { parts: ["COG-004", "DWE-001"], badge: "ka", gloss: "school (learn-house)" },
  { parts: ["ACT-034", "DWE-001"], badge: "ka", gloss: "workshop (work-house)" },
  { parts: ["AGR-003", "DWE-001"], badge: "ka", gloss: "wooden house (wood-house)" },
  { parts: ["PHY-013", "DWE-001"], badge: "ka", gloss: "stone house (stone-house)" },
  { parts: ["PROP-001", "DWE-001"], badge: "ka", gloss: "mansion (big-house)" },
  { parts: ["PROP-002", "DWE-001"], badge: "ka", gloss: "cottage / hut (small-house)" },
  // ---- people / roles (head: person KIN-001) --------------------------------
  { parts: ["MOD-047", "KIN-001"], badge: "ka", gloss: "patient (sick-person)" },
  { parts: ["PROP-001", "KIN-001"], badge: "ka", gloss: "adult / grown-up (big-person)" },
  { parts: ["ACT-034", "KIN-001"], badge: "ka", gloss: "worker (work-person)" },
  { parts: ["FOO-005", "KIN-001"], badge: "ka", gloss: "cook / chef (cook-person)" },
  { parts: ["PROP-090", "KIN-001"], badge: "ka", gloss: "elder (old-person)" },
  // ---- body / health (head: pain EMO-018, water PHY-008) --------------------
  { parts: ["BOD-001", "EMO-018"], badge: "ka", gloss: "headache (head-pain)" },
  { parts: ["BOD-007", "EMO-018"], badge: "ka", gloss: "toothache (tooth-pain)" },
  { parts: ["BOD-003", "PHY-008"], badge: "ka", gloss: "tears (eye-water)" },
  // ---- nature / light (head: light PHY-026, animal ANI-001) -----------------
  { parts: ["PHY-001", "PHY-026"], badge: "ka", gloss: "sunlight (sun-light)" },
  { parts: ["PHY-003", "PHY-026"], badge: "ka", gloss: "starlight (star-light)" },
  { parts: ["TIM-002", "PHY-026"], badge: "ka", gloss: "daylight (day-light)" }, // n-seam buffer
  { parts: ["PHY-008", "ANI-004"], badge: "ka", gloss: "waterfowl (water-bird)" },
  { parts: ["PHY-009", "ANI-001"], badge: "ka", gloss: "sea creature (sea-animal)" },
  { parts: ["PHY-022", "TIM-002"], badge: "ka", gloss: "rainy day (rain-day)" },
  // ---- things / language (head: book MOD-002, shop MOD-022) -----------------
  { parts: ["SPE-002", "MOD-002"], badge: "ka", gloss: "dictionary (word-book)" },
  { parts: ["MOD-002", "MOD-022"], badge: "ka", gloss: "bookstore (book-shop)" }, // n-seam buffer
  { parts: ["FOO-001", "MOD-022"], badge: "ka", gloss: "grocery (food-shop)" },
  // ---- appended (0008 follow-up): keep IDs stable, append-only -------------
  { parts: ["ANI-001", "DWE-025"], badge: "ka", gloss: "zoo (animal-garden)" },
  // ---- appended (conflict batch 3): terrorist = terrorism-person ----------
  { parts: ["SOC-095", "KIN-001"], badge: "ka", gloss: "terrorist (terrorism-person)" },
  // ---- appended (vocab completion): capital = chief-city ------------------
  { parts: ["SOC-048", "SOC-005"], badge: "ka", gloss: "capital (chief-city)" },
  // ---- weekdays (0016): number-first compound [N]+din+ka, Sunday = 1 -------
  { parts: ["QTY-002", "TIM-002"], badge: "ka", gloss: "Sunday (day-1)" },
  { parts: ["QTY-003", "TIM-002"], badge: "ka", gloss: "Monday (day-2)" },
  { parts: ["QTY-004", "TIM-002"], badge: "ka", gloss: "Tuesday (day-3)" },
  { parts: ["QTY-005", "TIM-002"], badge: "ka", gloss: "Wednesday (day-4)" },
  { parts: ["QTY-006", "TIM-002"], badge: "ka", gloss: "Thursday (day-5)" },
  { parts: ["QTY-007", "TIM-002"], badge: "ka", gloss: "Friday (day-6)" },
  { parts: ["QTY-008", "TIM-002"], badge: "ka", gloss: "Saturday (day-7)" },
  // ---- months (0016): same rule, [N]+lun(month)+ka, aligned with weekdays ----
  { parts: ["QTY-002", "TIM-012"], badge: "ka", gloss: "January (month-1)" },
  { parts: ["QTY-003", "TIM-012"], badge: "ka", gloss: "February (month-2)" },
  { parts: ["QTY-004", "TIM-012"], badge: "ka", gloss: "March (month-3)" },
  { parts: ["QTY-005", "TIM-012"], badge: "ka", gloss: "April (month-4)" },
  { parts: ["QTY-006", "TIM-012"], badge: "ka", gloss: "May (month-5)" },
  { parts: ["QTY-007", "TIM-012"], badge: "ka", gloss: "June (month-6)" },
  { parts: ["QTY-008", "TIM-012"], badge: "ka", gloss: "July (month-7)" },
  { parts: ["QTY-009", "TIM-012"], badge: "ka", gloss: "August (month-8)" },
  { parts: ["QTY-010", "TIM-012"], badge: "ka", gloss: "September (month-9)" },
  { parts: ["QTY-011", "TIM-012"], badge: "ka", gloss: "October (month-10)" },
  { parts: ["QTY-011", "QTY-002", "TIM-012"], badge: "ka", gloss: "November (month-11)" },
  { parts: ["QTY-011", "QTY-003", "TIM-012"], badge: "ka", gloss: "December (month-12)" },
];

// ---- loaders ---------------------------------------------------------------
function readTsv(path) {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const header = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    const row = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}
function loadBlocklist(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split(/\r?\n/).map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
}
function loadFalseFriends(path) {
  const map = new Map();
  if (!existsSync(path)) return map;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("form\t")) continue;
    const [form, lang, meaning, severity] = line.split("\t");
    if (!form || !severity) continue;
    const key = form.trim().toLowerCase();
    const arr = map.get(key) ?? [];
    arr.push({ lang: (lang ?? "").trim(), meaning: (meaning ?? "").trim(), severity: severity.trim() });
    map.set(key, arr);
  }
  return map;
}

// Join roots with the §3.1 buffer rule: insert 'a' only when an n-final non-head
// root meets a non-stop onset (the single seam that would be illegal).
function joinRoots(parts) {
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const next = parts[i];
    const last = out[out.length - 1];
    const head = next[0];
    if (last === "n" && !VOWELS.has(head) && !STOPS.has(head)) out += "a"; // buffer
    out += next;
  }
  return out;
}

// ---- main ------------------------------------------------------------------
function main() {
  const lexById = new Map(readTsv(LEXICON).map((r) => [r.id, r]));
  const blocklist = loadBlocklist(BLOCKLIST);
  const falseFriends = loadFalseFriends(FALSE_FRIENDS);

  const CORR_STEMS = ["se", "ini", "itu", "ba", "ha", "o"];
  const CORR_CATS = ["la", "ko", "lo", "no", "fu", "wa", "mu"];
  const occupied = [
    ...[...RESERVED_FORMS,
        ...CORR_STEMS.flatMap((s) => CORR_CATS.map((c) => s + c)),
        ...Object.values(FUNCTION_WORDS).flatMap((s) => [...s])].map((form) => ({ form, label: "reserved" })),
  ];
  for (const r of readTsv(LEXICON)) if (r.form) occupied.push({ form: r.form, label: r.id });
  for (const r of readTsv(DERIVED)) if (r.form) occupied.push({ form: r.form, label: r.id }); // don't clash derived layer

  const rows = [];
  let n = 0;
  for (const c of COMPOUNDS) {
    n++;
    const roots = c.parts.map((id) => {
      const lex = lexById.get(id);
      if (!lex || !lex.form) { console.error(`FATAL: compound #${n} references missing/empty root '${id}'`); process.exit(1); }
      return lex.form;
    });
    const form = joinRoots(roots) + c.badge;
    const res = checkForm(form, occupied, blocklist, falseFriends);
    if (!res.ok) {
      console.error(`FATAL: curated compound #${n} '${form}' (${c.gloss}) fails the gate: [${res.conflict.kind}] ${res.conflict.message}`);
      process.exit(1); // curated => every entry MUST pass; fix the list, don't ship a bad one
    }
    rows.push({
      id: `COMP-${String(n).padStart(3, "0")}`,
      form,
      gloss: c.gloss,
      pos: { ka: "noun", to: "verb", pe: "modifier" }[c.badge],
      parts: c.parts.join("+"),
      morphemes: roots.join("+") + "+" + c.badge,
    });
    occupied.push({ form, label: rows.at(-1).id });
  }

  const header = ["id", "form", "gloss", "pos", "parts", "morphemes"];
  writeFileSync(OUT, header.join("\t") + "\n" + rows.map((r) => header.map((h) => r[h]).join("\t")).join("\n") + "\n");

  // self-validate the written file
  let bad = 0; const seen = new Set();
  for (const r of readTsv(OUT)) {
    if (seen.has(r.form)) { console.error(`FATAL: duplicate compound '${r.form}'`); bad++; }
    seen.add(r.form);
  }
  console.log(`curated compounds written: ${rows.length} -> ${OUT}`);
  if (bad) { console.error(`SELF-VALIDATION FAILED: ${bad} duplicate(s).`); process.exit(1); }
  console.log(`self-validation: ${rows.length}/${rows.length} clear (exit 0)`);
}

main();

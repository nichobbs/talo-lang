// Derivation expansion — materialise the productive derived dictionary.
//
// Talo roots are acategorial (docs/0002 §2.1): a word is built ROOT(+AFFIX)*+BADGE
// (§2.2). The root lexicon (data/lexicon.tsv) stores ~1.5k BARE roots; this script
// applies the three POS badges (§1) and the productive derivational affixes (§3.2)
// to each content root to generate the much larger set of actual surface WORDS —
// the "long tail" the derivation system was designed to cover (§9, docs/0006).
//
// Output: data/derived-lexicon.tsv (a separate, generated layer — the curated
// root lexicon stays the source of truth and is not touched).
//
// Discipline (CLAUDE.md): order-preserving, fail-fast, and SELF-VALIDATING through
// the REAL collision checker — every generated form is linted (R1–R6) and screened
// for collisions against the reserved grammatical words, the correlatives/closed
// class, the root lexicon, and every other derived form. A colliding form is
// DROPPED and reported; the script exits non-zero if anything fails to write
// cleanly. Run:  node --experimental-strip-types scripts/derive-lexicon.mjs
import { checkForm, RESERVED_FORMS } from "../tools/collision-checker/src/index.ts";
import { FUNCTION_WORDS } from "../tools/parser/src/morphology.ts";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CONCEPTS = "data/concepts.tsv";
const LEXICON = "data/lexicon.tsv";
const BLOCKLIST = "data/collision-blocklist.txt";
const FALSE_FRIENDS = "data/false-friends.tsv";
const OUT = "data/derived-lexicon.tsv";

// ---- loaders (mirror tools/collision-checker/src/cli.ts) -------------------
function readTsv(path) {
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

// ---- the derivation paradigm (docs/0002 §1, §3.2) --------------------------
// Each slot: { affixes?, badge, label, gloss(rootGloss) }. `affixes` is the
// root→outward chain (omitted/[] = a bare badge, the acategorial trifecta; one
// entry = first-order derivation; two = a curated second-order STACK, docs/0007
// §7). The English gloss is a TEMPLATED hint built from the root gloss; the Talo
// form + the morpheme labels are what is normative.
const BADGE = { ka: "noun", to: "verb", pe: "modifier" };

function q(g) { return `'${g}'`; }

// Paradigm chosen PER pos_hint so the derivations are semantically defensible
// rather than a blind cross-product (an instrument of a quality, a place of an
// adjective, etc. would be noise). See docs/0007 §2/§6/§7 for the rationale per
// slot. Slots marked "(2nd-order)" are the curated affix stacks (layer B).
const PARADIGM = {
  v: [
    { badge: "to", label: "verb", gloss: (g) => `to ${q(g)}` },
    { badge: "ka", label: "noun", gloss: (g) => `act of ${q(g)}; a ${q(g)}` },
    { badge: "pe", label: "modifier", gloss: (g) => `${q(g)}-ing` },
    { affixes: ["ki"], badge: "ka", label: "agent", gloss: (g) => `one who ${q(g)}s; ${q(g)}-er` },
    { affixes: ["tu"], badge: "ka", label: "instrument", gloss: (g) => `tool/means for ${q(g)}` },
    { affixes: ["bo"], badge: "ka", label: "patient/result", gloss: (g) => `thing ${q(g)}-ed; result of ${q(g)}` },
    { affixes: ["de"], badge: "ka", label: "place", gloss: (g) => `place for ${q(g)}` },
    { affixes: ["ta"], badge: "to", label: "causative", gloss: (g) => `to make/cause to ${q(g)}` },
    { affixes: ["pi"], badge: "to", label: "inchoative", gloss: (g) => `to begin to ${q(g)}` }, // A
    // curated 2nd-order stacks (B):
    { affixes: ["ta", "ki"], badge: "ka", label: "causative-agent", gloss: (g) => `one who makes/causes ${q(g)}; instigator of ${q(g)}` },
    { affixes: ["ta", "bo"], badge: "ka", label: "causative-result", gloss: (g) => `what is brought about by ${q(g)}` },
    { affixes: ["ki", "de"], badge: "ka", label: "agent-place", gloss: (g) => `place of the one who ${q(g)}s` },
  ],
  n: [
    { badge: "ka", label: "noun", gloss: (g) => `${g}` },
    { badge: "pe", label: "modifier", gloss: (g) => `of/like ${q(g)}; ${q(g)}-related` },
    { badge: "to", label: "verb", gloss: (g) => `to use/apply ${q(g)}; to act as ${q(g)}` }, // A
    { affixes: ["ci"], badge: "ka", label: "diminutive", gloss: (g) => `little ${q(g)}; small/dear ${q(g)}` },
    { affixes: ["go"], badge: "ka", label: "augmentative", gloss: (g) => `big ${q(g)}; great ${q(g)}` },
    { affixes: ["de"], badge: "ka", label: "place", gloss: (g) => `place of/for ${q(g)}` }, // A
  ],
  mod: [
    { badge: "pe", label: "modifier", gloss: (g) => `${g}` },
    { badge: "ka", label: "noun", gloss: (g) => `${q(g)}-ness; the quality ${q(g)}` },
    { affixes: ["pa"], badge: "ka", label: "quality", gloss: (g) => `${q(g)}-ness; state of being ${q(g)}` },
    { affixes: ["ku"], badge: "pe", label: "opposite", gloss: (g) => `opposite of ${q(g)}; un-${q(g)}` },
    { affixes: ["ta"], badge: "to", label: "causative", gloss: (g) => `to make ${q(g)}` },
    { affixes: ["pi"], badge: "to", label: "inchoative", gloss: (g) => `to become ${q(g)}` },
    { affixes: ["go"], badge: "pe", label: "augmentative", gloss: (g) => `very ${q(g)}; intensely ${q(g)}` }, // A
    { affixes: ["ci"], badge: "pe", label: "diminutive", gloss: (g) => `${q(g)}-ish; somewhat ${q(g)}` }, // A
    // curated 2nd-order stacks (B):
    { affixes: ["ku", "pa"], badge: "ka", label: "opposite-quality", gloss: (g) => `un-${q(g)}-ness; the quality of being not ${q(g)}` },
    { affixes: ["ta", "ki"], badge: "ka", label: "causative-agent", gloss: (g) => `one who makes things ${q(g)}` },
  ],
};

// ---- build the reserved/closed-class screen --------------------------------
// No derived form may collide with a grammatical word, a correlative, a numeral
// or any other closed-class word the parser knows by listing (docs/0002 §6).
const CORR_STEMS = ["se", "ini", "itu", "ba", "ha", "o"];
const CORR_CATS = ["la", "ko", "lo", "no", "fu", "wa", "mu"];
const reserved = new Set([
  ...RESERVED_FORMS,
  ...CORR_STEMS.flatMap((s) => CORR_CATS.map((c) => s + c)),
  ...Object.values(FUNCTION_WORDS).flatMap((s) => [...s]),
]);

// ---- main ------------------------------------------------------------------
function main() {
  const concepts = new Map(readTsv(CONCEPTS).map((r) => [r.id, r]));
  const lexicon = readTsv(LEXICON); // canonical order — preserved in the output
  const blocklist = loadBlocklist(BLOCKLIST);
  const falseFriends = loadFalseFriends(FALSE_FRIENDS);

  // occupied = reserved/closed class + every root + every derived form so far.
  const occupied = [...reserved].map((form) => ({ form, label: "reserved" }));
  for (const r of lexicon) if (r.form) occupied.push({ form: r.form, label: r.id });

  const rows = [];
  const dropped = [];
  let considered = 0;

  for (const lex of lexicon) {
    if (!lex.form) continue;
    const concept = concepts.get(lex.id);
    if (!concept) { console.error(`FATAL: lexicon id ${lex.id} has no concept row`); process.exit(1); }
    const slots = PARADIGM[concept.pos_hint];
    if (!slots) continue; // function words (fun) and numerals (num) are not derived

    const root = lex.form;
    const rootGloss = lex.gloss || concept.gloss;
    for (const slot of slots) {
      considered++;
      const affixes = slot.affixes ?? [];
      const form = root + affixes.join("") + slot.badge;
      const res = checkForm(form, occupied, blocklist, falseFriends);
      if (!res.ok) { dropped.push({ form, id: lex.id, why: res.conflict.kind, msg: res.conflict.message }); continue; }
      const morphemes = [root, ...affixes, slot.badge].join("+");
      rows.push({
        id: `${lex.id}.${affixes.join("") + slot.badge}`,
        form,
        gloss: slot.gloss(rootGloss),
        pos: BADGE[slot.badge],
        root,
        root_gloss: rootGloss,
        deriv: slot.label,
        morphemes,
      });
      occupied.push({ form, label: lex.id }); // feed back so later forms collide-check against it
    }
  }

  // ---- write -----------------------------------------------------------------
  const header = ["id", "form", "gloss", "pos", "root", "root_gloss", "deriv", "morphemes"];
  const body = rows.map((r) => header.map((h) => r[h]).join("\t")).join("\n");
  writeFileSync(OUT, header.join("\t") + "\n" + body + "\n");

  // ---- self-validate the written file ---------------------------------------
  // Re-read what we just wrote and confirm EVERY form passes the real checker
  // against the same screen (gate on outcome, not on the loop above).
  const written = readTsv(OUT);
  const reocc = [...reserved].map((form) => ({ form, label: "reserved" }));
  for (const r of lexicon) if (r.form) reocc.push({ form: r.form, label: r.id });
  let bad = 0;
  const seen = new Set();
  for (const r of written) {
    if (seen.has(r.form)) { console.error(`FATAL: duplicate derived form '${r.form}'`); bad++; continue; }
    const res = checkForm(r.form, reocc, blocklist, falseFriends);
    if (!res.ok) { console.error(`FATAL: written form '${r.form}' fails: ${res.conflict.message}`); bad++; }
    reocc.push({ form: r.form, label: r.id });
    seen.add(r.form);
  }

  // ---- report ----------------------------------------------------------------
  const byDeriv = {};
  for (const r of rows) byDeriv[r.deriv] = (byDeriv[r.deriv] ?? 0) + 1;
  console.log(`roots processed:   ${lexicon.filter((r) => r.form && PARADIGM[concepts.get(r.id)?.pos_hint]).length}`);
  console.log(`forms considered:  ${considered}`);
  console.log(`forms written:     ${rows.length}  -> ${OUT}`);
  const byKind = {};
  for (const d of dropped) byKind[d.why] = (byKind[d.why] ?? 0) + 1;
  console.log(`forms dropped:     ${dropped.length} (${Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join("  ")})`);
  console.log(`per derivation:    ${Object.entries(byDeriv).map(([k, v]) => `${k}=${v}`).join("  ")}`);
  if (dropped.length) {
    console.log("\ndropped (first 40):");
    for (const d of dropped.slice(0, 40)) console.log(`  ${d.form}  [${d.why}] ${d.id} — ${d.msg}`);
  }
  if (bad > 0) { console.error(`\nSELF-VALIDATION FAILED: ${bad} written form(s) invalid.`); process.exit(1); }
  console.log(`\nself-validation: ${written.length}/${written.length} written forms clear (exit 0)`);
}

main();

// Re-mint buffer-vowel forms by SIMPLIFYING (drop offending consonants) instead
// of inserting buffer vowels. Only touches rows whose form was padded; all other
// rows preserved byte-for-byte. Gated by the real collision checker.
import { checkForm, RESERVED_FORMS } from "../tools/collision-checker/src/index.ts";
import { readFileSync, writeFileSync } from "node:fs";

const VOWELS = new Set([..."aeiou"]);
const STOPS = new Set([..."ptkbdgc"]);
const CONS = new Set([..."ptkbdgcfshmnlwy"]);

// Simplify-legalise: map foreign letters, then walk left-to-right keeping a
// legal (C)V(n) shape. On an illegal consonant juncture, DROP the consonant
// (don't pad). Final consonant other than n is dropped. No doubled vowels.
function simplify(raw) {
  let s = raw.toLowerCase();
  const map = { r: "l", j: "y", v: "w", z: "s", q: "k", x: "k" };
  s = [...s].map((c) => map[c] ?? c).join("");
  s = [...s].filter((c) => VOWELS.has(c) || CONS.has(c)).join("");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const prev = out[out.length - 1] ?? "";
    const next = s[i + 1] ?? "";
    if (VOWELS.has(c)) {
      if (prev === c) continue; // no doubled vowel
      out += c;
    } else {
      if (prev === "" || VOWELS.has(prev)) {
        // legal onset only if a vowel follows (or it's 'n' before a stop later)
        if (VOWELS.has(next)) out += c;
        else if (c === "n" && STOPS.has(next)) out += c; // coda n + stop
        else { /* drop: consonant with no following vowel */ }
      } else if (prev === "n" && STOPS.has(c)) {
        out += c; // legal n+stop cluster
      } else {
        // illegal juncture: drop this consonant
      }
    }
  }
  // strip trailing consonant unless it's 'n'
  while (out.length && !VOWELS.has(out.at(-1)) && out.at(-1) !== "n") out = out.slice(0, -1);
  out = out.replace(/([aeiou])\1+/g, "$1");
  return out;
}

const lexLines = readFileSync("data/lexicon.tsv", "utf8").trim().split("\n");
const header = lexLines[0];
const rows = lexLines.slice(1).map((l) => l.split("\t"));

// occupied = reserved + all forms that are NOT being re-minted (filled below)
function srcOf(r) { const m = (r[4] || "").match(/src .(.+?).$/); return m ? m[1] : null; }
const norm = (x) => [...x.toLowerCase()].map((c) => ({ r: "l", j: "y", v: "w", z: "s", q: "k", x: "k" }[c] || c)).join("");

// A row is a buffer-vowel candidate iff it has a src and the form is longer than
// the simple mapping of src (i.e. vowels were inserted).
const isPadded = (r) => { const s = srcOf(r); return s && r[2].length > norm(s).length; };

const toRemint = rows.filter(isPadded);
const keep = rows.filter((r) => !isPadded(r));

// seed occupied with reserved + kept forms
const occupied = [...RESERVED_FORMS].map((f) => ({ form: f, label: "reserved" }));
for (const r of keep) occupied.push({ form: r[2], label: r[0] });

const vowels = ["a", "e", "i", "o", "u"];
const cmix = ["k", "t", "p", "n", "s", "l", "m"];
let changed = 0, fails = [];
const changes = [];
for (const r of toRemint) {
  const src = srcOf(r);
  const base = simplify(src);
  let cand = base, ok = base.length >= 2 && checkForm(base, occupied).ok;
  for (let t = 1; t < 60 && !ok; t++) {
    if (t <= 5) cand = base + vowels[t - 1];
    else if (t <= 30) cand = base + vowels[t % 5] + cmix[t % 7] + vowels[Math.floor(t / 5) % 5];
    else cand = base + vowels[t % 5] + vowels[(t + 2) % 5];
    cand = simplify(cand);
    ok = cand.length >= 2 && checkForm(cand, occupied).ok;
  }
  if (!ok) { fails.push(r[0] + "/" + src); continue; }
  if (cand !== r[2]) { changes.push(r[0] + "\t" + r[2] + " -> " + cand); changed++; }
  occupied.push({ form: cand, label: r[0] });
  r[2] = cand;
  r[4] = "blend rubric; src '" + src + "' (simplified)";
  r[5] = "blend (simplified)";
}

if (fails.length) { console.error("ABORT fails: " + fails.join(", ")); process.exit(1); }

// rebuild file preserving original row order
const byId = new Map(rows.map((r) => [r[0], r]));
const outRows = lexLines.slice(1).map((l) => byId.get(l.split("\t")[0]).join("\t"));
writeFileSync("data/lexicon.tsv", header + "\n" + outRows.join("\n") + "\n");
writeFileSync("/tmp/polish-report.txt", "candidates=" + toRemint.length + " changed=" + changed + "\n" + changes.join("\n"));
console.log("candidates=" + toRemint.length + " changed=" + changed + " fails=" + fails.length);

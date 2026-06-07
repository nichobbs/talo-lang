/**
 * Talo word-lookup — a dependency-free client-side search over dictionary.json.
 *
 * The dictionary is small (~1,500 entries / ~280 KB), so we load it once and
 * filter in memory on each keystroke. Ranking favours exact matches, then
 * prefix matches, then substring matches, in both the Talo form and the English
 * gloss keywords. No build step, no framework — it runs as a static file and on
 * GitHub Pages as-is.
 */
"use strict";

const els = {
  q: document.getElementById("q"),
  dir: document.getElementById("dir"),
  domain: document.getElementById("domain"),
  tier: document.getElementById("tier"),
  results: document.getElementById("results"),
  empty: document.getElementById("empty"),
  count: document.getElementById("count"),
};

let ENTRIES = [];
/** form → entry (first occurrence wins), for cross-reference resolution. */
const BY_FORM = new Map();
/** root form → its non-trivial derivations and compounds (the word family). */
const FAMILY = new Map();
/** merge-skeleton → root entries sharing it (near-homophone confusables). */
const SKEL = new Map();

/**
 * Merge-skeleton: weak stop contrast neutralised (b→p, d→t, g→k). Two forms are
 * near-homophones iff they share a skeleton. Mirrors tools/collision-checker's
 * skeleton() so "sounds like" here matches what the collision gate would flag.
 */
const WEAK = { b: "p", d: "t", g: "k" };
function skeleton(form) {
  let out = "";
  for (const c of form.toLowerCase()) out += WEAK[c] || c;
  return out;
}

/* Audio: speak a Talo form. Talo is phonemic/5-vowel with c=/tʃ/, y=/j/, so an
 * Indonesian voice reads it almost correctly (fallback: other 5-vowel langs). */
const SPEAK_OK = typeof window !== "undefined" && "speechSynthesis" in window;
let VOICE = null;
function pickVoice() {
  if (!SPEAK_OK) return;
  const vs = speechSynthesis.getVoices();
  for (const pref of ["id", "ms", "it", "es", "sw"]) {
    const v = vs.find((x) => (x.lang || "").toLowerCase().startsWith(pref));
    if (v) { VOICE = v; return; }
  }
}
function speak(text) {
  if (!SPEAK_OK || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = (VOICE && VOICE.lang) || "id-ID";
  if (VOICE) u.voice = VOICE;
  u.rate = 0.92;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
const sayBtn = (t) => (SPEAK_OK ? `<button class="say" data-say="${escapeHtml(t)}" title="play aloud" aria-label="play aloud">🔊</button>` : "");

const BADGE_TAG = { ka: "N", to: "V", pe: "MOD" };
const isContentRoot = (e) => !!e && e.kind === "root" && ["n", "v", "mod"].includes(e.pos);

/**
 * Citation-form coincidences for a root entry (mirrors tools/derivation-explorer's
 * badgeCoincidences): `readsAs` = this headword parses, in text, as a content
 * root + a badge; `spells` = this content root's own badge forms each spell
 * another root. Only content stems (pos n/v/mod) count — function words and
 * numerals take no badge, so they make no surface coincidence.
 */
function badgeCoincidence(e) {
  const out = { readsAs: null, spells: [] };
  if (!e || e.kind !== "root") return out;
  const m = /(ka|to|pe)$/.exec(e.form);
  if (m) {
    const stem = BY_FORM.get(e.form.slice(0, -2));
    if (isContentRoot(stem)) out.readsAs = { stem, badge: BADGE_TAG[m[0]] };
  }
  if (isContentRoot(e)) {
    for (const b of ["ka", "to", "pe"]) {
      const r = BY_FORM.get(e.form + b);
      if (r && r.kind === "root") out.spells.push({ badge: BADGE_TAG[b], root: r });
    }
  }
  return out;
}

/** Build the cross-reference indices once, after the data loads. */
function buildIndices() {
  for (const e of ENTRIES) if (!BY_FORM.has(e.form)) BY_FORM.set(e.form, e);

  const addFam = (root, e) => {
    if (!FAMILY.has(root)) FAMILY.set(root, []);
    FAMILY.get(root).push(e);
  };
  for (const e of ENTRIES) {
    if (e.kind === "derived" && e.base) {
      // skip the trivial bare-badge forms (root+badge, 2 segments); keep the
      // affixed derivations (root+affix+badge) that a learner can't predict.
      if ((e.morphemes || "").split("+").length >= 3) addFam(e.base, e);
    } else if (e.kind === "compound" && e.morphemes) {
      const segs = e.morphemes.split("+").filter((s) => !["ka", "to", "pe"].includes(s));
      for (const s of new Set(segs)) if (BY_FORM.has(s)) addFam(s, e);
    }
  }

  for (const e of ENTRIES) {
    if (e.kind !== "root") continue;
    const k = skeleton(e.form);
    if (!SKEL.has(k)) SKEL.set(k, []);
    SKEL.get(k).push(e);
  }
}

/** Score one entry against a lowercased query; higher = better, 0 = no match. */
function score(entry, q, dir) {
  const form = entry.form.toLowerCase();
  const kws = entry.keywords.map((k) => k.toLowerCase());
  const gloss = entry.gloss.toLowerCase();
  let best = 0;

  const taloOk = dir !== "e2t";
  const engOk = dir !== "t2e";

  if (taloOk) {
    if (form === q) best = Math.max(best, 100);
    else if (form.startsWith(q)) best = Math.max(best, 70);
    else if (form.includes(q)) best = Math.max(best, 40);
  }
  if (engOk) {
    for (const k of kws) {
      if (k === q) best = Math.max(best, 95);
      else if (k.startsWith(q)) best = Math.max(best, 65);
      else if (k.includes(q)) best = Math.max(best, 35);
    }
    if (best === 0 && gloss.includes(q)) best = 25;
  }
  return best;
}

function badgeChips(b) {
  const out = [];
  if (b.noun) out.push(`<span class="chip n">${b.noun} <em>n</em></span>`);
  if (b.verb) out.push(`<span class="chip v">${b.verb} <em>v</em></span>`);
  if (b.modifier) out.push(`<span class="chip m">${b.modifier} <em>mod</em></span>`);
  return out.join("");
}

function render(list) {
  els.results.innerHTML = list
    .map((e) => {
      const chips = badgeChips(e.badges || {});
      const tier = e.tier ? `<span class="tier t${e.tier}">tier ${e.tier}</span>` : "";
      // roots: show the concept's derivation note. derived/compound surface words
      // (kind from docs/0007): show the relation + the morpheme breakdown so the
      // learner sees HOW the word is built.
      let deriv = "";
      if (e.kind === "derived" || e.kind === "compound") {
        const rel = e.kind === "compound" ? "compound" : escapeHtml(e.derivation || "derived");
        const morph = e.morphemes ? ` <span class="morph">${escapeHtml(e.morphemes)}</span>` : "";
        deriv = ` · <span class="deriv">${rel}</span>${morph}`;
      } else if (e.derivation) {
        deriv = ` · <span class="deriv">derived: ${escapeHtml(e.derivation)}</span>`;
      }
      const ipa = e.ipa ? `<span class="ipa">${escapeHtml(e.ipa)}</span>` : "";
      return `<li class="entry ${escapeHtml(e.kind || "root")}">
        <div class="head"><span class="form">${escapeHtml(e.form)}</span>${sayBtn(e.form)}${ipa}
          <span class="gloss">${escapeHtml(e.gloss)}</span></div>
        <div class="meta"><span class="domain">${escapeHtml(e.domainName)}</span> ${tier}${deriv}</div>
        ${chips ? `<div class="chips">${chips}</div>` : ""}
        ${detailBlocks(e)}
      </li>`;
    })
    .join("");
}

/** A clickable cross-reference that re-runs the search on the given form. */
function formLink(e) {
  return `<a class="flink" data-q="${escapeHtml(e.form)}" title="${escapeHtml(e.gloss)}" href="#">${escapeHtml(e.form)}</a>`;
}

/**
 * The expandable detail under an entry: its source root (for derived/compounds),
 * attested corpus examples, its word family (derivations + compounds), the words
 * it could be confused with by ear, and any cross-language false-friend warning.
 */
function detailBlocks(e) {
  const out = [];

  if (e.base && BY_FORM.has(e.base)) {
    const r = BY_FORM.get(e.base);
    out.push(`<div class="xref"><span class="lbl">root</span> ${formLink(r)} <span class="g">${escapeHtml(r.gloss)}</span></div>`);
  }

  if (e.examples && e.examples.length) {
    const items = e.examples
      .map((x) => `<li><span class="ex-t">${escapeHtml(x.talo)}</span> <span class="ex-e">${escapeHtml(x.en)}</span></li>`)
      .join("");
    out.push(`<div class="examples"><span class="lbl">examples</span><ul>${items}</ul></div>`);
  }

  const fam = FAMILY.get(e.form);
  if (fam && fam.length) {
    const items = fam.slice(0, 14).map(formLink).join(" · ");
    const more = fam.length > 14 ? ` <span class="more">+${fam.length - 14}</span>` : "";
    out.push(`<div class="xref"><span class="lbl">family</span> ${items}${more}</div>`);
  }

  if (e.kind === "root") {
    const conf = (SKEL.get(skeleton(e.form)) || []).filter((x) => x.form !== e.form);
    if (conf.length) {
      const items = conf
        .slice(0, 6)
        .map((c) => `${formLink(c)} <span class="g">${escapeHtml(c.gloss)}</span>`)
        .join(" · ");
      out.push(`<div class="xref confuse"><span class="lbl">sounds like</span> ${items}</div>`);
    }
    // citation-form coincidences: this headword reads, in text, as another
    // content root + a badge (and/or this root's own badge forms spell other
    // roots). A content root never surfaces bare, so the two are confusable on
    // the page even though running text is unambiguous (see tools/derivation-explorer).
    const bc = badgeCoincidence(e);
    if (bc.readsAs) {
      const s = bc.readsAs.stem;
      out.push(`<div class="xref confuse"><span class="lbl">reads as</span> ${formLink(s)}+${bc.readsAs.badge} <span class="g">${escapeHtml(s.gloss)}</span> <span class="g">(in text; this root surfaces with its own badge)</span></div>`);
    }
    if (bc.spells.length) {
      const items = bc.spells
        .map((x) => `${escapeHtml(e.form)}+${x.badge} = ${formLink(x.root)} <span class="g">${escapeHtml(x.root.gloss)}</span>`)
        .join(" · ");
      out.push(`<div class="xref confuse"><span class="lbl">spelled like</span> ${items}</div>`);
    }
  }

  if (e.falseFriend) {
    out.push(`<div class="xref ff"><span class="lbl">false friend</span> ${escapeHtml(e.falseFriend)}</div>`);
  }

  return out.join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function update() {
  const q = els.q.value.trim().toLowerCase();
  const dir = els.dir.value;
  const domain = els.domain.value;
  const tier = els.tier.value;

  let list = ENTRIES;
  if (domain) list = list.filter((e) => e.domain === domain);
  if (tier) list = list.filter((e) => String(e.tier) === tier);

  if (q) {
    list = list
      .map((e) => ({ e, s: score(e, q, dir) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.form.localeCompare(b.e.form))
      .slice(0, 200)
      .map((x) => x.e);
  } else {
    // no query: show a stable alphabetical slice so the page isn't blank
    list = [...list].sort((a, b) => a.form.localeCompare(b.form)).slice(0, 60);
  }

  render(list);
  els.empty.hidden = list.length > 0;
  els.count.textContent = q
    ? `${list.length} match${list.length === 1 ? "" : "es"}${list.length === 200 ? "+ (showing first 200)" : ""}`
    : `${ENTRIES.length} words`;
}

function populateDomains() {
  const names = new Map();
  for (const e of ENTRIES) if (!names.has(e.domain)) names.set(e.domain, e.domainName);
  const sorted = [...names.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  for (const [code, name] of sorted) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = name;
    els.domain.appendChild(opt);
  }
}

async function init() {
  try {
    const res = await fetch("dictionary.json");
    ENTRIES = await res.json();
  } catch (err) {
    els.results.innerHTML = `<li class="entry error">Could not load the dictionary data (${escapeHtml(String(err))}).</li>`;
    return;
  }
  buildIndices();
  populateDomains();
  for (const el of [els.q, els.dir, els.domain, els.tier]) {
    el.addEventListener("input", update);
  }
  // delegated: clicking a cross-reference re-runs the search on that form.
  if (SPEAK_OK) { pickVoice(); speechSynthesis.addEventListener("voiceschanged", pickVoice); }
  els.results.addEventListener("click", (ev) => {
    const sb = ev.target.closest(".say");
    if (sb) { ev.preventDefault(); speak(sb.dataset.say); return; }
    const a = ev.target.closest(".flink");
    if (!a) return;
    ev.preventDefault();
    els.q.value = a.dataset.q;
    els.dir.value = "t2e";
    update();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  // support ?q= deep links
  const params = new URLSearchParams(location.search);
  if (params.get("q")) els.q.value = params.get("q");
  update();
}

init();

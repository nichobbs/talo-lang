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
        <div class="head"><span class="form">${escapeHtml(e.form)}</span>${ipa}
          <span class="gloss">${escapeHtml(e.gloss)}</span></div>
        <div class="meta"><span class="domain">${escapeHtml(e.domainName)}</span> ${tier}${deriv}</div>
        ${chips ? `<div class="chips">${chips}</div>` : ""}
      </li>`;
    })
    .join("");
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
  populateDomains();
  for (const el of [els.q, els.dir, els.domain, els.tier]) {
    el.addEventListener("input", update);
  }
  // support ?q= deep links
  const params = new URLSearchParams(location.search);
  if (params.get("q")) els.q.value = params.get("q");
  update();
}

init();

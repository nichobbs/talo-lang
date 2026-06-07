/**
 * Talo Reader — read real corpus texts with vocabulary help.
 *
 * Loads the corpus feed (corpus.json, built from corpus/articles/) and the
 * dictionary (dictionary.json). Each Talo word becomes a tap target: tapping it
 * resolves the surface form against the dictionary and shows a pop-up with the
 * entry, how the word is built, its root, and the rest of its word-family —
 * each a link that re-opens the pop-up so you can wander the lexicon. Tapping a
 * line reveals the English translation. Dependency-free; runs as a static file.
 */
"use strict";

const els = {
  article: document.getElementById("article"),
  revealAll: document.getElementById("revealAll"),
  title: document.getElementById("artTitle"),
  note: document.getElementById("artNote"),
  body: document.getElementById("body"),
  pop: document.getElementById("pop"),
};

let ENTRIES = [];
let CORPUS = [];
const BY_FORM = new Map();      // form → entry
const FAMILY = new Map();       // root form → its affixed derivations + compounds

const BADGE_TAG = { ka: "N", to: "V", pe: "MOD" };
const FUNCTION_GLOSS = {
  na: "to", lo: "at", su: "toward", fe: "from", wa: "with", we: "of", tanpa: "without",
  li: "completive (done)", wi: "progressive (-ing)", ne: "not", ke: "(yes/no question)",
  pu: "(plural)", i: "and", o: "or", ma: "but", fi: "if", andai: "if (unreal)",
  hata: "until", toki: "then", ce: "that / whether", sewa: "as / how",
  mi: "I / we", yu: "you", te: "he/she/it/they",
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/** Build form→entry and root→family indices (mirrors the dictionary tool). */
function buildIndices() {
  for (const e of ENTRIES) if (!BY_FORM.has(e.form)) BY_FORM.set(e.form, e);
  const add = (root, e) => { (FAMILY.get(root) || FAMILY.set(root, []).get(root)).push(e); };
  for (const e of ENTRIES) {
    if (e.kind === "derived" && e.base) {
      if ((e.morphemes || "").split("+").length >= 3) add(e.base, e); // skip bare root+badge
    } else if (e.kind === "compound" && e.morphemes) {
      const segs = e.morphemes.split("+").filter((s) => !["ka", "to", "pe"].includes(s));
      for (const s of new Set(segs)) if (BY_FORM.has(s)) add(s, e);
    }
  }
}

/** Clean a surface token to a dictionary-lookup key (Talo is a–z, lowercase). */
const keyOf = (raw) => raw.toLowerCase().replace(/[^a-z]/g, "");

/** Resolve a surface token to its best dictionary entry, or null. */
function resolve(raw) {
  const k = keyOf(raw);
  if (!k) return null;
  return BY_FORM.get(k) || null;
}

/* ----------------------------------------------------------------- rendering */

function renderArticleList() {
  els.article.innerHTML = CORPUS.map(
    (a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.id)} · ${escapeHtml(a.title)}</option>`
  ).join("");
}

function wordSpan(raw) {
  const k = keyOf(raw);
  // a token is tappable iff it has letters; punctuation rides along in the label
  if (!/[a-z]/i.test(raw)) return escapeHtml(raw);
  const known = BY_FORM.has(k) || FUNCTION_GLOSS[k];
  return `<button class="w${known ? "" : " unknown"}" data-k="${escapeHtml(k)}">${escapeHtml(raw)}</button>`;
}

function renderArticle(a) {
  els.title.textContent = `${a.id} · ${a.title}`;
  els.note.textContent = a.note || "";
  els.body.innerHTML = a.clauses
    .map((c) => {
      const words = c.talo.split(/(\s+)/).map((tok) => (/\s/.test(tok) ? tok : wordSpan(tok))).join("");
      return `<div class="clause"><p class="talo">${words}</p><p class="en" hidden>${escapeHtml(c.en)}</p></div>`;
    })
    .join("");
}

function selectArticle(id) {
  const a = CORPUS.find((x) => x.id === id) || CORPUS[0];
  if (!a) return;
  els.article.value = a.id;
  renderArticle(a);
  const url = new URL(location.href);
  url.searchParams.set("a", a.id);
  history.replaceState(null, "", url);
}

/* -------------------------------------------------------------------- pop-up */

function relatedLinks(e) {
  const out = [];
  if (e.base && BY_FORM.has(e.base)) {
    const r = BY_FORM.get(e.base);
    out.push(`<div class="pop-row"><span class="lbl">root</span> ${flink(r)} <span class="g">${escapeHtml(r.gloss)}</span></div>`);
  }
  if (e.kind === "compound" && e.morphemes) {
    const parts = e.morphemes.split("+").filter((s) => !["ka", "to", "pe"].includes(s))
      .map((s) => BY_FORM.get(s)).filter(Boolean);
    if (parts.length) out.push(`<div class="pop-row"><span class="lbl">parts</span> ${parts.map(flink).join(" + ")}</div>`);
  }
  // word family = derivations/compounds of this word's root (or of itself if root)
  const famRoot = e.kind === "root" ? e.form : e.base;
  const fam = (FAMILY.get(famRoot) || []).filter((x) => x.form !== e.form);
  if (fam.length) {
    const items = fam.slice(0, 16).map(flink).join(" · ");
    const more = fam.length > 16 ? ` <span class="more">+${fam.length - 16}</span>` : "";
    out.push(`<div class="pop-row"><span class="lbl">family</span> ${items}${more}</div>`);
  }
  return out.join("");
}

const flink = (e) => `<a class="flink" data-k="${escapeHtml(e.form)}" href="#" title="${escapeHtml(e.gloss)}">${escapeHtml(e.form)}</a>`;

function popHtml(k) {
  const e = BY_FORM.get(k);
  if (!e) {
    const fn = FUNCTION_GLOSS[k];
    const body = fn
      ? `<div class="pop-gloss">${escapeHtml(fn)}</div><div class="pop-build">grammatical word — takes no badge</div>`
      : `<div class="pop-gloss">no dictionary entry</div><div class="pop-build">a name, or a fused numeral — see the line's translation</div>`;
    return `<div class="pop-card"><button class="pop-x" aria-label="close">×</button>
      <div class="pop-head"><span class="form">${escapeHtml(k)}</span></div>${body}</div>`;
  }
  let build = "";
  if (e.kind === "derived" || e.kind === "compound") {
    const rel = e.kind === "compound" ? "compound" : escapeHtml(e.derivation || "derived");
    const morph = e.morphemes ? ` <span class="morph">${escapeHtml(e.morphemes)}</span>` : "";
    build = `<div class="pop-build">${rel}${morph}</div>`;
  } else {
    build = `<div class="pop-build">root · ${escapeHtml(e.domainName || e.domain || "")}${e.tier ? " · tier " + e.tier : ""}</div>`;
  }
  const ipa = e.ipa ? `<span class="ipa">${escapeHtml(e.ipa)}</span>` : "";
  return `<div class="pop-card"><button class="pop-x" aria-label="close">×</button>
    <div class="pop-head"><span class="form">${escapeHtml(e.form)}</span>${ipa}</div>
    <div class="pop-gloss">${escapeHtml(e.gloss)}</div>
    ${build}
    ${relatedLinks(e)}
    <a class="pop-dict" href="lookup.html?q=${encodeURIComponent(e.form)}">open in dictionary →</a></div>`;
}

function showPop(k, anchor) {
  els.pop.innerHTML = popHtml(k);
  els.pop.hidden = false;
  // position under the anchor, clamped to the viewport (a bottom card on phones)
  const card = els.pop.firstElementChild;
  const r = anchor.getBoundingClientRect();
  const pad = 8;
  const w = card.offsetWidth;
  let left = window.scrollX + r.left;
  left = Math.max(pad, Math.min(left, window.scrollX + document.documentElement.clientWidth - w - pad));
  els.pop.style.left = `${left}px`;
  els.pop.style.top = `${window.scrollY + r.bottom + 6}px`;
}

function hidePop() { els.pop.hidden = true; els.pop.innerHTML = ""; }

/* ---------------------------------------------------------------- behaviour */

let lastAnchor = null;

document.addEventListener("click", (ev) => {
  const w = ev.target.closest(".w");
  if (w) { lastAnchor = w; showPop(w.dataset.k, w); ev.stopPropagation(); return; }
  const fl = ev.target.closest(".flink");
  if (fl) { ev.preventDefault(); showPop(fl.dataset.k, lastAnchor || fl); return; }
  if (ev.target.closest(".pop-x")) { hidePop(); return; }
  if (els.pop.contains(ev.target)) return;       // clicks inside the card: ignore
  hidePop();
  const clause = ev.target.closest(".clause");   // tapping a line reveals its translation
  if (clause) clause.classList.toggle("revealed");
});
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") hidePop(); });

async function init() {
  try {
    [ENTRIES, CORPUS] = await Promise.all([
      fetch("dictionary.json").then((r) => r.json()),
      fetch("corpus.json").then((r) => r.json()),
    ]);
  } catch (err) {
    els.body.innerHTML = `<p class="empty">Could not load the data (${escapeHtml(String(err))}).</p>`;
    return;
  }
  buildIndices();
  renderArticleList();
  els.article.addEventListener("change", () => selectArticle(els.article.value));
  els.revealAll.addEventListener("change", () =>
    document.body.classList.toggle("reveal-all", els.revealAll.checked)
  );
  const want = new URLSearchParams(location.search).get("a");
  selectArticle(want || (CORPUS[0] && CORPUS[0].id));
}

init();

/**
 * Talo Reader — read real corpus texts with vocabulary help.
 *
 * Loads the corpus feed (corpus.json, built from corpus/articles/) and the
 * dictionary (dictionary.json). Each Talo word is a tap target: the pop-up shows
 * its entry, how it's built, its root, its word-family, and attested examples —
 * each a link that re-opens the pop-up. Optional inline word-glosses (ruby) and
 * line-by-line translation reveal. Read texts are remembered in localStorage.
 * Dependency-free; runs as a static file.
 */
"use strict";

const els = {
  article: document.getElementById("article"),
  randomBtn: document.getElementById("randomBtn"),
  readcount: document.getElementById("readcount"),
  glossToggle: document.getElementById("glossToggle"),
  revealAll: document.getElementById("revealAll"),
  title: document.getElementById("artTitle"),
  note: document.getElementById("artNote"),
  body: document.getElementById("body"),
  pop: document.getElementById("pop"),
};

let ENTRIES = [];
let CORPUS = [];
const BY_FORM = new Map();   // form → entry
const FAMILY = new Map();    // root form → affixed derivations + compounds

const READ_KEY = "talo-read";
const READ = new Set(loadRead());
function loadRead() { try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch { return []; } }
function saveRead() { try { localStorage.setItem(READ_KEY, JSON.stringify([...READ])); } catch { /* ignore */ } }

const FUNCTION_GLOSS = {
  na: "to", lo: "at", su: "toward", fe: "from/of", wa: "with", we: "of", tanpa: "without",
  li: "done", wi: "-ing", ne: "not", ke: "?", pu: "(plural)", i: "and", o: "or",
  ma: "but", fi: "if", andai: "if (unreal)", hata: "until", toki: "then",
  ce: "that/whether", sewa: "as/how", kena: "(passive)", sa: "when",
  mi: "I/we", yu: "you", te: "he/she/it/they",
  ata: "up", sita: "down", lua: "outside", naka: "in", dole: "which",
  kadan: "sometimes", selin: "often",
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* --------------------------------------------------------------- audio (TTS) */
// Talo is phonemic, 5-vowel, with c=/tʃ/ and y=/j/ — Indonesian orthography reads
// it almost correctly, so we drive the browser's speech engine in Indonesian
// (falling back through other 5-vowel languages, then the default voice).
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
const sayBtn = (text) => (SPEAK_OK ? `<button class="say" data-say="${escapeHtml(text)}" title="play aloud" aria-label="play aloud">🔊</button>` : "");

function buildIndices() {
  for (const e of ENTRIES) if (!BY_FORM.has(e.form)) BY_FORM.set(e.form, e);
  const add = (root, e) => { (FAMILY.get(root) || FAMILY.set(root, []).get(root)).push(e); };
  for (const e of ENTRIES) {
    if (e.kind === "derived" && e.base) {
      if ((e.morphemes || "").split("+").length >= 3) add(e.base, e);
    } else if (e.kind === "compound" && e.morphemes) {
      for (const s of new Set(e.morphemes.split("+").filter((x) => !["ka", "to", "pe"].includes(x)))) {
        if (BY_FORM.has(s)) add(s, e);
      }
    }
  }
}

const keyOf = (raw) => raw.toLowerCase().replace(/[^a-z]/g, "");

/** A short hint gloss for the inline ruby line. */
function shortGloss(g) {
  let s = String(g).replace(/^(to|act of|a|an|the|one who|thing)\s+/i, "").replace(/['"]/g, "");
  s = s.split(/[;,/(]/)[0].trim();
  return s.length > 18 ? s.slice(0, 17) + "…" : s;
}
function hintGloss(k) {
  const e = BY_FORM.get(k);
  if (e) return shortGloss(e.gloss);
  if (FUNCTION_GLOSS[k]) return FUNCTION_GLOSS[k];
  return "";
}

/* ----------------------------------------------------------------- rendering */

function renderArticleList() {
  els.article.innerHTML = CORPUS.map(
    (a) => `<option value="${escapeHtml(a.id)}">${READ.has(a.id) ? "✓ " : ""}${escapeHtml(a.id)} · ${escapeHtml(a.title)}</option>`
  ).join("");
  els.readcount.textContent = `${READ.size} / ${CORPUS.length} read`;
}

function wordSpan(raw) {
  if (!/[a-z]/i.test(raw)) return escapeHtml(raw); // pure punctuation
  const k = keyOf(raw);
  const known = BY_FORM.has(k) || FUNCTION_GLOSS[k];
  const g = hintGloss(k);
  const inner = g
    ? `<ruby>${escapeHtml(raw)}<rt>${escapeHtml(g)}</rt></ruby>`
    : escapeHtml(raw);
  return `<button class="w${known ? "" : " unknown"}" data-k="${escapeHtml(k)}">${inner}</button>`;
}

function renderArticle(a) {
  els.title.textContent = `${a.id} · ${a.title}`;
  els.note.textContent = a.note || "";
  els.body.innerHTML = a.clauses
    .map((c) => {
      const words = c.talo.split(/(\s+)/).map((t) => (/\s/.test(t) ? t : wordSpan(t))).join("");
      return `<div class="clause"><p class="talo">${sayBtn(c.talo)}${words}</p><p class="en" hidden>${escapeHtml(c.en)}</p></div>`;
    })
    .join("");
}

function selectArticle(id) {
  const a = CORPUS.find((x) => x.id === id) || CORPUS[0];
  if (!a) return;
  els.article.value = a.id;
  renderArticle(a);
  if (!READ.has(a.id)) { READ.add(a.id); saveRead(); renderArticleList(); els.article.value = a.id; }
  const url = new URL(location.href);
  url.searchParams.set("a", a.id);
  history.replaceState(null, "", url);
  hidePop();
}

/* -------------------------------------------------------------------- pop-up */

const flink = (e) => `<a class="flink" data-k="${escapeHtml(e.form)}" href="#" title="${escapeHtml(e.gloss)}">${escapeHtml(e.form)}</a>`;

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
  const famRoot = e.kind === "root" ? e.form : e.base;
  const fam = (FAMILY.get(famRoot) || []).filter((x) => x.form !== e.form);
  if (fam.length) {
    const items = fam.slice(0, 14).map(flink).join(" · ");
    const more = fam.length > 14 ? ` <span class="more">+${fam.length - 14}</span>` : "";
    out.push(`<div class="pop-row"><span class="lbl">family</span> ${items}${more}</div>`);
  }
  if (e.examples && e.examples.length) {
    const items = e.examples.slice(0, 2)
      .map((x) => `<li><span class="ex-t">${escapeHtml(x.talo)}</span><span class="ex-e">${escapeHtml(x.en)}</span></li>`)
      .join("");
    out.push(`<div class="pop-row ex"><span class="lbl">examples</span><ul>${items}</ul></div>`);
  }
  return out.join("");
}

function popHtml(k) {
  const e = BY_FORM.get(k);
  if (!e) {
    const fn = FUNCTION_GLOSS[k];
    const body = fn
      ? `<div class="pop-gloss">${escapeHtml(fn)}</div><div class="pop-build">grammatical word — takes no badge</div>`
      : `<div class="pop-gloss">no dictionary entry</div><div class="pop-build">a name, or a fused numeral — see the line's translation</div>`;
    return `<div class="pop-card"><button class="pop-x" aria-label="close">×</button>
      <div class="pop-head"><span class="form">${escapeHtml(k)}</span>${sayBtn(k)}</div>${body}</div>`;
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
    <div class="pop-head"><span class="form">${escapeHtml(e.form)}</span>${ipa}${sayBtn(e.form)}</div>
    <div class="pop-gloss">${escapeHtml(e.gloss)}</div>
    ${build}
    ${relatedLinks(e)}
    <a class="pop-dict" href="lookup.html?q=${encodeURIComponent(e.form)}">open in dictionary →</a></div>`;
}

function showPop(k, anchor) {
  els.pop.innerHTML = popHtml(k);
  els.pop.hidden = false;
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
  const sb = ev.target.closest(".say");
  if (sb) { ev.preventDefault(); ev.stopPropagation(); speak(sb.dataset.say); return; }
  const w = ev.target.closest(".w");
  if (w) { lastAnchor = w; showPop(w.dataset.k, w); ev.stopPropagation(); return; }
  const fl = ev.target.closest(".flink");
  if (fl) { ev.preventDefault(); showPop(fl.dataset.k, lastAnchor || fl); return; }
  if (ev.target.closest(".pop-x")) { hidePop(); return; }
  if (els.pop.contains(ev.target)) return;
  hidePop();
  const clause = ev.target.closest(".clause");
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
  if (SPEAK_OK) { pickVoice(); speechSynthesis.addEventListener("voiceschanged", pickVoice); }
  renderArticleList();
  els.article.addEventListener("change", () => selectArticle(els.article.value));
  els.randomBtn.addEventListener("click", () => {
    const pick = CORPUS[Math.floor(Math.random() * CORPUS.length)];
    if (pick) { selectArticle(pick.id); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });
  els.glossToggle.addEventListener("change", () =>
    document.body.classList.toggle("gloss-on", els.glossToggle.checked));
  els.revealAll.addEventListener("change", () =>
    document.body.classList.toggle("reveal-all", els.revealAll.checked));
  const want = new URLSearchParams(location.search).get("a");
  selectArticle(want || (CORPUS[0] && CORPUS[0].id));
}

init();

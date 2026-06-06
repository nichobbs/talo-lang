/* Talo Practice — learn by translating.
 *
 * Loads the pre-built deck (exercises.json: each item carries `tokens` with
 * per-word gloss/POS/IPA for tooltips, and `accept` with the acceptable English
 * answers). All grading is client-side string normalisation — the heavy lifting
 * (parsing, translation) was done at build time by tools/exercises. Zero deps. */
"use strict";

const $ = (id) => document.getElementById(id);
const state = { deck: [], view: [], i: 0, mode: "comprehension", level: "", answered: false };

const ARTICLES = /\b(a|an|the)\b/g;
function normEn(s) {
  return s.toLowerCase().replace(/[.,!?;:]/g, " ").replace(ARTICLES, " ").replace(/\s+/g, " ").trim();
}
function normTalo(s) {
  return s.toLowerCase().replace(/[.,!?;:]/g, " ").replace(/\s+/g, " ").trim();
}
function contentMatch(answer, targets) {
  const aw = new Set(answer.split(" ").filter(Boolean));
  return targets.some((t) => {
    const tw = t.split(" ").filter(Boolean);
    return tw.length > 0 && tw.every((w) => aw.has(w));
  });
}

function refresh() {
  state.mode = $("mode").value;
  state.level = $("level").value;
  state.view = state.deck.filter((e) => !state.level || String(e.level) === state.level);
  state.i = 0;
  render();
}

function render() {
  const card = $("card"), loading = $("loading");
  if (!state.view.length) { card.hidden = true; loading.hidden = false; loading.textContent = "No exercises for this filter."; return; }
  loading.hidden = true; card.hidden = false;
  state.answered = false;
  const ex = state.view[state.i % state.view.length];

  $("badge").textContent = "Level " + ex.level + (ex.generated ? " · auto" : "");
  $("skills").textContent = (ex.skills || []).join(" · ");
  $("progress").textContent = `${(state.i % state.view.length) + 1} / ${state.view.length}`;

  const prompt = $("prompt");
  prompt.innerHTML = "";
  if (state.mode === "comprehension") {
    // show the Talo sentence as tappable tokens; learner types the English
    for (const tk of ex.tokens || []) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "tok"; b.textContent = tk.s;
      b.addEventListener("click", (e) => showTip(e, tk));
      prompt.appendChild(b);
      prompt.appendChild(document.createTextNode(" "));
    }
  } else {
    prompt.textContent = ex.english; // production: show English, learner writes Talo
  }
  const ans = $("answer");
  ans.value = ""; ans.placeholder = state.mode === "comprehension" ? "Type the English…" : "Type the Talo…";
  ans.disabled = false; ans.focus();
  const fb = $("feedback"); fb.hidden = true; fb.className = "feedback";
  $("check").disabled = false;
}

function grade() {
  if (state.answered) return;
  const ex = state.view[state.i % state.view.length];
  const raw = $("answer").value;
  let correct, expected;
  if (state.mode === "comprehension") {
    const a = normEn(raw);
    const targets = ex.accept || [normEn(ex.english)];
    correct = !!a && (targets.includes(a) || contentMatch(a, targets));
    expected = ex.english;
  } else {
    // production: accept the reference OR any grammatical same-meaning reordering.
    // The set (ex.acceptTalo) was computed at build time by the parser + the
    // back-translator, so the grammar + meaning check is the real engine's.
    const targets = ex.acceptTalo || [normTalo(ex.talo)];
    correct = !!normTalo(raw) && targets.includes(normTalo(raw));
    expected = ex.talo;
  }
  const fb = $("feedback");
  fb.hidden = false;
  fb.className = "feedback " + (correct ? "ok" : "no");
  fb.textContent = correct ? "✓ Correct!" : `✗ Not quite — answer: ${expected}`;
  state.answered = true;
  $("check").disabled = true;
  $("answer").disabled = true;
}

function reveal() {
  const ex = state.view[state.i % state.view.length];
  const fb = $("feedback");
  fb.hidden = false; fb.className = "feedback";
  fb.textContent = state.mode === "comprehension" ? `Answer: ${ex.english}` : `Answer: ${ex.talo}`;
  state.answered = true; $("answer").disabled = true; $("check").disabled = true;
}

function next() {
  state.i = (state.i + 1) % state.view.length;
  render();
}

// --- token tooltip ---
let tipEl;
function showTip(evt, tk) {
  evt.stopPropagation();
  tipEl = $("tooltip");
  tipEl.innerHTML = `<strong>${tk.s.replace(/[.,!?;:]/g, "")}</strong> <span class="tip-pos">${tk.pos}</span><br>` +
    `<span class="tip-gloss">${tk.gloss}</span>${tk.ipa ? ` <span class="tip-ipa">${tk.ipa}</span>` : ""}`;
  tipEl.hidden = false;
  const r = evt.target.getBoundingClientRect();
  tipEl.style.left = (window.scrollX + r.left) + "px";
  tipEl.style.top = (window.scrollY + r.bottom + 6) + "px";
}
document.addEventListener("click", (e) => {
  if (tipEl && !tipEl.hidden && !e.target.classList.contains("tok")) tipEl.hidden = true;
});

async function init() {
  let deck;
  try {
    deck = await (await fetch("exercises.json")).json();
  } catch {
    $("loading").textContent = "Could not load exercises.json.";
    return;
  }
  state.deck = deck;
  const levels = [...new Set(deck.map((e) => e.level))].sort((a, b) => a - b);
  const sel = $("level");
  for (const lv of levels) {
    const o = document.createElement("option"); o.value = String(lv); o.textContent = "Level " + lv; sel.appendChild(o);
  }
  $("mode").addEventListener("change", refresh);
  $("level").addEventListener("change", refresh);
  $("answer-form").addEventListener("submit", (e) => { e.preventDefault(); grade(); });
  $("reveal").addEventListener("click", reveal);
  $("next").addEventListener("click", next);
  refresh();
}
init();

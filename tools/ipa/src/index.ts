/**
 * Talo → IPA renderer (docs/0001).
 *
 * Talo orthography is one-to-one with its phonemes, pronunciation is fully
 * predictable, and stress is always on the first syllable — so a deterministic
 * transcription is possible with no exceptions. This module produces a broad IPA
 * transcription with syllable boundaries and the initial stress mark, e.g.
 *   panika → ˈpa.ni.ka      dinko → ˈdiŋ.ko      oke → ˈo.ke
 *
 * Sound values (0001 §2/§4): the five vowels are /a e i o u/; `c` = /tʃ/, `y` =
 * /j/, and every other letter takes its plain IPA value. The one allophonic rule
 * worth showing (0001 §2) is that a coda `n` before `k`/`g` surfaces as [ŋ].
 *
 * Syllabification (0001 R-rules): each syllable is (C)V(n). A single consonant
 * between vowels is the ONSET of the following syllable (`pa.ni`); the only
 * two-consonant run is `n`+stop, where `n` closes the syllable and the stop opens
 * the next (`diŋ.ko`).
 *
 * Zero dependencies, like the other tools.
 */
import { VOWELS } from "../../phonotactic-linter/src/index.ts";

/** grapheme → IPA symbol (0001 §2/§4). */
const IPA: Readonly<Record<string, string>> = {
  a: "a", e: "e", i: "i", o: "o", u: "u",
  p: "p", t: "t", k: "k", b: "b", d: "d", g: "g",
  c: "tʃ", f: "f", s: "s", h: "h",
  m: "m", n: "n", l: "l", w: "w", y: "j",
};

const isVowel = (c: string): boolean => VOWELS.has(c);

/**
 * Split a (legal) Talo word into its syllables as substrings, by the R-rules:
 * boundaries fall so that a lone intervocalic consonant onsets the next syllable
 * and an `n`+stop run is split between the `n` and the stop.
 */
export function syllabify(word: string): string[] {
  const w = word.toLowerCase();
  const vi: number[] = [];
  for (let i = 0; i < w.length; i++) if (isVowel(w[i])) vi.push(i);
  if (vi.length === 0) return w ? [w] : [];

  const starts = [0];
  for (let k = 0; k < vi.length - 1; k++) {
    const gap = vi[k + 1] - vi[k] - 1; // consonants between the two nuclei
    if (gap === 0) starts.push(vi[k] + 1);          // V.V
    else starts.push(vi[k + 1] - 1);                 // C → onset of next (gap 1); n+stop → stop onsets next (gap 2)
  }
  starts.push(w.length);

  const out: string[] = [];
  for (let k = 0; k < starts.length - 1; k++) out.push(w.slice(starts[k], starts[k + 1]));
  return out;
}

/**
 * Broad IPA transcription with syllable dots and the initial-stress mark.
 * @param withSlashes wrap the result in `/ /` (default false).
 */
export function toIPA(word: string, withSlashes = false): string {
  const w = word.toLowerCase();
  // per-grapheme IPA, applying the coda-n → [ŋ] allophony before k/g.
  const chars: string[] = [];
  for (let i = 0; i < w.length; i++) {
    const c = w[i];
    if (c === "n" && (w[i + 1] === "k" || w[i + 1] === "g")) chars.push("ŋ");
    else chars.push(IPA[c] ?? c);
  }
  // map syllable index-ranges onto the IPA characters.
  const sylStrings = syllabify(w);
  const sylsIPA: string[] = [];
  let pos = 0;
  for (const s of sylStrings) {
    sylsIPA.push(chars.slice(pos, pos + s.length).join(""));
    pos += s.length;
  }
  const body = "ˈ" + sylsIPA.join(".");
  return withSlashes ? `/${body}/` : body;
}

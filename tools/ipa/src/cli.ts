#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo IPA renderer.
 *   talo-ipa panika dinko oke      → /ˈpa.ni.ka/  /ˈdiŋ.ko/  /ˈo.ke/
 * Zero dependencies.
 */
import { toIPA } from "./index.ts";

const words = process.argv.slice(2);
if (words.length === 0) {
  process.stderr.write("usage: talo-ipa <word> [word ...]\n");
  process.exit(2);
}
for (const w of words) process.stdout.write(`${w}\t${toIPA(w, true)}\n`);

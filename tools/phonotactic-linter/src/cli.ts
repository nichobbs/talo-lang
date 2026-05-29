#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI for the Talo phonotactic linter.
 *
 *   talo-lint <word> [<word> ...]      validate one or more words
 *   echo "talo\ntar" | talo-lint       validate words from stdin (one per line)
 *
 * Exit code 0 if every word is legal, 1 if any word is illegal (so it composes
 * in scripts / CI as the lexicon gate). Use --json for machine-readable output.
 */
import { lint, type LintResult } from "./linter.ts";

function format(result: LintResult): string {
  if (result.legal) {
    return `✅ ${result.word} — legal Talo`;
  }
  const { violation } = result;
  return `❌ ${result.word} — ${violation.message}`;
}

async function readStdin(): Promise<string[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks)
    .toString("utf8")
    .split(/\r?\n/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const jsonMode = argv.includes("--json");
  let words = argv.filter((a) => a !== "--json");

  if (words.length === 0) {
    if (process.stdin.isTTY) {
      process.stderr.write(
        "usage: talo-lint <word> [<word> ...]   (or pipe words on stdin, one per line)\n",
      );
      process.exit(2);
    }
    words = await readStdin();
  }

  const results = words.map(lint);

  if (jsonMode) {
    process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  } else {
    for (const result of results) {
      process.stdout.write(format(result) + "\n");
    }
  }

  const allLegal = results.every((r) => r.legal);
  process.exit(allLegal ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`talo-lint: ${(err as Error).message}\n`);
  process.exit(2);
});

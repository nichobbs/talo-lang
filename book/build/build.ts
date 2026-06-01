#!/usr/bin/env -S node --experimental-strip-types
/**
 * Build "Teach Yourself Talo" from book/chapters/*.md into a single HTML file,
 * and — crucially — VALIDATE every Talo example through the parser so the book
 * can never teach an ungrammatical sentence.
 *
 *   node --experimental-strip-types build/build.ts            # build HTML
 *   node --experimental-strip-types build/build.ts --check-only   # just validate examples, no output
 *
 * Talo examples are written in fenced ```talo blocks. Each non-blank, non-comment
 * line whose first whitespace-delimited field looks like running Talo (and which
 * is not an explicit "# ..." annotation or a "›" translation line) is run through
 * the validator. A clause is allowed to carry an inline gloss after a "—" or "·";
 * only the part before it is validated. Lines marked with a leading "*" are
 * deliberately-ungrammatical teaching examples and are asserted to FAIL.
 *
 * Exit 0 only if every chapter renders and every example validates as intended;
 * 1 otherwise — so the book build doubles as a CI gate on its own content.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { render, type CodeBlock } from "./markdown.ts";
import { validate } from "../../tools/parser/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOOK = join(__dirname, "..");
const CHAPTERS = join(BOOK, "chapters");
const OUT = join(BOOK, "build", "talo-book.html");

const checkOnly = process.argv.includes("--check-only");

interface ExampleProblem {
  chapter: string;
  line: string;
  expected: "valid" | "invalid";
  detail: string;
}

/**
 * Pull validatable Talo clauses out of a ```talo block.
 * Conventions inside a talo block:
 *   - "# ..."                   comment / section label (skipped)
 *   - "<talo>  — <gloss>"       clause + em-dash gloss; validate the clause part
 *   - "<talo>  › <english>"     clause + translation; validate the clause part
 *   - "* <talo>  — ..."         intentionally WRONG; assert it fails
 *   - blank lines               skipped
 */
function exampleLines(block: string): { clause: string; mustFail: boolean }[] {
  const out: { clause: string; mustFail: boolean }[] = [];
  for (const raw of block.split("\n")) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    let mustFail = false;
    if (line.startsWith("*")) {
      mustFail = true;
      line = line.slice(1).trim();
    }
    // strip an inline gloss/translation after — , · or ›
    const clause = line.split(/\s+[—·›]\s+| {2,}/)[0].trim();
    if (!clause) continue;
    // skip lines that are clearly just English annotations (no lowercase Talo)
    if (!/[a-z]/.test(clause)) continue;
    out.push({ clause, mustFail });
  }
  return out;
}

function validateExamples(chapter: string, blocks: CodeBlock[]): ExampleProblem[] {
  const problems: ExampleProblem[] = [];
  for (const b of blocks) {
    if (b.lang !== "talo") continue;
    for (const { clause, mustFail } of exampleLines(b.body)) {
      const r = validate(clause);
      if (mustFail && r.ok) {
        problems.push({ chapter, line: clause, expected: "invalid", detail: "expected an error but it validated" });
      } else if (!mustFail && !r.ok) {
        const errs = r.issues.filter((x) => x.severity === "error").map((x) => x.code).join(", ");
        problems.push({ chapter, line: clause, expected: "valid", detail: errs });
      }
    }
  }
  return problems;
}

function chapterFiles(): string[] {
  return readdirSync(CHAPTERS)
    .filter((f) => f.endsWith(".md"))
    .sort(); // 00-, 01-, ... ordering
}

const STYLE = `
:root{--ink:#1a1a1a;--mut:#666;--accent:#7a3b00;--bg:#fbf8f3;--card:#fff;--line:#e7e0d4}
*{box-sizing:border-box}
body{margin:0;font:17px/1.65 Georgia,'Iowan Old Style',serif;color:var(--ink);background:var(--bg)}
.wrap{max-width:780px;margin:0 auto;padding:3rem 1.5rem 6rem}
h1,h2,h3,h4{font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.25;color:var(--accent)}
h1{font-size:2.4rem;margin:2.5rem 0 1rem}
h2{font-size:1.7rem;margin:2.5rem 0 .8rem;padding-top:1rem;border-top:2px solid var(--line)}
h3{font-size:1.25rem;margin:1.8rem 0 .6rem}
h4{font-size:1.05rem;margin:1.4rem 0 .4rem;color:var(--ink)}
p{margin:.7rem 0}
code{font-family:'SF Mono',Menlo,Consolas,monospace;font-size:.92em;background:#f0ebe1;padding:.08em .35em;border-radius:3px}
pre{background:#2b2620;color:#f3ede0;padding:1rem 1.2rem;border-radius:6px;overflow-x:auto;font-size:.9rem;line-height:1.5}
pre code{background:none;padding:0;color:inherit}
pre.lang-talo{background:#1c2b1c;border-left:4px solid #5a8f5a}
blockquote{margin:1.2rem 0;padding:.6rem 1.1rem;border-left:4px solid var(--accent);background:var(--card);color:#444;border-radius:0 4px 4px 0}
table{border-collapse:collapse;width:100%;margin:1.2rem 0;font-size:.92rem;background:var(--card)}
th,td{border:1px solid var(--line);padding:.5rem .7rem;text-align:left;vertical-align:top}
th{background:#f0ebe1;font-family:'Helvetica Neue',Arial,sans-serif}
hr{border:0;border-top:1px solid var(--line);margin:2.5rem 0}
a{color:var(--accent)}
.toc{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:1.2rem 1.6rem;margin:2rem 0}
.toc h2{border:0;margin:0 0 .6rem;padding:0;font-size:1.2rem}
.toc ol{margin:0;padding-left:1.3rem}
.toc a{text-decoration:none}
.subtitle{color:var(--mut);font-style:italic;font-size:1.15rem;margin-top:-.5rem}
@media print{body{background:#fff;font-size:11pt}.wrap{max-width:none;padding:0}pre{font-size:9pt}h2{page-break-before:always}.toc{page-break-after:always}}
`;

function main(): void {
  const files = chapterFiles();
  if (files.length === 0) {
    process.stderr.write("no chapters found in book/chapters/\n");
    process.exit(1);
  }

  const sections: string[] = [];
  const toc: { id: string; title: string }[] = [];
  const allProblems: ExampleProblem[] = [];

  for (const f of files) {
    const md = readFileSync(join(CHAPTERS, f), "utf8");
    const { html, codeBlocks } = render(md);
    allProblems.push(...validateExamples(f, codeBlocks));
    // first H1 in the chapter is its TOC title + anchor
    const m = md.match(/^#\s+(.*)$/m);
    const title = m ? m[1].trim() : f;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    toc.push({ id, title });
    sections.push(`<section>${html}</section>`);
  }

  // Report example validation.
  if (allProblems.length > 0) {
    process.stderr.write(`\n✗ ${allProblems.length} Talo example(s) did not validate as intended:\n`);
    for (const p of allProblems) {
      process.stderr.write(`  [${p.chapter}] "${p.line}" — expected ${p.expected} (${p.detail})\n`);
    }
    process.exit(1);
  }
  const exampleCount = files.reduce((n, f) => {
    const { codeBlocks } = render(readFileSync(join(CHAPTERS, f), "utf8"));
    return n + codeBlocks.filter((b) => b.lang === "talo").reduce((m, b) => m + exampleLines(b.body).length, 0);
  }, 0);
  process.stdout.write(`✓ ${exampleCount} Talo examples validated across ${files.length} chapters\n`);

  if (checkOnly) {
    process.exit(0);
  }

  const tocHtml =
    `<nav class="toc"><h2>Contents</h2><ol>` +
    toc.map((t) => `<li><a href="#${t.id}">${t.title}</a></li>`).join("") +
    `</ol></nav>`;

  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Teach Yourself Talo</title>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
${tocHtml}
${sections.join("\n")}
</div>
</body>
</html>
`;

  writeFileSync(OUT, doc);
  process.stdout.write(`✓ wrote ${OUT}\n`);
}

main();

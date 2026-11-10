#!/usr/bin/env node
// Copies the plugin into a scratch directory and applies a named variant, so
// `claude plugin eval` can compare the real skills against a modified copy
// without a second copy of any skill in git.
//
//   node scripts/make-eval-variant.mjs <variant> <target-dir> [--cases <prefix>]
//
// Variants:
//   baseline  the plugin as it is (the control arm, copied the same way)
//   no-hats   brainstorming without the Six Thinking Hats: step 7 becomes a
//             plain comparison of two or three approaches, the hats column,
//             mentions, and references/six-thinking-hats.md are removed, and
//             everything else stays byte-identical
//
// Every edit is an exact text replacement that must match exactly once in the
// source. When the skill changes and an anchor no longer matches, the script
// fails and writes nothing, so the variant cannot drift silently from the real
// skill. --cases copies only the evals/plugin cases whose name starts with the
// prefix. The target must not exist or be empty. LEGION_ROOT picks another
// source checkout (the tests use it).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SKILLS_DIR, walk } from './lib/skills.mjs';

// What a plugin needs to load and run its evals, plus what scripts/validate.mjs
// reads, so the copy can be checked with LEGION_ROOT=<target>.
const COPY = ['.claude-plugin', 'hooks', 'skills', 'evals', 'README.md', 'package.json', 'LICENSE'];
const SKIP = new Set([path.join('evals', 'results'), path.join('evals', 'plugin', 'results')]);

const BRAINSTORMING = 'skills/brainstorming';
const HATS_REFERENCE = `${BRAINSTORMING}/references/six-thinking-hats.md`;

const VARIANTS = {
  baseline: { edits: [], remove: [], check: () => [] },
  'no-hats': {
    remove: [HATS_REFERENCE],
    edits: [
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `  Draws out what the user wants and why, compares two or three approaches with
  the Six Thinking Hats, grills open decisions in rounds, and gets a design
`,
        to: `  Draws out what the user wants and why, compares two or three approaches
  grounded in the code, grills open decisions in rounds, and gets a design
`,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `  a plan, decision, or idea, think it through from first principles or with
  six thinking hats, or record an ADR under docs/adr/; and when terminology is
`,
        to: `  a plan, decision, or idea, think it through from first principles, or
  record an ADR under docs/adr/; and when terminology is
`,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `Find out what the user wants and why, then run two methods: the **Six Thinking
Hats** to choose an approach, and **grilling** to settle every decision the
`,
        to: `Find out what the user wants and why, then run two methods: a **comparison of
approaches** to choose one, and **grilling** to settle every decision the
`,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `| Model | Core question | In the Six Thinking Hats | In grilling |
|---|---|---|---|
| First principles | What must be true, and what forces each assumption? | White: goal, facts, hard constraints, assumptions questioned. Green: the approach rebuilt from those truths. | Every question traces to a goal or constraint; a "given" nothing forces gets "what forces this?" |
| Inversion | What would guarantee failure? | Black: list what would make each approach fail, then check which it does. | Every recommendation carries "Wrong if": the fact that would flip it. |
| Systems thinking | What does it touch, and what does it set off? | White: map of what sits upstream and downstream. Black: second-order effects and feedback loops. | The design tree is the dependency map; each answer adds the branches it sets off elsewhere. |
| Pareto | Which few parts decide most of the outcome? | Blue: the one or two criteria that decide. Yellow: share of the goal each approach delivers for its cost. | Ask the highest-leverage decisions first; default the ones that would not change what gets built. |
`,
        to: `| Model | Core question | In grilling |
|---|---|---|
| First principles | What must be true, and what forces each assumption? | Every question traces to a goal or constraint; a "given" nothing forces gets "what forces this?" |
| Inversion | What would guarantee failure? | Every recommendation carries "Wrong if": the fact that would flip it. |
| Systems thinking | What does it touch, and what does it set off? | The design tree is the dependency map; each answer adds the branches it sets off elsewhere. |
| Pareto | Which few parts decide most of the outcome? | Ask the highest-leverage decisions first; default the ones that would not change what gets built. |
`,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `   how it works today. What you read is fact for the White hat. Never ask what
`,
        to: `   how it works today. What you read is fact for the comparison. Never ask what
`,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `7. **Choose the approach with the Six Thinking Hats**, in a message of its
   own. Blue sets the criteria; White reduces the problem to its goal, facts,
   and hard constraints and questions every assumption; Green lays out two or
   three real alternatives grounded in the existing code, at least one of them
   rebuilt from White's truths; Yellow, Black (inverted), and Red evaluate
   them; Blue recommends one. For a project, read
   [references/six-thinking-hats.md](references/six-thinking-hats.md) first
   and use its procedure and table. If only one approach is sensible, say why
   the others fail.
`,
        to: `7. **Choose the approach**, in a message of its own. Lay out two or three
   real alternatives grounded in the existing code, give the trade-offs of
   each, recommend one, and say what fact would flip the recommendation. If
   only one approach is sensible, say why the others fail.
`,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `   user prefers another place) and fill it, including the hats table and the
   grilled decisions.`,
        to: `   user prefers another place) and fill it, including the approach comparison
   and the grilled decisions.`,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `| Size | Design doc | Six Thinking Hats | Grilling |
|---|---|---|---|
| Small change | Short: a line or two per section | White: one line, the assumption most worth questioning. Yellow and Black (inverted): one line per approach. | `,
        to: `| Size | Design doc | Approaches | Grilling |
|---|---|---|---|
| Small change | Short: a line or two per section | One line of trade-offs per approach | `,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `| Project | Full | Full sequence, with system map and second-order effects | `,
        to: `| Project | Full | Full trade-offs for each approach | `,
      },
      {
        file: `${BRAINSTORMING}/SKILL.md`,
        from: `- The Red hat is the user's reaction, never yours: quote what they said or ask
  for a one-line gut reaction.
`,
        to: '',
      },
      {
        file: `${BRAINSTORMING}/references/grilling.md`,
        from: `Grilling runs on the same four thinking models as the hats: first principles
`,
        to: `Grilling runs on the same four thinking models as the rest of the skill: first principles
`,
      },
      {
        file: `${BRAINSTORMING}/assets/design-doc-template.md`,
        from: `## First principles (White hat)
`,
        to: `## First principles
`,
      },
      {
        file: `${BRAINSTORMING}/assets/design-doc-template.md`,
        from: `## Approaches
Deciding criteria (Blue): <the one or two that decide>.
The two or three considered, including the first-principles rebuild.

| Hat | A: <name> | B: <name> |
|---|---|---|
| White: facts / unknowns / what it touches | | |
| Green: better or combined option | | |
| Yellow: share of the goal, for what cost | | |
| Black: inverted failures, second-order effects, cost if wrong | | |
| Red: user's reaction | | |

Chosen: <approach>, because <the deciding points>.
`,
        to: `## Approaches
The two or three considered, grounded in the existing code.

| | A: <name> | B: <name> |
|---|---|---|
| Trade-offs | | |

Chosen: <approach>, because <the deciding points>. Wrong if: <the fact that would flip it>.
`,
      },
    ],
    // Fails if the source gained a hats mention in brainstorming that no edit
    // above removes.
    check: (files) => Object.entries(files)
      .filter(([file, text]) => file.startsWith(`${BRAINSTORMING}/`) && /\bhats?\b|six-thinking/i.test(text))
      .map(([file]) => `${file}: still mentions the hats after the variant; add an edit for it`),
  },
};

function fail(message) {
  console.log(`ERROR ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { cases: '' };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--cases') args.cases = argv[++i] ?? fail('--cases needs a prefix');
    else rest.push(argv[i]);
  }
  [args.variant, args.target] = rest;
  if (rest.length !== 2 || !VARIANTS[args.variant]) {
    fail(`usage: make-eval-variant.mjs <${Object.keys(VARIANTS).join('|')}> <target-dir> [--cases <prefix>]`);
  }
  return args;
}

// Apply every edit in memory first; nothing is written unless all anchors match.
function applyVariant(variant) {
  const files = {};
  const errors = [];
  for (const { file, from, to } of variant.edits) {
    if (!(file in files)) {
      const p = path.join(ROOT, file);
      if (!fs.existsSync(p)) { errors.push(`${file}: missing in the source`); continue; }
      files[file] = fs.readFileSync(p, 'utf8');
    }
    const count = files[file].split(from).length - 1;
    const anchor = from.split('\n')[0].trim();
    if (count !== 1) errors.push(`${file}: anchor ${count ? `matches ${count} times` : 'not found'}: "${anchor}"`);
    else files[file] = files[file].replace(from, () => to);
  }
  for (const file of variant.remove) {
    if (!fs.existsSync(path.join(ROOT, file))) errors.push(`${file}: listed for removal but missing in the source`);
  }
  // The copy as it will be: every skill file, edited, minus the removed ones.
  const view = {};
  for (const p of walk(SKILLS_DIR)) {
    const file = path.relative(ROOT, p).split(path.sep).join('/');
    if (!variant.remove.includes(file)) view[file] = files[file] ?? fs.readFileSync(p, 'utf8');
  }
  // Links into a removed file would dangle in the copy.
  for (const [file, text] of Object.entries(view)) {
    for (const gone of variant.remove) {
      if (text.includes(path.basename(gone))) errors.push(`${file}: still refers to removed ${gone}`);
    }
  }
  errors.push(...variant.check(view));
  return { files, errors };
}

const args = parseArgs(process.argv.slice(2));
const variant = VARIANTS[args.variant];
const target = path.resolve(args.target);
// A target inside the source would copy into itself and dirty the repo.
const fromRoot = path.relative(ROOT, target);
if (!fromRoot.startsWith('..') && !path.isAbsolute(fromRoot)) fail(`target ${target} is inside the source ${ROOT}; use a scratch dir outside it`);
if (fs.existsSync(target) && fs.readdirSync(target).length) fail(`target ${target} is not empty`);

const { files, errors } = applyVariant(variant);
if (errors.length) {
  for (const e of errors) console.log(`ERROR ${e}`);
  console.log(`make-eval-variant: ${args.variant} not applied (${errors.length} errors); nothing written`);
  process.exit(1);
}

const casesDir = path.join('evals', 'plugin');
for (const entry of COPY) {
  const src = path.join(ROOT, entry);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(target, entry), {
    recursive: true,
    filter: (p) => {
      const r = path.relative(ROOT, p);
      if (SKIP.has(r)) return false;
      const parent = path.dirname(r);
      return !(args.cases && parent === casesDir && !path.basename(r).startsWith(args.cases));
    },
  });
}
for (const [file, text] of Object.entries(files)) fs.writeFileSync(path.join(target, file), text);
for (const file of variant.remove) fs.rmSync(path.join(target, file));

const cases = fs.existsSync(path.join(target, casesDir)) ? fs.readdirSync(path.join(target, casesDir)).length : 0;
console.log(`make-eval-variant: ${args.variant} -> ${target} (${variant.edits.length} edits, ${variant.remove.length} files removed, ${cases} eval cases)`);

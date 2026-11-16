#!/usr/bin/env node
// Turns a `claude plugin eval --json` result into a small summary that is
// committed under evals/summaries/, so the numbers docs/evals.md quotes can be
// traced to a file. Raw results stay out of git: they hold prompts, judge
// evidence, and local trace paths. The summary keeps only versions, model,
// cost, and per-case scores.
//
// It also answers the two questions a mean score hides. Does the plugin help?
// Only outcome graders can say (scripts/lib/grader-kinds.mjs), so their pass
// rates are reported apart from routing and protocol graders, with every
// outcome grader the plugin arm lost named under `regressions`. What does it
// cost? `overhead` is the with-arm's cost, turns, and time as a multiple of
// the no-plugin arm's.
//
//   node scripts/summarize-eval.mjs <result.json> <label> [--model <m>] [--force]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/skills.mjs';
import { kindOf, loadGraderKinds } from './lib/grader-kinds.mjs';

const USAGE = 'usage: node scripts/summarize-eval.mjs <result.json> <label> [--model <model>] [--force]';
const fail = (msg) => { console.log(`ERROR ${msg}`); process.exit(1); };

// --- Arguments --------------------------------------------------------------
const args = process.argv.slice(2);
const positional = [];
let model = null;
let force = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--force') force = true;
  else if (args[i] === '--model') model = args[++i] ?? fail(`--model needs a value\n${USAGE}`);
  else positional.push(args[i]);
}
if (positional.length !== 2) fail(USAGE);
const [input, label] = positional;
// The label becomes part of a file name: keep it to one safe path segment.
if (!/^[a-z0-9][a-z0-9.-]*$/.test(label)) fail(`label "${label}" must be lowercase letters, digits, dots, or dashes`);

// --- Input ------------------------------------------------------------------
let result;
try { result = JSON.parse(fs.readFileSync(input, 'utf8')); }
catch (e) { fail(`${input}: ${e.code === 'ENOENT' ? 'no such file' : 'not valid JSON'}`); }
if (!result || !Array.isArray(result.cases) || typeof result.startedAt !== 'string') {
  fail(`${input}: not a claude plugin eval result (needs startedAt and a cases array)`);
}
const recorded = result.suite?.modelOverride ?? null;
if (recorded && model && recorded !== model) fail(`--model ${model} contradicts the model the result records (${recorded})`);
model = recorded ?? model;
if (!model) fail(`${input} does not record the model; pass --model (docs/evals.md lists it per run)`);
const date = result.startedAt.slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`${input}: startedAt "${result.startedAt}" is not an ISO date`);

// --- Summary ----------------------------------------------------------------
const round = (x, places = 4) => (typeof x === 'number' && Number.isFinite(x) ? Number(x.toFixed(places)) : null);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
// Mean of a per-run number, over the runs that recorded it.
const runMean = (runs, key, places) => round(mean(runs.map((r) => r[key]).filter((v) => typeof v === 'number')), places);

function arm(runs) {
  if (!Array.isArray(runs) || !runs.length) return null;
  return {
    passRate: round(mean(runs.map((r) => (r.passed ? 1 : 0)))),
    meanScore: round(mean(runs.map((r) => (typeof r.score === 'number' ? r.score : 0)))),
    costUsd: runMean(runs, 'costUsd', 4),
    turns: runMean(runs, 'turns', 2),
    seconds: runMean(runs, 'durationSeconds', 1),
  };
}

// Runs in which the named grader passed, or null when the arm did not run.
function passes(runs, name) {
  if (!Array.isArray(runs) || !runs.length) return null;
  return runs.filter((r) => (r.graders ?? []).some((g) => g.name === name && g.passed)).length;
}

const { kinds } = loadGraderKinds();
const kindCounts = { outcome: 0, protocol: 0, routing: 0, unclassified: 0 };
const outcomeRates = []; // { id, with, without } per outcome grader that ran in both arms

const cases = result.cases
  .map((c) => {
    const withArm = arm(c.arms?.with);
    const withoutArm = arm(c.arms?.without);
    const runs = c.arms?.with?.length ?? 0;
    const runsWithout = c.arms?.without?.length ?? 0;
    const graders = {};
    for (const g of [...(c.graders ?? [])].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const kind = kindOf(kinds, c.name, g);
      const entry = { kind, with: passes(c.arms?.with, g.name), without: passes(c.arms?.without, g.name) };
      graders[g.name] = entry;
      kindCounts[kind] += 1;
      if (kind === 'outcome' && entry.with !== null && entry.without !== null) {
        outcomeRates.push({ id: `${c.name}/${g.name}`, with: entry.with / runs, without: entry.without / runsWithout });
      }
    }
    return {
      name: c.name,
      runs,
      with: withArm,
      without: withoutArm,
      delta: withArm && withoutArm ? round(withArm.meanScore - withoutArm.meanScore) : null,
      graders,
    };
  })
  .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const outcome = {
  graders: outcomeRates.length,
  with: round(mean(outcomeRates.map((o) => o.with))),
  without: round(mean(outcomeRates.map((o) => o.without))),
  delta: round(mean(outcomeRates.map((o) => o.with - o.without))),
  regressions: outcomeRates.filter((o) => o.with < o.without).map((o) => o.id).sort(),
};

// The with-arm as a multiple of the no-plugin arm, over the cases that ran both.
const paired = cases.filter((c) => c.with && c.without);
const ratio = (key) => {
  const both = paired.filter((c) => typeof c.with[key] === 'number' && typeof c.without[key] === 'number');
  const base = sum(both.map((c) => c.without[key]));
  return base > 0 ? round(sum(both.map((c) => c.with[key])) / base, 2) : null;
};
const overhead = { cases: paired.length, cost: ratio('costUsd'), turns: ratio('turns'), seconds: ratio('seconds') };

// docs/evals.md's bar: a case passes at a mean score of 2 of 3. The CLI compares
// with 0.67 and fails 2/3 = 0.6667, so its casesPassed undercounts; atBar is
// the number docs/evals.md quotes.
const BAR = 0.66;
const judgeCost = result.cases.reduce((sum, c) => sum + [...(c.arms?.with ?? []), ...(c.arms?.without ?? [])]
  .reduce((s, r) => s + (typeof r.judgeCostUsd === 'number' ? r.judgeCostUsd : 0), 0), 0);

const agg = result.aggregates ?? {};
const summary = {
  schemaVersion: 2,
  label,
  claudeVersion: result.claudeVersion ?? null,
  model,
  startedAt: result.startedAt,
  partial: Boolean(result.partial),
  costUsd: round(result.costUsd, 2), // agent runs only; the CLI leaves judge cost out
  judgeCostUsd: round(judgeCost, 2),
  threshold: result.suite?.threshold ?? null,
  bar: BAR,
  totals: {
    cases: agg.casesTotal ?? cases.length,
    passed: agg.casesPassed ?? null,
    atBar: cases.filter((c) => c.with && c.with.meanScore >= BAR).length,
    meanDelta: round(agg.meanDelta),
    graders: kindCounts,
    outcome,
    overhead,
  },
  cases,
};

// --- Output -----------------------------------------------------------------
const outDir = path.join(ROOT, 'evals', 'summaries');
const out = path.join(outDir, `${date}-${label}.json`);
if (fs.existsSync(out) && !force) fail(`${path.relative(ROOT, out)} already exists; pass --force to replace it`);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
if (kindCounts.unclassified) console.log(`NOTE  ${kindCounts.unclassified} grader(s) have no kind in evals/grader-kinds.json (a renamed or removed case?); they count toward no outcome figure`);
if (outcome.regressions.length) console.log(`NOTE  the plugin arm lost ${outcome.regressions.length} outcome grader(s): ${outcome.regressions.join(', ')}`);
console.log(`summarize-eval: wrote ${path.relative(ROOT, out)} (${cases.length} cases, ${model}, Claude Code ${summary.claudeVersion})`);

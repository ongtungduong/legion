#!/usr/bin/env node
// Turns a `claude plugin eval --json` result into a small summary that is
// committed under evals/summaries/, so the numbers docs/evals.md quotes can be
// traced to a file. Raw results stay out of git: they hold prompts, judge
// evidence, and local trace paths. The summary keeps only versions, model,
// cost, and per-case scores.
//
//   node scripts/summarize-eval.mjs <result.json> <label> [--model <m>] [--force]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/skills.mjs';

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

function arm(runs) {
  if (!Array.isArray(runs) || !runs.length) return null;
  return {
    passRate: round(mean(runs.map((r) => (r.passed ? 1 : 0)))),
    meanScore: round(mean(runs.map((r) => (typeof r.score === 'number' ? r.score : 0)))),
  };
}

function graderPasses(runs) {
  const counts = {};
  for (const r of runs ?? []) {
    for (const g of r.graders ?? []) counts[g.name] = (counts[g.name] ?? 0) + (g.passed ? 1 : 0);
  }
  return Object.fromEntries(Object.keys(counts).sort().map((k) => [k, counts[k]]));
}

const cases = result.cases
  .map((c) => {
    const withArm = arm(c.arms?.with);
    const withoutArm = arm(c.arms?.without);
    return {
      name: c.name,
      runs: c.arms?.with?.length ?? 0,
      with: withArm,
      without: withoutArm,
      delta: withArm && withoutArm ? round(withArm.meanScore - withoutArm.meanScore) : null,
      graders: graderPasses(c.arms?.with),
    };
  })
  .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

// docs/evals.md's bar: a case passes at a mean score of 2 of 3. The CLI compares
// with 0.67 and fails 2/3 = 0.6667, so its casesPassed undercounts; atBar is
// the number docs/evals.md quotes.
const BAR = 0.66;
const judgeCost = result.cases.reduce((sum, c) => sum + [...(c.arms?.with ?? []), ...(c.arms?.without ?? [])]
  .reduce((s, r) => s + (typeof r.judgeCostUsd === 'number' ? r.judgeCostUsd : 0), 0), 0);

const agg = result.aggregates ?? {};
const summary = {
  schemaVersion: 1,
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
  },
  cases,
};

// --- Output -----------------------------------------------------------------
const outDir = path.join(ROOT, 'evals', 'summaries');
const out = path.join(outDir, `${date}-${label}.json`);
if (fs.existsSync(out) && !force) fail(`${path.relative(ROOT, out)} already exists; pass --force to replace it`);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`summarize-eval: wrote ${path.relative(ROOT, out)} (${cases.length} cases, ${model}, Claude Code ${summary.claudeVersion})`);

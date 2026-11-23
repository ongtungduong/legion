#!/usr/bin/env node
// Turns a `claude plugin eval --json` result into a small summary that is
// committed under evals/summaries/, so the numbers docs/evals.md quotes can be
// traced to a file. Raw results stay out of git: they hold prompts, judge
// evidence, and local trace paths. The summary keeps only versions, model,
// cost, and per-case scores.
//
// It also answers the questions a mean score hides. Does the plugin help?
// Only lift graders can say (scripts/lib/grader-kinds.mjs): `totals.lift` gives
// their pass rates in both arms, the mean delta with a 95% interval, and the
// delta per skill. Does it do harm? `totals.guard` gives the outcome graders the
// baseline should also pass, and `totals.regressions` names every lift or guard
// grader the plugin arm lost. What does it cost? `overhead` is the with-arm's
// cost, turns, and time as a multiple of the no-plugin arm's.
//
//   node scripts/summarize-eval.mjs <result.json> <label> [--model <m>] [--force]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SKILLS_DIR, listSkills } from './lib/skills.mjs';
import { OUTCOME_KINDS, kindOf, loadGraderKinds } from './lib/grader-kinds.mjs';

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
const kindCounts = { lift: 0, guard: 0, protocol: 0, routing: 0, unclassified: 0 };
const outcomeRates = []; // { id, skill, kind, with, without } per lift or guard grader that ran in both arms

// The skill a case tests: the longest skill name its name starts with, else
// the part before the first dash.
const skillNames = (fs.existsSync(SKILLS_DIR) ? listSkills() : []).sort((a, b) => b.length - a.length);
const skillOf = (caseName) => skillNames.find((s) => caseName.startsWith(`${s}-`)) ?? caseName.split('-')[0];

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
      if (OUTCOME_KINDS.includes(kind) && entry.with !== null && entry.without !== null) {
        outcomeRates.push({ id: `${c.name}/${g.name}`, skill: skillOf(c.name), kind, with: entry.with / runs, without: entry.without / runsWithout });
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

// Two-sided 95% Student t critical values for 1 to 30 degrees of freedom.
const T95 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131,
  2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042];
// A 95% interval for the mean of per-grader deltas, clamped to [-1, 1]. Each
// grader is one unit (its runs are pooled into a rate), so the interval says
// how far the mean would move with other graders like these. It is optimistic
// when the graders of one case move together; null under two graders.
function interval(deltas) {
  const n = deltas.length;
  if (n < 2) return null;
  const m = mean(deltas);
  const sd = Math.sqrt(deltas.reduce((s, d) => s + (d - m) ** 2, 0) / (n - 1));
  const half = (T95[n - 2] ?? 1.96) * (sd / Math.sqrt(n));
  return [round(Math.max(-1, m - half)), round(Math.min(1, m + half))];
}
const rateSummary = (rates) => ({
  graders: rates.length,
  with: round(mean(rates.map((o) => o.with))),
  without: round(mean(rates.map((o) => o.without))),
  delta: round(mean(rates.map((o) => o.with - o.without))),
});
const liftRates = outcomeRates.filter((o) => o.kind === 'lift');
const bySkill = {};
for (const skill of [...new Set(liftRates.map((o) => o.skill))].sort()) {
  const rates = liftRates.filter((o) => o.skill === skill);
  bySkill[skill] = { graders: rates.length, delta: round(mean(rates.map((o) => o.with - o.without))) };
}
const lift = { ...rateSummary(liftRates), ci95: interval(liftRates.map((o) => o.with - o.without)), bySkill };
const guard = rateSummary(outcomeRates.filter((o) => o.kind === 'guard'));
const regressions = outcomeRates.filter((o) => o.with < o.without).map((o) => o.id).sort();

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
  schemaVersion: 3,
  label,
  claudeVersion: result.claudeVersion ?? null,
  model,
  // The CLI records the judge only when --judge-model was passed; its default is haiku.
  judgeModel: result.suite?.judgeModel ?? 'haiku',
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
    lift,
    guard,
    regressions,
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
if (lift.graders) console.log(`NOTE  lift delta ${lift.delta} over ${lift.graders} grader(s)${lift.ci95 ? `, 95% interval ${lift.ci95[0]} to ${lift.ci95[1]}` : ''}`);
if (regressions.length) console.log(`NOTE  the plugin arm lost ${regressions.length} outcome grader(s): ${regressions.join(', ')}`);
console.log(`summarize-eval: wrote ${path.relative(ROOT, out)} (${cases.length} cases, ${model}, Claude Code ${summary.claudeVersion})`);

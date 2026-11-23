// Behavior tests for scripts/summarize-eval.mjs. Each test runs the script
// against a temp LEGION_ROOT so summaries never land in the real repo.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(HERE, '..', '..', 'scripts', 'summarize-eval.mjs');
const FIXTURE = path.join(HERE, 'fixtures', 'eval-result.json');

const dirs = [];
after(() => { for (const d of dirs) fs.rmSync(d, { recursive: true, force: true }); });

function run(root, ...args) {
  const res = spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8', env: { ...process.env, LEGION_ROOT: root } });
  return { code: res.status, out: `${res.stdout}${res.stderr}` };
}

const summaryPath = (root, name) => path.join(root, 'evals', 'summaries', name);

function withModel(root, model) {
  const j = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  j.suite.modelOverride = model;
  const p = path.join(root, 'result.json');
  fs.writeFileSync(p, JSON.stringify(j));
  return p;
}

// What each fixture grader is evidence of; the two tool_used graders on Skill
// are routing graders by type and are not declared.
const KINDS = { 'alpha-fires': { quality: 'lift', 'kept-bar': 'guard', 'report-line': 'protocol' } };

function tempRoot(kinds = KINDS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'legion-summarize-'));
  dirs.push(dir);
  if (kinds) {
    fs.mkdirSync(path.join(dir, 'evals'));
    fs.writeFileSync(path.join(dir, 'evals', 'grader-kinds.json'), JSON.stringify(kinds));
  }
  return dir;
}

const EXPECTED = {
  schemaVersion: 3,
  label: 'full',
  claudeVersion: '9.9.9',
  model: 'sonnet',
  judgeModel: 'haiku',
  startedAt: '2030-01-02T03:04:05.000Z',
  partial: false,
  costUsd: 1.23,
  judgeCostUsd: 0.03,
  threshold: 0.66,
  bar: 0.66,
  totals: {
    cases: 2,
    passed: 1,
    atBar: 1,
    meanDelta: 0.5,
    graders: { lift: 1, guard: 1, protocol: 1, routing: 2, unclassified: 0 },
    // quality (lift) 2/3 vs 2/3, kept-bar (guard) 1/3 vs 3/3: no lift and a
    // regression on a guard, whatever meanDelta says.
    lift: { graders: 1, with: 0.6667, without: 0.6667, delta: 0, ci95: null, bySkill: { alpha: { graders: 1, delta: 0 } } },
    guard: { graders: 1, with: 0.3333, without: 1, delta: -0.6667 },
    regressions: ['alpha-fires/kept-bar'],
    overhead: { cases: 1, cost: 2, turns: 3, seconds: 2 },
  },
  cases: [
    {
      name: 'alpha-fires',
      runs: 3,
      with: { passRate: 0.6667, meanScore: 0.8333, costUsd: 0.2, turns: 6, seconds: 20 },
      without: { passRate: 0, meanScore: 0.3333, costUsd: 0.1, turns: 2, seconds: 10 },
      delta: 0.5,
      graders: {
        'kept-bar': { kind: 'guard', with: 1, without: 3 },
        quality: { kind: 'lift', with: 2, without: 2 },
        'report-line': { kind: 'protocol', with: 3, without: 0 },
        'skill-fired': { kind: 'routing', with: 3, without: 0 },
      },
    },
    {
      name: 'zeta-stays-quiet',
      runs: 2,
      with: { passRate: 0.5, meanScore: 0.5, costUsd: 0.1, turns: 3, seconds: 5 },
      without: null,
      delta: null,
      graders: { 'not-fired': { kind: 'routing', with: 1, without: null } },
    },
  ],
};

test('writes a compact summary named by run date and label', () => {
  const root = tempRoot();
  const { code, out } = run(root, FIXTURE, 'full');
  assert.equal(code, 0, out);
  const text = fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8');
  assert.deepEqual(JSON.parse(text), EXPECTED);
  assert.equal(text, `${JSON.stringify(EXPECTED, null, 2)}\n`, 'key order, 2-space indent, trailing newline');
});

test('leaves out prompts, evidence, and local paths', () => {
  const root = tempRoot();
  run(root, FIXTURE, 'full');
  const text = fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8');
  for (const s of ['FIXTURE-PROMPT-TEXT', 'FIXTURE-EVIDENCE', '/fixture', 'tracePath']) assert.ok(!text.includes(s), s);
});

test('refuses to overwrite a summary unless --force', () => {
  const root = tempRoot();
  assert.equal(run(root, FIXTURE, 'full').code, 0);
  fs.writeFileSync(summaryPath(root, '2030-01-02-full.json'), 'old\n');
  const again = run(root, FIXTURE, 'full');
  assert.equal(again.code, 1, again.out);
  assert.match(again.out, /already exists/);
  assert.equal(fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8'), 'old\n');
  const forced = run(root, FIXTURE, 'full', '--force');
  assert.equal(forced.code, 0, forced.out);
  assert.deepEqual(JSON.parse(fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8')), EXPECTED);
});

test('a grader no kind declares is unclassified and never counts as outcome evidence', () => {
  const root = tempRoot(null);
  const { code, out } = run(root, FIXTURE, 'full');
  assert.equal(code, 0, out);
  assert.match(out, /NOTE {2}3 grader\(s\) have no kind in evals\/grader-kinds\.json/);
  const s = JSON.parse(fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8'));
  assert.deepEqual(s.totals.graders, { lift: 0, guard: 0, protocol: 0, routing: 2, unclassified: 3 });
  assert.deepEqual(s.totals.lift, { graders: 0, with: null, without: null, delta: null, ci95: null, bySkill: {} });
  assert.deepEqual(s.totals.guard, { graders: 0, with: null, without: null, delta: null });
  assert.deepEqual(s.totals.regressions, []);
  assert.equal(s.cases[0].graders.quality.kind, 'unclassified');
});

test('lift graders get a 95% interval over their per-grader deltas', () => {
  const root = tempRoot({ 'alpha-fires': { quality: 'lift', 'kept-bar': 'lift', 'report-line': 'protocol' } });
  const { code, out } = run(root, FIXTURE, 'full');
  assert.equal(code, 0, out);
  const s = JSON.parse(fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8'));
  // Deltas 0 and -0.6667: mean -0.3333, sd 0.4714, t(1) 12.706, so the interval clamps to [-1, 1].
  assert.deepEqual(s.totals.lift, { graders: 2, with: 0.5, without: 0.8333, delta: -0.3333, ci95: [-1, 1], bySkill: { alpha: { graders: 2, delta: -0.3333 } } });
  assert.match(out, /NOTE {2}lift delta -0\.3333 over 2 grader\(s\), 95% interval -1 to 1/);
});

test('records the judge model the result names', () => {
  const root = tempRoot();
  const j = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  j.suite.judgeModel = 'sonnet';
  const input = path.join(root, 'result.json');
  fs.writeFileSync(input, JSON.stringify(j));
  assert.equal(run(root, input, 'full').code, 0);
  assert.equal(JSON.parse(fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8')).judgeModel, 'sonnet');
});

test('requires --model when the result does not record one', () => {
  const root = tempRoot();
  const input = withModel(root, null);
  const missing = run(root, input, 'full');
  assert.equal(missing.code, 1, missing.out);
  assert.match(missing.out, /--model/);
  const given = run(root, input, 'full', '--model', 'haiku');
  assert.equal(given.code, 0, given.out);
  assert.equal(JSON.parse(fs.readFileSync(summaryPath(root, '2030-01-02-full.json'), 'utf8')).model, 'haiku');
});

test('rejects a --model that contradicts the recorded model', () => {
  const root = tempRoot();
  const { code, out } = run(root, FIXTURE, 'full', '--model', 'haiku');
  assert.equal(code, 1, out);
  assert.match(out, /sonnet/);
});

test('fails cleanly on a missing file, invalid JSON, a wrong shape, or a bad label', () => {
  const root = tempRoot();
  const bad = path.join(root, 'bad.json');
  fs.writeFileSync(bad, '{not json');
  const shape = path.join(root, 'shape.json');
  fs.writeFileSync(shape, '{"cases": 3}');
  for (const args of [[path.join(root, 'nope.json'), 'full'], [bad, 'full'], [shape, 'full'], [FIXTURE, '../escape'], [FIXTURE], []]) {
    const { code, out } = run(root, ...args);
    assert.equal(code, 1, `${args.join(' ')}: ${out}`);
    assert.match(out, /^ERROR /m, out);
    assert.doesNotMatch(out, /\n\s+at /, `stack trace for ${args.join(' ')}`);
  }
  assert.ok(!fs.existsSync(path.join(root, 'evals', 'summaries')), 'nothing written on failure');
});

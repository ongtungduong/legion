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

function tempRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'legion-summarize-'));
  dirs.push(dir);
  return dir;
}

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

const EXPECTED = {
  schemaVersion: 1,
  label: 'full',
  claudeVersion: '9.9.9',
  model: 'sonnet',
  startedAt: '2030-01-02T03:04:05.000Z',
  partial: false,
  costUsd: 1.23,
  judgeCostUsd: 0.03,
  threshold: 0.66,
  bar: 0.66,
  totals: { cases: 2, passed: 1, atBar: 1, meanDelta: 0.5 },
  cases: [
    {
      name: 'alpha-fires',
      runs: 3,
      with: { passRate: 0.6667, meanScore: 0.8333 },
      without: { passRate: 0, meanScore: 0.3333 },
      delta: 0.5,
      graders: { quality: 2, 'skill-fired': 3 },
    },
    {
      name: 'zeta-stays-quiet',
      runs: 2,
      with: { passRate: 0.5, meanScore: 0.5 },
      without: null,
      delta: null,
      graders: { 'not-fired': 1 },
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
  assert.ok(!fs.existsSync(path.join(root, 'evals')), 'nothing written on failure');
});

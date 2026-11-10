// Behavior tests for scripts/make-eval-variant.mjs. Each test generates a
// variant into a temp dir and checks the copy; the drift tests first copy the
// repo, change the source skill, and point the script at it through
// LEGION_ROOT. Zero dependencies (node:test).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKIP = new Set(['.git', 'node_modules', path.join('evals', 'results'), '.legion']);
const SKILL = path.join('skills', 'brainstorming', 'SKILL.md');

const dirs = [];
after(() => { for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true }); });

function tmp(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  dirs.push(dir);
  return dir;
}

function copyRepo() {
  const dir = tmp('legion-variant-src-');
  fs.cpSync(REPO, dir, { recursive: true, filter: (src) => !SKIP.has(path.relative(REPO, src)) });
  return dir;
}

function make(variant, source = REPO) {
  const target = path.join(tmp('legion-variant-'), 'out');
  const res = spawnSync('node', [path.join(REPO, 'scripts', 'make-eval-variant.mjs'), variant, target], {
    encoding: 'utf8',
    env: { ...process.env, LEGION_ROOT: source },
  });
  return { code: res.status, out: `${res.stdout}${res.stderr}`, target };
}

function files(root, dir) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const r = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(root, r));
    else out.push(r);
  }
  return out.sort();
}

const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8');
const section = (text, heading) => text.split(heading)[1].split(/^## /m)[0];
const step = (text, n) => text.match(new RegExp(`^${n}\\. [\\s\\S]*?(?=^\\d+\\. |^\\| Size)`, 'm'))[0];

test('no-hats: brainstorming has no hats left and the copy validates', () => {
  const { code, out, target } = make('no-hats');
  assert.equal(code, 0, out);
  for (const file of files(target, path.join('skills', 'brainstorming'))) {
    assert.doesNotMatch(read(target, file), /\bhats?\b/i, file);
  }
  assert.equal(fs.existsSync(path.join(target, 'skills', 'brainstorming', 'references', 'six-thinking-hats.md')), false);
  assert.match(step(read(target, SKILL), 7), /two or three\s+real alternatives[\s\S]*flip the recommendation/);
  const check = spawnSync('node', [path.join(REPO, 'scripts', 'validate.mjs')], {
    encoding: 'utf8',
    env: { ...process.env, LEGION_ROOT: target },
  });
  assert.equal(check.status, 0, `${check.stdout}${check.stderr}`);
});

test('no-hats: approval gate, intent, sizing, and grilling steps are byte-identical', () => {
  const { code, out, target } = make('no-hats');
  assert.equal(code, 0, out);
  const before = read(REPO, SKILL);
  const variant = read(target, SKILL);
  assert.equal(section(variant, '## The approval gate'), section(before, '## The approval gate'));
  for (const n of [1, 2, 4, 5, 6, 8, 10, 11]) assert.equal(step(variant, n), step(before, n), `step ${n}`);
});

test('no-hats: every file outside skills/brainstorming is copied unchanged', () => {
  const { code, out, target } = make('no-hats');
  assert.equal(code, 0, out);
  const outside = (f) => !f.startsWith(path.join('skills', 'brainstorming') + path.sep);
  for (const dir of ['.claude-plugin', 'hooks', 'skills']) {
    const src = files(REPO, dir).filter(outside);
    assert.deepEqual(files(target, dir).filter(outside), src, dir);
    for (const f of src) assert.equal(read(target, f), read(REPO, f), f);
  }
});

test('baseline: skills are copied unchanged', () => {
  const { code, out, target } = make('baseline');
  assert.equal(code, 0, out);
  const src = files(REPO, 'skills');
  assert.deepEqual(files(target, 'skills'), src);
  for (const f of src) assert.equal(read(target, f), read(REPO, f), f);
});

test('a missing anchor fails and writes nothing', () => {
  const source = copyRepo();
  const p = path.join(source, SKILL);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('7. **Choose the approach with the Six Thinking Hats**', '7. **Pick the approach with the Six Thinking Hats**'));
  const { code, out, target } = make('no-hats', source);
  assert.equal(code, 1, out);
  assert.match(out, /SKILL\.md: anchor not found: "7\. \*\*Choose the approach with the Six Thinking Hats\*\*/);
  assert.equal(fs.existsSync(target), false);
});

test('a new hats mention in the source fails', () => {
  const source = copyRepo();
  const p = path.join(source, 'skills', 'brainstorming', 'references', 'adr-format.md');
  fs.appendFileSync(p, '\nRecord the Black hat line in Consequences.\n');
  const { code, out, target } = make('no-hats', source);
  assert.equal(code, 1, out);
  assert.match(out, /adr-format\.md: still mentions the hats/);
  assert.equal(fs.existsSync(target), false);
});

// Behavior tests for the repo checks. Each test copies the repo to a temp
// dir, applies one defect, and runs a script against the copy through
// LEGION_ROOT. Zero dependencies (node:test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKIP = new Set(['.git', 'node_modules', path.join('evals', 'results'), '.legion']);

function copyRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'legion-validate-'));
  fs.cpSync(REPO, dir, {
    recursive: true,
    filter: (src) => !SKIP.has(path.relative(REPO, src)),
  });
  return dir;
}

function run(script, root) {
  const res = spawnSync('node', [path.join(REPO, 'scripts', script)], {
    encoding: 'utf8',
    env: { ...process.env, LEGION_ROOT: root },
  });
  return { code: res.status, out: `${res.stdout}${res.stderr}` };
}

function edit(root, file, fn) {
  const p = path.join(root, file);
  fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8')));
}

test('clean copy passes', () => {
  const root = copyRepo();
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 0, out);
});

test('link out of the skill root fails', () => {
  const root = copyRepo();
  edit(root, 'skills/defining-terms/references/glossary-format.md', (t) => `${t}\nSee [x](../../brainstorming/SKILL.md).\n`);
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /leaves the skill root/);
});

test('non-executable hook fails', () => {
  const root = copyRepo();
  fs.chmodSync(path.join(root, 'hooks', 'session-start'), 0o644);
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /hooks\/session-start is not executable/);
});

test('missing registered hook fails', () => {
  const root = copyRepo();
  edit(root, 'hooks/hooks.json', (t) => {
    const j = JSON.parse(t);
    j.hooks.PreToolUse = [{ matcher: 'Read', hooks: [{ type: 'command', command: 'bash "${CLAUDE_PLUGIN_ROOT}/hooks/guard"' }] }];
    return JSON.stringify(j, null, 2);
  });
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /hooks\/guard is missing/);
});

test('bad frontmatter is reported, not thrown', () => {
  const root = copyRepo();
  edit(root, 'skills/defining-terms/SKILL.md', (t) => t.replace(/^---\n/, '--\n'));
  const { code, out } = run('trigger-evals.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /frontmatter does not parse/);
  assert.doesNotMatch(out, /TypeError/);
});
